package main

import (
	"encoding/base64"
	"encoding/json"
	"flag"
	"github.com/coreos/go-systemd/daemon"
	"github.com/hashicorp/golang-lru"
	"github.com/ialopez/emojiart"
	"image"
	_ "image/jpeg"
	_ "image/png"
	"log"
	"math/rand"
	"net/http" //used to handle serve http requests
	"os"
	"strings"
	"time"
)

var examples []string
var cachedImages *lru.Cache

const MAX_CACHED_IMG_COUNT = 15

//create struct to represent json object from http request
type userData struct {
	Data_uri   string `json:"data_uri"`
	Hash       string `json:"hash"`
	Platform   string `json:"platform"`
	SquareSize int    `json:"squaresize"`
}

/*get json files in /examples/ directory and save them to examples var
 */
func initExamples() {
	//open folder
	folder, err := os.Open("./examples/")
	if err != nil {
		log.Fatal(err)
	}
	defer folder.Close()

	//count files in folder should be less than ten
	names, err := folder.Readdirnames(10)
	if err != nil {
		log.Fatal(err)
	}

	//allocate examples var
	examples = make([]string, len(names))

	//for each file read its contents and save it in examples var
	for i := 0; i < len(names); i++ {
		examples[i] = "./examples/" + names[i]
	}
}

/*serve up a random emoji art example from examples folder
 */
func examplesHandler(w http.ResponseWriter, r *http.Request) {
	randNumber := rand.Float32()
	index := int(randNumber * float32(len(examples)))
	http.ServeFile(w, r, examples[index])
}

/*check if image is cached, return 404 if not found
 */
func picToEmojiCachedHandler(w http.ResponseWriter, r *http.Request) {
	var ud userData

	decoder := json.NewDecoder(r.Body)
	err := decoder.Decode(&ud)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	key := ud.Hash
	element, ok := cachedImages.Get(key)
	if !ok {
		http.Error(w, "image not found", http.StatusNotFound)
		return
	}
	img := element.(*image.NRGBA)

	//create a picToEmoji object, this stores the image and parameters needed to create image
	picToEmoji := emojiart.NewPicToEmoji(ud.SquareSize, ud.Platform, img)
	//run the algorithm to create image, returns a struct
	resultMap := picToEmoji.CreateEmojiArtMap()

	//turn struct into json response
	err = json.NewEncoder(w).Encode(resultMap)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
	}

}

/*images from users are sent to this handler to create emoji image, the result is a json object
that the users browser will use to render the final result
*/
func picToEmojiHandler(w http.ResponseWriter, r *http.Request) {
	var ud userData

	//decode json from the http request body and store it in a fileInfo struct
	decoder := json.NewDecoder(r.Body)
	err := decoder.Decode(&ud)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	//decode image from data_uri
	//cut off "data:image/png;base64," prefix before decoding
	imageData := ud.Data_uri[strings.IndexByte(ud.Data_uri, ',')+1:]
	reader := base64.NewDecoder(base64.StdEncoding, strings.NewReader(imageData))
	img, _, err := image.Decode(reader)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	//create a picToEmoji object, this stores the image and parameters needed to create image
	picToEmoji := emojiart.NewPicToEmoji(ud.SquareSize, ud.Platform, img)
	//run the algorithm to create image, returns a struct
	resultMap := picToEmoji.CreateEmojiArtMap()

	//save image to cached images
	key := ud.Hash
	go cachedImages.Add(key, img)

	//turn struct into json response
	err = json.NewEncoder(w).Encode(resultMap)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
	}

}

func main() {
	//parse flags
	recalculateEmojiDict := flag.Bool("recDict", false, "recalculate emoji dictionary from scratch or use emoji dict json file, false by default")

	//initialize emoji dictionary
	emojiart.InitDataStructs(*recalculateEmojiDict)
	//init num of threads for algorithm to use
	emojiart.InitNumOfThreads()
	//init example pictures
	initExamples()
	//init lru cache
	cachedImages, _ = lru.New(MAX_CACHED_IMG_COUNT)

	http.HandleFunc("/pictoemoji/", picToEmojiHandler)
	http.HandleFunc("/pictoemojicached/", picToEmojiCachedHandler)
	http.HandleFunc("/examples/", examplesHandler)

	//serve emoji images
	http.Handle("/images/apple/", http.StripPrefix("/images/apple/", http.FileServer(http.Dir("../emojiart/apple/"))))
	http.Handle("/images/emojione/", http.StripPrefix("/images/emojione/", http.FileServer(http.Dir("../emojiart/emojione/"))))
	http.Handle("/images/facebook/", http.StripPrefix("/images/facebook/", http.FileServer(http.Dir("../emojiart/facebook/"))))
	http.Handle("/images/facebook-messenger/", http.StripPrefix("/images/facebook-messenger/", http.FileServer(http.Dir("../emojiart/facebook-messenger/"))))
	http.Handle("/images/google/", http.StripPrefix("/images/google/", http.FileServer(http.Dir("../emojiart/google/"))))
	http.Handle("/images/twitter/", http.StripPrefix("/images/twitter/", http.FileServer(http.Dir("../emojiart/twitter/"))))

	//serve app files
	http.Handle("/", http.StripPrefix("/", http.FileServer(http.Dir("./build/"))))
	http.Handle("/static/", http.StripPrefix("/static/", http.FileServer(http.Dir("./build/static/"))))
	http.Handle("/static/css", http.StripPrefix("static/css", http.FileServer(http.Dir("./build/static/css/"))))
	http.Handle("/static/js", http.StripPrefix("static/js", http.FileServer(http.Dir("./build/static/js/"))))
	http.Handle("/static/media", http.StripPrefix("static/media", http.FileServer(http.Dir("./build/static/media"))))

	srv := &http.Server{
		Addr:         ":8080",
		ReadTimeout:  45 * time.Second,
		WriteTimeout: 45 * time.Second,
	}

	//send ready signal to systemd
	daemon.SdNotify(false, "READY=1")
	go func() {
		interval, err := daemon.SdWatchdogEnabled(false)
		if err != nil || interval == 0 {
			return
		}
		for {
			daemon.SdNotify(false, "WATCHDOG=1")
			time.Sleep(interval / 3)
		}
	}()

	srv.ListenAndServe()

}
