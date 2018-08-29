import React from 'react';
import { Link, Redirect } from 'react-router-dom';
import './style.css';

export default class TopBar extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      search: null
    };
    this.handleSearch = this.handleSearch.bind(this);
  }

  render(){
    return (
      <div className="windrunner-top-bar" >
        <PathBubbles path={this.props.path} />
        <div className="top-bar-search">
          <input type="text" ref={q => this.searchBox = q } />
          <button className="search-button" onClick={ this.handleSearch } >search</button>
        </div>
      </div>
    );
  }

  //we assume searchFunction just needs to be called and passed in the querystring
  handleSearch(){
    if (this.searchBox.value !== ''){
      console.log("searching for " + this.searchBox.value);
      this.props.onSearch(this.searchBox.value);
    }
    else {
      return;
    }
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
        <div className="spacer" key={'spacer-'+i}>></div>
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