import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import $ from 'jquery';

class FileForm extends Component {
  constructor() {
    super();
    this.state = {
      data_uri: "",
      filename: "",
      filetype: "",
      squareSize: "",
      platform: "apple",
      processing: false,
      response: "",
    };
    this.handlePlatform = this.handlePlatform.bind(this);
    this.handleSquareSize = this.handleSquareSize.bind(this);
    this.handleFile = this.handleFile.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
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

  handleSubmit(event) {
    event.preventDefault();
    const _this = this;

    this.setState({
      processing: true,
    })

    console.log(this.state.squareSize)

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
      this.setState({
        processing: false,
        response: data.uri,
      });
      console.log(data)
    });

  }

  render() {
    let picture;
    if (this.state.data_uri) {
      picture = <img src={this.state.data_uri} alt=""/>;
    }
    return (
      <div>
        <form onSubmit={this.handleSubmit} encType="multipart/form-data">
          <input type="file" onChange={this.handleFile} />
          <br />
          enter square size<input type="number" onChange={this.handleSquareSize} />
          <br />
          <input type="radio" value="apple" onChange={this.handlePlatform} checked={this.state.platform === "apple"}/>Apple
          <input type="radio" value="facebook" onChange={this.handlePlatform} checked={this.state.platform === "facebook"}/>Facebook
          <input type="radio" value="twitter" onChange={this.handlePlatform} checked={this.state.platform === "twitter"}/>Twitter
          <input type="radio" value="facebook-messenger" onChange={this.handlePlatform} checked={this.state.platform === "facebook-messenger"}/>Facebook Messenger
          <input type="radio" value="emojione" onChange={this.handlePlatform} checked={this.state.platform === "emojione"}/>emojione
          <br />
          <input type="submit" value="meme" />
        </form>
        {picture}
      </div>
    );
  }
}


class App extends Component {

  render() {
    return (
      <div className="App">
        <div className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h2>Welcome to React</h2>
        </div>
        <FileForm />
        test
      </div>
    );
  }
}

export default App;
