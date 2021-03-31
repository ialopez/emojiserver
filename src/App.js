import React, { Component } from 'react';
import './App.css';
import $ from 'jquery';
import CryptoJS from 'crypto-js'
import ReactLoading from 'react-loading';
import FileForm from './components/FileForm/FileForm';
import EmojiGrid from './components/EmojiGrid/EmojiGrid';
import ImageDownload from './components/ImageDownload/ImageDownload';

//const domain = "http://emojify.fun";
const domain = "http://localhost:8080";
const debug = true; //set to true if testing with npm start else ImageDownload button crashes app when testing with npm start

class App extends Component {
  constructor() {
    super();

    this.state = {
      emojiMap: null,
      formData: {
        data_uri: null,
        fileWidth: null,
        fileHeight: null,
        squareSize: null,
        min: null,
        max: null,
        platform: "apple",
      },
      processing: false,
      uploadPercent: 0,
    };
  }

  //request example picture from /examples/ server api
  componentDidMount() {
    this.setState({
      processing: true,
    });
    $.ajax({
      url: domain + "/examples/",
      type: "GET",
      cache: false,
      dataType: "json",
    })
    .done((data) => {
      console.log("emoji map", data);
      this.setState({
        emojiMap: data,
        processing: false,
      });
    })
    .fail((xhr) => {
      console.log("error", xhr);
      this.setState({
        processing: false,
      });
    })
  }

  handleDropdown = (eventKey) => {
    const platform = eventKey;
    console.log(platform);
    let formData = {...this.state.formData};
    formData.platform = platform;

    this.setState({
      formData: formData,
    });
  }

  //handles all fields and inputs in fileForm element
  handleForm = (event) => {
    let type = event.target.type;
    console.log(type);
    //choose file event
    if (type === "file") {
      const reader = new FileReader();
      const file = event.target.files[0];
      //check if file was selected
      if(file) {
        //files must be png or jpeg
        if (file.type !== "image/png" && file.type !== "image/jpeg" ) {
          let formData = {
            platform: "apple",
          };
          this.setState({
            formData: formData,
          });

          console.log("file is not a valid image");
          return
        }
        //files must be under 7.5mb
        if (file.size > 7500000) {
          let formData = {
            platform: "apple",
          };
          this.setState({
            formData: formData,
          });

          console.log("file is too big");
          return
        }

        let img = new Image();
        let formData = this.state.formData;
        
        img.onload = () => {
          //get md5 of file, save it to this.key, this.state should not be used if it doesn't contain data to render
          this.hash = CryptoJS.MD5(formData.data_uri).toString(CryptoJS.enc.Base64);
          console.log(this.hash);

          //calculate min and max values for range slider
          //dimensions of output grid should be at least 10x10 and less than 100x100
          let max, min;
          if(img.height > img.width) {
            max = Math.floor(img.width/10);
            min = Math.ceil(img.width/100);
          }
          else {
            max = Math.floor(img.height/10);
            min = Math.ceil(img.height/100);
          }

          formData.fileWidth = img.width;
          formData.fileHeight = img.height;
          formData.min = min;
          formData.max = max;
          formData.squareSize = Math.floor((max+min)/2);
          this.setState({
            formData: formData,
          });
          console.log("new image set");
        }

        reader.onload = (upload) => {
          formData.data_uri = upload.target.result; //formData will be sent to state in img.onload() to reduce number of set State calls
          img.src = upload.target.result;

        };

        reader.readAsDataURL(file);
      }
    }
    //slider input event
    else if (type === "range") {
      console.log("square size = ", this.state.formData.squareSize);
      const num = event.target.value
      if(num) {
        let formData = this.state.formData;
        formData.squareSize = num;
        this.setState({
          formData: formData,
        });
      }
    }
    //submit button event
    else if (type === "button") {
      //submit form data to server
      this.setState({
        processing: true,
      });

      //see if image is cached on server first
      let parsedSquareSize = parseInt(this.state.formData.squareSize, 10);

      $.ajax({
        url: domain + "/pictoemojicached/",
        type: "POST",
        data: JSON.stringify({
          platform: this.state.formData.platform,
          squaresize: parsedSquareSize,
          hash: this.hash,
        }),
        dataType: "json",
      })
      .done((data) => {
        console.log("emoji map", data);
        this.setState({
          emojiMap: data,
          processing: false,
          uploadPercent: null,
        });
        console.log("cache successful");
      })
      .fail((xhr) => {
        //if previous ajax request failed send image
        this.setState({
          uploadPercent: 0,
        });
        $.ajax({
          //callback below is used to track upload progress of image
          xhr: () => {
            var xhr = new window.XMLHttpRequest();
            xhr.upload.addEventListener("progress", (evt) => {
                if (evt.lengthComputable) {
                  const percentComplete = Math.floor(evt.loaded / evt.total * 100);
                  if (this.state.uploadPercent !== percentComplete) {
                    this.setState({
                      uploadPercent: percentComplete,
                    });
                  }
                }
            }, false);
    
            xhr.addEventListener("progress", (evt) => {
              if (evt.lengthComputable) {
                const percentComplete = Math.floor(evt.loaded / evt.total * 100);
                console.log(percentComplete);
                if (this.state.uploadPercent !== percentComplete) {
                  this.setState({
                    uploadPercent: percentComplete,
                  });
                }
              }
            }, false);    
          return xhr;
          },
          url: domain + "/pictoemoji/",
          type: "POST",
          data: JSON.stringify({
            data_uri: this.state.formData.data_uri,
            platform: this.state.formData.platform,
            squaresize: parsedSquareSize,
            hash: this.hash,
          }),
          dataType: "json",
        })
        .done((data) => {
          console.log("emoji map", data);
          this.setState({
            emojiMap: data,
            processing: false,
            uploadPercent: null,
          });
          console.log("cache miss");
          
        })
        .fail((xhr) => {
          console.log("error", xhr);
          this.setState({
            processing: false,
            uploadPercent: null,
          });
        })
      })
    }
  }

  render() {
    let emojiGrid, download, loading;
    if(this.state.processing) {
      let percentStr;
      if (this.state.uploadPercent) {
        percentStr = "uploading file " + this.state.uploadPercent + "%";
      }
      loading = (
        <div>
          {percentStr}
          <ReactLoading type="bubbles" color="#444" />
        </div>
      );
    }
    else if(this.state.emojiMap) {
      emojiGrid = <EmojiGrid emojiMap={this.state.emojiMap}/>;
      if(!debug) {
        download = <ImageDownload emojiMap={this.state.emojiMap}/>;
      }
    }
    return (
      <div className="App">
        <div className="App-header">
          <h2 style={{color: "#fff"}}>Emojify</h2>
        </div>
        <div className="App-body d-flex flex-column">
          <div className="options-box">
            <FileForm
              formData={this.state.formData}
              onChange={this.handleForm}
              onDropdownChange={this.handleDropdown}
            />
            {download}
          </div>
          {loading}
          {emojiGrid}
        </div>
      </div>
    );
  }
}

export default App;