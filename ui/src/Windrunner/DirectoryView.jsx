import React from 'react';
import { Link } from 'react-router-dom';

import './style.css';

const listingUrl = 'http://192.168.0.159:8000/';
const agentUrl = 'http://localhost:8080/';
const openFileUrl = agentUrl + 'play';

export default class DirectoryView extends React.Component {
  constructor(props){
    super(props);

    this.state = {
      files: []
    };
  }

  componentDidMount() {
    this.updateDataView()
  }

  componentDidUpdate(prevProps) {
    if (this.props.path !== prevProps.path){
      this.updateDataView()
    }
  }

  updateDataView(){
    console.log('updating view for ' + this.props.path)
    fetch(ls(this.props.path))
      .then(response => response.json())
      .then(data => {
        if (Array.isArray(data)){
          this.setState({ files: data });
        }
        else {
          console.log('invalid data received');
        }
      });
  }

  render(){
    console.log('rendering folder view with ' + this.state.files.length + ' files');

    let files = this.state.files.map((file) => {
      //{"path":"/Users/neilson/Movies/.DS_Store","isDir":false,"size":24580,"birthTime":"2014-08-22T05:31:27.000Z"}
      return this.renderFile(file);
    });

    return (
      <div className="directory-view">
        {files}
      </div>
    );
  }

  renderFile(file) {
    if (file.isDir) {
      let repLetter = file.name[0];
      return (
        <div className="folder-view" key={'file-'+file.rel} >
          <Link to={file.rel} >
            <div className="folder-view-thumbnail">
              <div className="folder-icon"></div>
              {repLetter}
            </div>
            <span>{file.name}</span>
          </Link>
        </div>
      );
    }
    else {
      return (
        <div className="file-view" onClick={(evt) => Open(file)} key={'file-'+file.rel} >
          <span>{file.name}</span>
        </div>
      );
    }
  }
}

function Open(file){
  console.log("opening file " + file);
  console.log("sending file " + file.rel);
  let formData = new FormData();
  formData.append('file', file.rel);

  fetch(openFileUrl, {
    body: formData,
    method: "post"
  });
}

function ls(dir) {
  return listingUrl + 'ls/' + dir;
}
