import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import $ from 'jquery';

class FileForm extends Component {
  render() {
    let picture;
    if (this.props.data_uri) {
      picture = <img src={this.props.data_uri} alt=""/>;
    }
    return (
      <div>
        <input type="file" onChange={this.props.handleFile} />
        <br />
        enter square size<input type="number" onChange={this.props.handleSquareSize} />
        <br />
        <input type="radio" value="apple" onChange={this.props.handlePlatform} checked={this.props.platform === "apple"}/>Apple
        <input type="radio" value="facebook" onChange={this.props.handlePlatform} checked={this.props.platform === "facebook"}/>Facebook
        <input type="radio" value="twitter" onChange={this.props.handlePlatform} checked={this.props.platform === "twitter"}/>Twitter
        <input type="radio" value="facebook-messenger" onChange={this.props.handlePlatform} checked={this.props.platform === "facebook-messenger"}/>Facebook Messenger
        <input type="radio" value="emojione" onChange={this.props.handlePlatform} checked={this.props.platform === "emojione"}/>emojione
        <br />
        <input type="button" value="meme" onClick={this.props.onSubmit}/>
        <br />
        {picture}
      </div>
    );
  }
}

class EmojiGrid extends Component {
  render() {
    const imageLib = {};
    let prop;
    for(prop in this.props.emojiMap.dictionary) {
      console.log(prop);
      const imgElement = <img src={"http://localhost:8080" + this.props.emojiMap.dictionary[prop]} />;
      imageLib[prop] = imgElement;
    }

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
        <div>
          emojigrid
        </div>
        <div className="emoji-grid">
          {grid}
        </div>
      </div>
    );
  }
}

class App extends Component {
  constructor() {
    super();
    this.state = {
      emojiMap: null,
      data_uri: "",
      filename: "",
      filetype: "",
      squareSize: "",
      platform: "apple",
      processing: false,
    }
    this.handleSubmit = this.handleSubmit.bind(this)
    this.handlePlatform = this.handlePlatform.bind(this);
    this.handleSquareSize = this.handleSquareSize.bind(this);
    this.handleFile = this.handleFile.bind(this);
  }

  handleSubmit(event) {
    console.log("submit");
    console.log(this.state);

    this.setState({
      processing: true,
    });

    const promise = $.ajax({
      url: "http://localhost:8080/pictoemoji/",
      type: "POST",
      data: JSON.stringify({
        data_uri: this.state.data_uri,
        filename: this.state.filename,
        filetype: this.state.filetype,
        platform: this.state.platform,
        squaresize: this.state.squareSize,
      }),
      dataType: "json",
    });

    promise.done((data) => {
      console.log("promise done");
      this.setState({
        emojiMap: data,
      });
    })
    .fail((xhr) => {
      console.log("error", xhr);
    })

  }

  handleFile(event) {
    const reader = new FileReader();
    const file = event.target.files[0];

    reader.onload = (upload) => {
      this.setState({
        data_uri: upload.target.result,
        filename: file.name,
        filetype: file.type
      });
    };

    reader.readAsDataURL(file);
  }

  handleSquareSize(event) {
    const num = parseInt(event.target.value, 10);
    if(num)
    {
      this.setState({
        squareSize: num,
      });
    }
  }

  handlePlatform(event) {
    console.log(this.state);
    const platform = event.target.value;
    console.log(platform);
    this.setState({
      platform: platform,
    });
  }

  render() {
    let currentScreen;
    if (this.state.emojiMap) {
      currentScreen = <EmojiGrid emojiMap={this.state.emojiMap}/>
    }
    else if (this.state.processing) {
      currentScreen = <div>processing</div>
    }
    else {
      currentScreen = <FileForm onSubmit={this.handleSubmit} handleFile={this.handleFile} handleSquareSize={this.handleSquareSize} handlePlatform={this.handlePlatform} platform={this.state.platform} data_uri={this.state.data_uri}/>
    }
    return (
      <div className="App">
        <div className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h2>Welcome to React</h2>
        </div>
        {currentScreen}
      </div>
    );
  }
}

export default App;
