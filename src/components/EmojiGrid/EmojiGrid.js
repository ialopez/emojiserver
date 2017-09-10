import React, { Component } from 'react';
import './EmojiGrid.css';

//const domain = "http://emojify.fun";
const domain = "http://localhost:8080";

/*renders the json object/emoji map object received from the server a a grid of images
*/
class EmojiGrid extends Component {
  render() {
    console.log("domain = ", domain);
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
      const imgElement = <img src={domain + this.props.emojiMap.dictionary[prop]} alt="" style={{width: imgWidth, height: imgWidth}}/>;
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
export default EmojiGrid;