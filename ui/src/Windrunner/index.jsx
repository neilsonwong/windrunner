import React from 'react';
import TopBar from './TopBar';
import DirectoryView from './DirectoryView';
import naturalSort from './DirectoryView/naturalSort';

import * as config from './config';

import './style.css';

const isVideo = new RegExp(/(\.[avimk4]+$)/);

//WindRunner will handle all of the error + loading screens
//also responsibility of loading file data will be WindRunner

export default class WindRunner extends React.Component {
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
    this.updateFilelist();
  }

  componentDidUpdate(prevProps) {
    //url has changed
    if (prevProps.location.pathname !== this.props.location.pathname){
      this.setLoading();
      this.updateFilelist();
    }
  }

  getPath(){
    let directory = this.props.location.pathname;

    //this.state.path is obtained from url and ripping out the preceding string
    return directory.substring(this.props.match.url.length);
  }

  render(){
    console.log('rendering windrunner for ' + this.props.location.pathname)

    return (
      <div className="windrunner">
        <TopBar path={this.getPath()} onSearch={() => console.log('search')}/>
        <DirectoryView files={this.state.files} error={this.state.error} loading={this.state.loading} />
      </div>
    );
  }

  async updateFilelist(){
    let url = this.props.location.pathname;
    //we have 2 kinds of urls
    if (url.indexOf('/search') === 0){
      //search is a special reserved url for searches
      let query = this.props.location.search;
      this.search(query);
    }
    else {
      this.browse();
    }

  }

  async search(query){
    let q = new URLSearchParams(query).get('q');
    console.log(`searching for ${q}`);
    try {
      let data = await fetchData(find(q));
      this.updateDataView(data);
    }
    catch (e){
      console.log(e);

      //unable to fetch; show message
      this.setState({ error: true, loading: false });
    }
  }

  async browse(){
    let path = this.getPath();
    console.log('updating view for ' + path)
    try {
      let data = await fetchData(ls(path));
      this.updateDataView(data);
    }
    catch (e){
      console.log(e);

      //unable to fetch; show message
      this.setState({ error: true, loading: false });
    }
  }

  async updateDataView(data){
    if (Array.isArray(data)){
      let fileList = massageData(data);

      this.setState({ files: fileList, error: false, loading: false });
    }
    else {
      console.log('invalid data received');
    }
  }

  setLoading(){
    this.setState({ loading: true });
  }
}

function fetchData(uri){
  return fetch(uri)
    .then(response => response.json())
}

function ls(dir) {
  return config.listingUrl + 'ls/' + dir;
}

function find(query){
  return config.listingUrl + 'find/' + query;
}

function massageData(data){
  return data
    .filter(filterTrash)
    .map(addPrettyFilename)
    .sort((a, b) => {
      return naturalSort(a.displayName, b.displayName);
    });
}

function filterTrash(file){
  let verdict = file.isDir || isVideo.test(file.name);
  return verdict;
}

function addPrettyFilename(file){
  //massage filenames to be nicer
  file.displayName = file.name.replace(/_/g, ' ').replace(/\[[a-zA-Z0-9\-]+\]/g, '').replace(/(\.[avimk4]+$)/g, '').trim();
  return file;
}