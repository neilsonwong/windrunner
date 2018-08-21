import React from 'react';
import Top from './Top';
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
      <Top path={dirPath} />
      <DirectoryView path={dirPath} />
    </div>
  );
}
