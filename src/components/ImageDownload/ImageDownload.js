import React, { Component } from 'react';
import ReactLoading from 'react-loading';
import './ImageDownload.css';

//const domain = "http://emojify.fun";
const domain = "http://localhost:8080";

/*create a download link for user to download image rendered to emojiGrid as a png file
*/ 
class ImageDownload extends Component {
  constructor() {
    super();
    this.state = {
      href: null,
    };
  }

  componentDidMount() {
    //get canvas element
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
          x += emojiLength;
        }
        y += emojiLength;
      }
      //turn image from canvas into a dataURL
      this.refs.canvas.toBlob((blob) => {
        const url = URL.createObjectURL(blob);
        this.setState({
          href: url,
        });
      });

      //data is in the format "data:image/png;base64,.....", modify it to "data:application/octet-stream;base64,.......", else it doesn't work on chrome
      //data = data.slice(data.indexOf(';'), -1);
      //data = "data:application/octet-stream" + data;

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

  componentWillUnmount() {
    //free up object url made for download link
    URL.revokeObjectURL(this.state.href);
  }

  render() {
    let canvas, download, loading;
    if (this.state.href) {
      download = (
        <a href={this.state.href} download="download.png">
          <button>Download</button>
        </a>
      );
    }
    else {
      //note 64x64 is the dimensions of an emoji received from the server
      canvas = <canvas className="invisible-canvas" ref="canvas" height={this.props.emojiMap.mapping.length*64} width={this.props.emojiMap.mapping[0].length*64} />;
      loading = (
        <div className="loading">
          <ReactLoading type="bubbles" color="#444" />
        </div>
      );
    }

    return (
      <div>
        {loading}
        {download}
        {canvas}
      </div>
    )
  }
}

export default ImageDownload;