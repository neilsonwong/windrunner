import React from 'react';
import { Link } from 'react-router-dom';
import './style.css';

export default function FolderView(props){
  let repLetter = props.filename[0];
  return (
    <div className="folder-view">
      <Link to={props.to} onClick={props.onClick}>
        <div className="folder-view-thumbnail">
          <div className="folder-icon"></div>
          {repLetter}
        </div>
        <span className="file-name">{props.filename}</span>
      </Link>
    </div>
  );
}