import React from 'react';

import LoadingDialog from '../LoadingDialog';
import MessageDialog from '../MessageDialog';
import FolderView from '../FolderView';
import FileView from '../FileView';
import naturalSort from './naturalSort';

import * as config from '../config';
import './style.css';

export default class DirectoryView extends React.Component {
  constructor(props){
    super(props);

    this.state = {
      files: [],
      error: false,
      loading: true 
    };

    this.isVideo = new RegExp(/(\.[avimk4]+$)/);
  }

  componentDidMount() {
    this.setLoading();
    this.updateDataView();
  }

  componentDidUpdate(prevProps) {
    if (this.props.path !== prevProps.path){
      this.setLoading();
      this.updateDataView()
    }
  }

  async updateDataView(){
    console.log('updating view for ' + this.props.path)
    try {
      let data = await fetchData(ls(this.props.path));

      if (Array.isArray(data)){
        let filtered = data.filter((file) => {
          let verdict = file.isDir || this.isVideo.test(file.name);
          // console.log(`${file.name}: ${testy}`);
          return verdict;
        }).map((file) => {
          //massage filenames to be nicer
          file.displayName = file.name.replace(/_/g, ' ').replace(/\[[a-zA-Z0-9\-]+\]/g, '').replace(/(\.[avimk4]+$)/g, '').trim();
          return file;
        })
        .sort((a, b) => {
          // return (a.displayName > b.displayName ? 1 : -1);
          return naturalSort(a.displayName, b.displayName);
        });

        console.log(filtered);

        this.setState({ files: filtered, error: false, loading: false });
      }
      else {
        console.log('invalid data received');
      }
    }
    catch (e){
      console.log(e);
      //unable to fetch show message
      this.setState({ error: true, loading: false });
    }
  }

  setLoading(){
    this.setState({ loading: true });
  }

  render(){
    let inner;
    if (this.state.error){
      inner = (<ConnectError />);
    }
    else if (this.state.loading){
      inner = (<LoadingDialog />);
    }
    else {
      let files = this.state.files.map((file) => {
        return this.renderFile(file);
      });

      inner = files;
    }

    return (
      <div className="directory-view">
        {inner}
      </div>
    );
  }

  renderFile(file) {
    if (file.isDir) {
      return (<FolderView filename={file.displayName} onClick={(evt) => this.setLoading()} to={file.rel} key={'file-' + file.rel} />);
    }
    else {
      return (<FileView filename={file.displayName} file={file} key={'file-' + file.rel} />);
    }
  }
}

function ConnectError(props){
  return (
    <MessageDialog className="error">
      <h2>There was an issue connecting to the file server. { config.listingUrl }</h2>
    </MessageDialog>
  );
}

function fetchData(uri){
  return fetch(uri)
    .then(response => response.json())
}

function ls(dir) {
  return config.listingUrl + 'ls/' + dir;
}