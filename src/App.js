import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import $ from 'jquery';
import CryptoJS from 'crypto-js'
import ReactLoading from 'react-loading';
import FileForm from './components/FileForm/FileForm';
import EmojiGrid from './components/EmojiGrid/EmojiGrid';
import ImageDownload from './components/ImageDownload/ImageDownload';

//const domain = "http://emojify.fun";
const domain = "http://localhost:8080";
const debug = true; //set to true if testing with npm start else ImageDownload button crashes app

class App extends Component {
  constructor() {
    super();
    const initData = 
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
    };
    this.handleForm = this.handleForm.bind(this);
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

  //handles all fields and inputs in fileForm element
  handleForm(event) {
    let type = event.target.type;
    console.log(type);
    if (type === "file") {
      const reader = new FileReader();
      const file = event.target.files[0];
      //check if file was selected
      if(file) {
        let img = new Image();
        img.onload = () => {
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

          let formData = this.state.formData;
          formData.fileWidth = img.width;
          formData.fileHeight = img.height;
          formData.min = min;
          formData.max = max;
          formData.squareSize = Math.floor((max+min)/2);
          this.setState({
            formData: formData,
          })
        }

        reader.onload = (upload) => {
          img.src = upload.target.result;
          let formData = this.state.formData;
          formData.data_uri = upload.target.result;
          //get md5 of file, save it to this.key, this.state should not be used if it doesn't contain data to render
          this.hash = CryptoJS.MD5(upload.target.result).toString(CryptoJS.enc.Base64);
          console.log(this.hash);
          this.setState({
            formData: formData,
          });
        };

        reader.readAsDataURL(file);
      }
    }
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
    else if (type === "dropdown") {
      const platform = event.target.value;
      console.log(platform);
      let formData = this.state.formData;
      formData.platform = platform;
      this.setState({
        formData: formData,
      });
    }
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
        });
        console.log("cache successful");
      })
      .fail((xhr) => {
        //if previous ajax request failed send image
        const promise = $.ajax({
          url: domain + "/pictoemoji/",
          type: "POST",
          data: JSON.stringify({
            data_uri: this.state.formData.data_uri,
            platform: this.state.formData.platform,
            squaresize: parsedSquareSize,
            hash: this.hash,
          }),
          dataType: "json",
        });

        promise.done((data) => {
          console.log("emoji map", data);
          this.setState({
            emojiMap: data,
            processing: false,
          });
          console.log("cache miss");
          
        })
        .fail((xhr) => {
          console.log("error", xhr);
          this.setState({
            processing: false,
          });
        })
        }
        );
      }
  }

  render() {
    let emojiGrid, download, loading;
    if(this.state.processing) {
      loading = <ReactLoading type="bubbles" color="#444" />
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
        <div className="App-body">
          <div className="options-box">
            <FileForm
            formData={this.state.formData}
            onChange={this.handleForm}
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