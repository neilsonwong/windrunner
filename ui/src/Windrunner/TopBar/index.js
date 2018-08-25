import React from 'react';
import { Link } from 'react-router-dom';
import './style.css';

export default class TopBar extends React.Component {
  constructor(props){
    super(props);
  }

  render(){
    return (
      <div className="windrunner-top-bar" >
        <PathBubbles path={this.props.path} />
        <div className="top-bar-search">
          <input type="text" />
          <button className="search-button" onClick={this.props.onSearch} >search</button>
        </div>
      </div>
    );
  }
}

function PathBubbles(props) {
  let origPath = props.path;

  let pathComponents = origPath.split('/');
  let bubbles = [];
  let cumulativePath = '';

  //push the home path
  bubbles.push((
    <Link className="bread-crumb bread-crumb-root" to={'/'} key={'path-component-o'} >home</Link>
  ));
  
  if (origPath.length > 0) {
    for (let i = 0; i < pathComponents.length; ++i){
      cumulativePath += "/" + pathComponents[i];

      bubbles.push((
        <div className="spacer">></div>
      ));
      bubbles.push((
        <Link className="bread-crumb" to={ cumulativePath } key={'path-component-' + i} >{pathComponents[i]}</Link>
      ));
    }
  }

  return (
    <div className="path-bubbles">
      {bubbles}
    </div>
  );
}