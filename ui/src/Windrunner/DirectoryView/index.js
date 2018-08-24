import React from 'react';

import LoadingDialog from '../LoadingDialog';
import FolderView from '../FolderView';
import FileView from '../FileView';

import * as config from '../config';

export default class DirectoryView extends React.Component {
  constructor(props){
    super(props);

    this.state = {
      files: [],
      error: false,
      loading: true 
    };
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
        this.setState({ files: data, error: false, loading: false });
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
    //massage filenames to be nicer
    let filename = file.name.replace(/_/g, ' ').replace(/\[[a-zA-Z0-9\-]+\]/g, '').replace(/(\.[avimk4]+$)/g, '');

    if (file.isDir) {
      return (<FolderView filename={filename} onClick={(evt) => this.setLoading()} to={file.rel} key={'file-' + file.rel} />);
    }
    else {
      return (<FileView filename={filename} file={file} key={'file-' + file.rel} />);
    }
  }
}

function ConnectError(props){
  return (
    <div className="error">
      <h2>There was an issue connecting to the file server. { config.listingUrl }</h2>
    </div>
  );
}

function fetchData(uri){
  return fetch(uri)
    .then(response => response.json())
}

function ls(dir) {
  return config.listingUrl + 'ls/' + dir;
}