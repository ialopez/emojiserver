package main

import (
	"bytes"
	"encoding/base64"
	"fmt" //reader writer
	"github.com/ialopez/emojiArt"
	"html/template"
	"image"
	"image/png"
	"io"        //used to write read files
	"io/ioutil" //read files
	"log"
	"net/http" //used to handle serve http requests
	"os"       //used to create files in server
	"strconv"
)

var mainPage, _ = ioutil.ReadFile("./main.html") //read in main page from main.html
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
func mainHandler(w http.ResponseWriter, r *http.Request) {
	fmt.Fprint(w, string(mainPage))
}

//serve result page, seen after submitting picture to server
func resultHandler(w http.ResponseWriter, r *http.Request) {
	r.ParseMultipartForm(32 << 20)
	//get file and handler that was submitted to server
	file, handler, err := r.FormFile("pic")
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
	picToEmoji := emojiArt.NewPicToEmoji(squareSize, platform, false, img)
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

func main() {
	emojiArt.InitEmojiDict()
	emojiArt.InitEmojiDictAvg()
	http.HandleFunc("/", mainHandler)
	http.HandleFunc("/view/", resultHandler)
	http.ListenAndServe(":8080", nil)
}
