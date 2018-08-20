import React, { Component } from 'react';
import { BrowserRouter, Route } from 'react-router-dom';

import Windrunner from './Windrunner';

class App extends Component {
  render() {
    return (
      <BrowserRouter>
        <div>
          <Route component={Windrunner} />
        </div>
      </BrowserRouter>
    );
  }
}

export default App;
