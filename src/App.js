import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import $ from 'jquery';

var domain = "http://localhost:8080";

//form to collect image from user and other options
class FileForm extends Component {
  render() {
    console.log(this.props.formData);
    let picture;
    if (this.props.data_uri) {
      picture = <img src={this.props.formData.data_uri} alt=""/>;
    }
    let dimensions;
    if (this.props.formData.fileHeight && this.props.formData.fileWidth) {
      let resultWidth, resultHeight;
      resultHeight = Math.floor(this.props.formData.fileHeight / this.props.formData.squareSize);
      resultWidth = Math.floor(this.props.formData.fileWidth/ this.props.formData.squareSize);
      dimensions = resultWidth.toString() + "x" + resultHeight.toString();
      dimensions = <div>{dimensions}</div>;
    }
    let rangeInput;
    if (this.props.formData.squareSize) {
      rangeInput = (
      <div>
        <input className="square-size-slider" type="range" min={this.props.formData.min} max={this.props.formData.max} step="1" value={this.props.formData.squareSize} onChange={this.props.onChange} />
      </div>
      );
    }

    return (
      <div>
        <label className="custom-file-upload">
          <input className="input-file" type="file" onChange={this.props.onChange} />
          Choose an Image
        </label>
        <br />
        {dimensions}
        {rangeInput}
        <br />
        <div className="radio-buttons">
          <div>
            <input type="radio" value="apple" onChange={this.props.onChange} checked={this.props.formData.platform === "apple"}/>Apple
          </div>
          <div>
            <input type="radio" value="google" onChange={this.props.onChange} checked={this.props.formData.platform === "google"}/>Google
          </div>
          <div>
            <input type="radio" value="facebook" onChange={this.props.onChange} checked={this.props.formData.platform === "facebook"}/>Facebook
          </div>
          <div>
            <input type="radio" value="facebook-messenger" onChange={this.props.onChange} checked={this.props.formData.platform === "facebook-messenger"}/>Facebook Messenger
          </div>
          <div>
            <input type="radio" value="twitter" onChange={this.props.onChange} checked={this.props.formData.platform === "twitter"}/>Twitter
          </div>
          <div>
            <input type="radio" value="emojione" onChange={this.props.onChange} checked={this.props.formData.platform === "emojione"}/>emojione
          </div>
        </div>
        <br />
        <input type="button" value="create" onClick={this.props.onChange}/>
      </div>
    );
  }
}

class EmojiGrid extends Component {
  render() {
    let height, width;
    //calculate height and width value needed to fit picture onto page
    if(this.props.emojiMap.mapping.length > this.props.emojiMap.mapping[0].length) {
      //height is larger than width
      height = 1000;
      width = 1000 * (this.props.emojiMap.mapping[0].length / this.props.emojiMap.mapping.length);
    }
    else {
      //width is larger than height
      width = 1000;
      height = 1000 * (this.props.emojiMap.mapping.length / this.props.emojiMap.mapping[0].length);
    }
    //convert to percentage strings
    height = parseInt(height, 10);
    width = parseInt(width, 10);
    height = height + "px";
    width = width + "px";

    //calculate image width
    let imgWidth = 100 / this.props.emojiMap.mapping[0].length;
    imgWidth = parseFloat(imgWidth);
    imgWidth = imgWidth + "%";

    //create a library of emojis from emojiMap.dictionary that is used to build the resulting emoji grid
    const imageLib = {};
    let prop;
    for(prop in this.props.emojiMap.dictionary) {
      const imgElement = <img src={"http://localhost:8080" + this.props.emojiMap.dictionary[prop]} alt="" style={{width: imgWidth}}/>;
      imageLib[prop] = imgElement;
    }

    //build emoji grid
    const grid = [];
    for (let i = 0; i < this.props.emojiMap.mapping.length; i++) {
      const images = [];
      for (let j = 0; j < this.props.emojiMap.mapping[0].length; j++) {
        images.push(imageLib[this.props.emojiMap.mapping[i][j]]);
      }
      const row = <div className="emoji-grid-row">{images}</div>;
      grid.push(row);
    }

    return (
      <div>
        <div className="emoji-grid" style={{width: width, height: height}}>
          {grid}
        </div>
      </div>
    );
  }
}

/*
//draws json object received from server as a grid of emojis
class EmojiCanvas extends Component {
  constructor(props) {
    super(props);
    //state contains height, and width fields
    this.state = this.calcHeightWidth();
    this.drawCanvas = this.drawCanvas.bind(this);
    this.calcHeightWidth = this.calcHeightWidth.bind(this);
  }

  calcHeightWidth() {
    //find height and width of canvas
    let height, width;
    //the longest side of the image is limited to 1000px, calculate width or height needed to maintain original ratio of image
    if(this.props.emojiMap.mapping.length > this.props.emojiMap.mapping[0].length) {
      //height is larger than width
      height = 1000;
      width = 1000 * (this.props.emojiMap.mapping[0].length / this.props.emojiMap.mapping.length);
    }
    else {
      //width is larger than height
      width = 1000;
      height = 1000 * (this.props.emojiMap.mapping.length / this.props.emojiMap.mapping[0].length);
    }

    return {
      width: width,
      height: height,
    };
  }

  componentDidMount() {
    console.log("component mounted");
    this.drawCanvas();
  }

  drawCanvas() {
    console.log("download button clicked");
    //create canvas element
    const ctx = this.refs.canvas.getContext("2d");

    //calculate size of each emoji to fit into height and width of canvas
    const imgLength = this.state.height / this.props.emojiMap.mapping.length;
    console.log(this.state);

    //follow similar procedure in emojigrid, download emojis and build result on canvas using emojiMap
    const imageLib = {};

    //draw images onto canvas
    let createImage = () => {
      let y = 0;
      for(let i = 0; i < this.props.emojiMap.mapping.length; i++) {
        let x = 0;
        for(let j = 0; j < this.props.emojiMap.mapping[0].length; j++) {
          const index = this.props.emojiMap.mapping[i][j];
          const img = imageLib[index];
          ctx.drawImage(img, x, y, imgLength, imgLength);
          console.log("x = ", x, "y = ", y);
          x += imgLength;
        }
        y += imgLength;
      }
    };

    //load images from server required call create image when done
    let prop;
    let imgCount = 0;
    for(prop in this.props.emojiMap.dictionary) {
      const img = new Image();
      img.onload = () => {
        //increase number of images loaded so far it is equal to the length of the dictionary then call createImage()
        imgCount++;
        if(imgCount === Object.keys(this.props.emojiMap.dictionary).length) {
          createImage();
        }
      };

      img.src = domain + "/" + this.props.emojiMap.dictionary[prop];
      //add image to image library
      imageLib[prop] = img;
    }
  }

  render() {
    return (
      <div>
        <canvas ref="canvas" width={this.state.width} height={this.state.height} />
      </div>
    );
  }
}
*/

//features options for emoji grid such as downloading image 
class EmojiGridOptions extends Component {
  constructor() {
    super();
    this.state = {
      href: null,
    };
  }

  componentDidMount() {
    //create canvas element
    const ctx = this.refs.canvas.getContext("2d");

    //follow similar procedure in emojigrid, download emojis and build result on canvas using emojiMap
    const imageLib = {};

    //emoji images are 64x64 px
    const emojiLength = 64;
    //draw images onto canvas
    let createImage = () => {
      //first draw a white background on canvas
      ctx.fillStyle="#FFFFFF";
      ctx.fillRect(0, 0, this.refs.canvas.width, this.refs.canvas.height);

      //draw emojis ontop of white layer
      let y = 0;
      for(let i = 0; i < this.props.emojiMap.mapping.length; i++) {
        let x = 0;
        for(let j = 0; j < this.props.emojiMap.mapping[0].length; j++) {
          const index = this.props.emojiMap.mapping[i][j];
          const img = imageLib[index];
          ctx.drawImage(img, x, y);
          console.log("x = ", x, "y = ", y);
          x += emojiLength;
        }
        y += emojiLength;
      }
      //return image in as a data string
      this.setState({
        href: this.refs.canvas.toDataURL(),
      });
    };

    //load images needed from server, call create image when done
    let prop;
    let imgCount = 0;
    for(prop in this.props.emojiMap.dictionary) {
      const img = new Image();
      img.onload = () => {
        //increase number of images loaded so far it is equal to the length of the dictionary then call createImage()
        imgCount++;
        if(imgCount === Object.keys(this.props.emojiMap.dictionary).length) {
          createImage();
        }
      };

      img.src = domain + "/" + this.props.emojiMap.dictionary[prop];
      //add image to image library
      imageLib[prop] = img;
    }
  }

  render() {
    let canvas, download;
    if (this.state.href) {
      download = (
        <a href={this.state.href} download="output.png">
          Download
        </a>
      );
    }
    else {
      //note 64x64 is the dimensions of an emoji received from the server
      canvas = <canvas className="invisible-canvas" ref="canvas" height={this.props.emojiMap.mapping.length*64} width={this.props.emojiMap.mapping[0].length*64} />;
    }

    return (
      <div>
        {download}
        {canvas}
      </div>
    )
  }
}

class App extends Component {
  constructor() {
    super();
    const initData = 
    this.state = {
      emojiMap: null,
      formData: {
        data_uri: null,
        filename: null,
        filetype: null,
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

  //handles all fields and inputs in fileForm element
  handleForm(event) {
    let type = event.target.type;
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
          formData.filename = file.name;
          formData.filetype = file.type;
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
    else if (type === "radio") {
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

      let parsedSquareSize = parseInt(this.state.formData.squareSize, 10);
      const promise = $.ajax({
        url: domain + "/pictoemoji/",
        type: "POST",
        data: JSON.stringify({
          data_uri: this.state.formData.data_uri,
          filename: this.state.formData.filename,
          filetype: this.state.formData.filetype,
          platform: this.state.formData.platform,
          squaresize: parsedSquareSize,
        }),
        dataType: "json",
      });

      promise.done((data) => {
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
  }

  render() {
    let emojiGrid, emojiOptions;
    if(this.state.emojiMap) {
      emojiGrid = <EmojiGrid emojiMap={this.state.emojiMap}/>;
      emojiOptions = <EmojiGridOptions emojiMap={this.state.emojiMap}/>;
    }


    console.log(this.state.formData);

    return (
      <div className="App">
        <div className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h2>Emojify</h2>
        </div>
        <div className="App-body">
          <div className="side-pane">
            <FileForm
            formData={this.state.formData}
            onChange={this.handleForm}
            />
            {emojiOptions}
          </div>
          {emojiGrid}
        </div>
      </div>
    );
  }
}

export default App;
