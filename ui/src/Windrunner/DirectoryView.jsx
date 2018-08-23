import React from 'react';
import { Link } from 'react-router-dom';

// const listingUrl = 'http://192.168.0.159:8000/';
const listingUrl = 'http://localhost:8000/';
const agentUrl = 'http://localhost:8080/';
const openFileUrl = agentUrl + 'play';

export default class DirectoryView extends React.Component {
  constructor(props){
    super(props);

    this.state = {
      files: [],
      error: false
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

  async updateDataView(){
    console.log('updating view for ' + this.props.path)
    try {
      let data = await fetchData(ls(this.props.path));

      if (Array.isArray(data)){
        this.setState({ files: data, error: false  });
      }
      else {
        console.log('invalid data received');
      }
    }
    catch (e){
      console.log(e);
      //unable to fetch show message
      this.setState({ error: true });
    }
  }

  render(){
    if (this.state.error){
      return (
        <div className="error">
          <h2>There was an issue connecting to the file server. { listingUrl }</h2>
        </div>
      );
    }
    else {
      let files = this.state.files.map((file) => {
        return this.renderFile(file);
      });

      return (
        <div className="directory-view">
          {files}
        </div>
      );
    }
  }

  renderFile(file) {
    //massage filenames to be nicer
    let filename = file.name.replace(/_/g, ' ').replace(/\[[a-zA-Z0-9\-]+\]/g, '').replace(/(\.[avimk4]+$)/g, '');
    let size = formatBytes(file.size);
    let date = file.birthTime.substring(0, 10);

    if (file.isDir) {
      let repLetter = file.name[0];
      return (
        <div className="folder-view" key={'file-'+file.rel} >
          <Link to={file.rel} >
            <div className="folder-view-thumbnail">
              <div className="folder-icon"></div>
              {repLetter}
            </div>
            <span className="file-name">{filename}</span>
          </Link>
        </div>
      );
    }
    else {
      let bgimg = {
        'backgroundImage': `url("${listingUrl}thumb/${encodeURIComponent(file.path)}")`,
        'backgroundSize': 'cover',
        'backgroundPosition': 'center'
      };

      return (
        <div className="file-view" onClick={(evt) => Open(file)} key={'file-'+file.rel} >
          <div className="video-thumbnail" style={bgimg} >
            <div className="video-details">
              <span className="video-size">{size}</span>
              <span className="video-date">{date}</span>
            </div>
          </div>
          <span className="file-name">{filename}</span>
        </div>
      );
    }
  }
}

function fetchData(uri){
  return fetch(uri)
    .then(response => response.json())
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

function formatBytes(a,b){if(0==a)return"0 Bytes";var c=1024,d=b||2,e=["Bytes","KB","MB","GB","TB","PB","EB","ZB","YB"],f=Math.floor(Math.log(a)/Math.log(c));return parseFloat((a/Math.pow(c,f)).toFixed(d))+" "+e[f]}