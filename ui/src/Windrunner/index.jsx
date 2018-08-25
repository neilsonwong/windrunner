import React from 'react';
import TopBar from './TopBar';
import DirectoryView from './DirectoryView';

import './style.css';

export default function WindRunner(props){
  let directory = props.location.pathname;

  //this.state.path is obtained from url and ripping out the preceding string
  let dirPath = directory.substring(props.match.url.length);

  console.log('rendering windrunner for ' + directory)
  console.log(dirPath)

  return (
    <div className="windrunner">
      <TopBar path={dirPath} />
      <DirectoryView path={dirPath} />
    </div>
  );
}
