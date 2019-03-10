import React from 'react';
import './style.css';
import * as config from '../config';


const pinUrl = config.listingUrl + 'pins/add';
const unpinUrl = config.listingUrl + 'pins/del';

export default class Pin extends React.Component {
  constructor(props) {
    super(props);
    this.state = {pinned: props.pinned, path: props.path};

    this.handleClick = this.handleClick.bind(this);
  }

  handleClick() {
    //check initial states
    if (this.state.pinned === true) {
      //remove from pinned
      unpin(this.state.path);
    }
    else {
      //add to pinned
      pin(this.state.path);
    }

    //update the state var
    this.setState(state => ({
      pinned: !state.pinned
    }));
  }

  render() {
    let cssClasses = this.state.pinned ? 'pin-icon pinned' : 'pin-icon';

    return (
      <div className={cssClasses} onClick={this.handleClick}></div>
    );
  }
}

function pin(path) {
  console.log(`pin ${path}`);
  fetch(pinUrl, {
    method: 'POST', // or 'PUT'
    // mode: "no-cors", // no-cors, cors, *same-origin
    body: path, // data can be `string` or {object}!
    headers:{
      'Content-Type': 'text/plain'
    }
  });
}

function unpin(path) {
  console.log(`unpin ${path}`);
  fetch(unpinUrl, {
    method: 'POST', // or 'PUT'
    // mode: "no-cors", // no-cors, cors, *same-origin
    body: path, // data can be `string` or {object}!
    headers:{
      'Content-Type': 'text/plain'
    }
  });
}