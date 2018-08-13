import React from 'react';

// import './style.css';
const listingUrl = 'http://localhost:8000/';
const agentUrl = 'http://localhost:8080/';
const openFileUrl = agentUrl + 'play';

export default class FolderView extends React.Component {
  constructor(props){
    super(props);

    this.state = {
      files: []
    };

    this.path = props.path;
    this.webBasePath = props.webBasePath;
  }

  componentDidMount() {
    fetch(ls(this.path))
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
      return (
        <FileView file={file} key={ 'file-view-' + file.name }/>
      );
    });

    return (
      <div className="folder-view">
        {files}
      </div>
    );
  }
}

function FileView(props){
  let file = props.file;
  return (
    <div className="file-view" onClick={(evt) => Open(file)} >
      <span>{file.name}</span>
    </div>
  );
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