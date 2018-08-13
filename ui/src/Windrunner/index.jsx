import React from 'react';
import Top from './Top';
import FolderView from './FolderView';

// import './style.css';

export default class WindRunner extends React.Component {
  constructor(props){
    super(props);
    this.directory = this.props.location.pathname;

    //this.state.path is obtained from url and ripping out the preceding string
    let dirPath = this.directory.substring(this.props.match.url.length);
    
    this.state = {
      path: dirPath
    };
  }

  render(){
    console.log('rendering windrunner for ' + this.state.path)
    return (
      <div className="WindRunner">
        <Top path={this.state.path} webBasePath={this.url} />
        <FolderView path={this.state.path} webBasePath={this.url} />
      </div>
    );
  }
}