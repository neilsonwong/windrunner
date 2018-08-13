import React, { Component } from 'react';
import { BrowserRouter, Route } from 'react-router-dom';

import logo from './logo.svg';
import './App.css';
import Windrunner from './Windrunner';

class App extends Component {
  render() {
    return (
      <BrowserRouter>
        <div>
          <Route path="/" component={Windrunner} />
        </div>
      </BrowserRouter>
    );
  }
}

export default App;
