import React from 'react';
import { Link } from 'react-router-dom';

export default class Top extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      path: props.path
    };

    this.webBasePath = props.webBasePath;
  }
  
  render(){
    return (
      <div className="windrunner-top-bar">
        <PathBubbles path={this.state.path} webBasePath={this.webBasePath}/>
        <div className="search">
          <span>search</span>
        </div>
      </div>
    );
  }
}

function PathBubbles(props) {
  let origPath = props.path;
  let webBasePath = props.webBasePath;

  let pathComponents = origPath.split('/');
  let bubbles = [];

  let cumulativePath = '';
  for (let i = 0; i < pathComponents.length; ++i){
    cumulativePath += "/" + pathComponents[i];

    bubbles.push((
        <Link to={webBasePath + cumulativePath } key={'path-component-' + i} >{pathComponents[i]}</Link>
    ));
  }

  return (
    <div className="path-bubbles">
      {bubbles}
    </div>
  );
}