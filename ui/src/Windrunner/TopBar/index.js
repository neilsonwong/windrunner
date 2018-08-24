import React from 'react';
import { Link } from 'react-router-dom';

export default function TopBar(props) {
  return (
    <div className="windrunner-top-bar">
      <PathBubbles path={props.path} />
      <div className="search">
        <span>search</span>
      </div>
    </div>
  );
}

function PathBubbles(props) {
  let origPath = props.path;

  let pathComponents = origPath.split('/');
  let bubbles = [];

  let cumulativePath = '';
  
  for (let i = 0; i < pathComponents.length; ++i){
    cumulativePath += "/" + pathComponents[i];
    bubbles.push((
        <Link to={ cumulativePath } key={'path-component-' + i} >{pathComponents[i]}</Link>
    ));
  }

  return (
    <div className="path-bubbles">
      {bubbles}
    </div>
  );
}