package main

import (
	"bytes"
	"encoding/base64"
	"encoding/json"
	"fmt" //reader writer
	"github.com/ialopez/emojiart"
	"html/template"
	"image"
	_ "image/jpeg"
	"image/png"
	"io"        //used to write read files
	"io/ioutil" //read files
	"log"
	"net/http" //used to handle serve http requests
	"os"       //used to create files in server
	"strconv"
	"strings"
)

var indexPage, _ = ioutil.ReadFile("./main.html/") //read in app starting point from index.html
var resultPage = template.Must(template.ParseFiles("./result.html"))

func openPNG(path string) image.Image {
	file, err := os.Open(path)
	if err != nil {
		log.Fatal(err)
	}

	pic, err := png.Decode(file)
	if err != nil {
		fmt.Println("cannot decode")
		log.Fatal(err)
	}
	return pic
}

//serve main page
func indexHandler(w http.ResponseWriter, r *http.Request) {
	http.ServeFile(w, r, "./build/index.html")
}

//serve result page, seen after submitting picture to server
func resultHandler(w http.ResponseWriter, r *http.Request) {
	r.ParseMultipartForm(32 << 20)
	//get file and handler that was submitted to server
	file, handler, err := r.FormFile("pic")
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	squareSize, err := strconv.Atoi(r.FormValue("squareSize"))
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	platform := r.FormValue("platform")
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	f, err := os.OpenFile("./"+handler.Filename, os.O_WRONLY|os.O_CREATE, 0666)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer f.Close()
	io.Copy(f, file)
	img := openPNG("./" + handler.Filename)
	picToEmoji := emojiart.NewPicToEmoji(squareSize, platform, false, img)
	resultImg := picToEmoji.CreateEmojiArt()

	buffer := new(bytes.Buffer)
	err = png.Encode(buffer, resultImg)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	title := handler.Filename
	str := base64.StdEncoding.EncodeToString(buffer.Bytes())
	data := map[string]string{"Image": str, "Title": title}
	err = resultPage.Execute(w, data)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
}

func picToEmojiHandler(w http.ResponseWriter, r *http.Request) {
	//create struct to represent json object from http request
	type fileInfo struct {
		Data_uri   string `json:"data_uri"`
		Filename   string `json:"filename"`
		Filetype   string `json:"filetype"`
		Platform   string `json:"platform"`
		SquareSize int    `json:"squaresize"`
	}

	var fi fileInfo

	//decode json from the http request body and store it in a fileInfo struct
	decoder := json.NewDecoder(r.Body)
	err := decoder.Decode(&fi)

	//decode image from string representation
	//cut off "data:image/png;base64," prefix
	imageData := fi.Data_uri[strings.IndexByte(fi.Data_uri, ',')+1:]
	reader := base64.NewDecoder(base64.StdEncoding, strings.NewReader(imageData))
	img, _, err := image.Decode(reader)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	picToEmoji := emojiart.NewPicToEmoji(fi.SquareSize, fi.Platform, false, img)

	resultMap := picToEmoji.CreateEmojiArtMap()

	err = json.NewEncoder(w).Encode(resultMap)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
	}

}

func main() {
	//initialize emoji dictionarie
	emojiart.InitEmojiDictAvg()

	http.HandleFunc("/view/", resultHandler)
	http.HandleFunc("/pictoemoji/", picToEmojiHandler)

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

	http.ListenAndServe(":8080", nil)
}
