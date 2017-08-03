import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';

class App extends Component {
  render() {
    return (
      <div className="App">
        <div className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h2>Welcome to React</h2>
        </div>
        <form action="/view/result.html" method="POST" enctype="multipart/form-data">
            <div>
                <input type="file" name="pic" value="choose file" /><br />
                enter square size<input type="number" name="squareSize" /><br />
                <input type="radio" name="platform" value="apple" />Apple
                <input type="radio" name="platform" value="facebook" />Facebook
                <input type="radio" name="platform" value="twitter" />Twitter
                <input type="radio" name="platform" value="facebook-messenger" />Facebook Messenger
                <input type="radio" name="platform" value="emojione" />emojione
                <div>
                    <input type="submit" value="meme" />
                </div>
            </div>
        </form>
      </div>
    );
  }
}

export default App;
