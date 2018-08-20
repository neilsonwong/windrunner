import React from 'react';
import { Link } from 'react-router-dom';

export default class Top extends React.Component {
  
  render(){
    return (
      <div className="windrunner-top-bar">
        <PathBubbles path={this.props.path} />
        <div className="search">
          <span>search</span>
        </div>
      </div>
    );
  }
}

function PathBubbles(props) {
  let origPath = props.path;
  // let webBasePath = props.webBasePath;

  let pathComponents = origPath.split('/');
  let bubbles = [];

  let cumulativePath = '';
  for (let i = 0; i < pathComponents.length; ++i){
    cumulativePath += "/" + pathComponents[i];
    console.log(cumulativePath)

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