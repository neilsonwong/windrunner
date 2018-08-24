import React from 'react';
import { Link } from 'react-router-dom';
import './style.css';

import * as config from '../config';

const openFileUrl = config.agentUrl + 'play';
let debounceTime = 0;

export default function FolderView(props){
  let file = props.file;
  let size = formatBytes(file.size);
  let date = file.birthTime.substring(0, 10);

  let bgimg = {
    'backgroundImage': `url("${config.listingUrl}thumb/${encodeURIComponent(file.path)}")`,
    'backgroundSize': 'cover',
    'backgroundPosition': 'center'
  };

  return (
    <div className="file-view" onClick={(evt) => Open(file)} >
      <div className="video-thumbnail" style={bgimg} >
        <div className="video-details">
          <span className="video-size">{size}</span>
          <span className="video-date">{date}</span>
        </div>
      </div>
      <span className="file-name">{props.filename}</span>
    </div>
  );
}

function Open(file){
  let current = Date.now()
  if ((debounceTime + 3000) < current){
    debounceTime = current;

    let formData = new FormData();
    console.log(file.rel)
    formData.append('file', file.rel);

    fetch(openFileUrl, {
      body: formData,
      method: "post"
    });
  }
  else {
    console.log('too fast');
  }
}

function formatBytes(a,b){if(0===a)return"0 Bytes";var c=1024,d=b||2,e=["Bytes","KB","MB","GB","TB","PB","EB","ZB","YB"],f=Math.floor(Math.log(a)/Math.log(c));return parseFloat((a/Math.pow(c,f)).toFixed(d))+" "+e[f]}