import React, { Component } from 'react';
import "./firebase"
import logo from './logo.svg';
import './App.css';
import Cam from "./components/webcam"
import 'typeface-roboto'

class App extends Component {
  render() {
    return (
      <div>

              {/* <style>{'body { background-color: black; }'}</style> */}
      <Cam />
      </div>
      // <div className="App">
      //   <header className="App-header">
      //     <img src={logo} className="App-logo" alt="logo" />
      //     <h1 className="App-title">Welcome to React</h1>
      //   </header>
      //   <p className="App-intro">
      //     To get started, edit <code>src/App.js</code> and save to reload.
      //   </p>
      // </div>
    );
  }
}

export default App;
