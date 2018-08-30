import React from 'react';

import LoadingDialog from '../LoadingDialog';
import MessageDialog from '../MessageDialog';
import FolderView from '../FolderView';
import FileView from '../FileView';

import * as config from '../config';
import './style.css';

export default function DirectoryView(props){
  let inner;
  if (props.error){
    inner = (<ConnectError />);
  }
  else if (props.loading){
    inner = (<LoadingDialog />);
  }
  else {
    let files = props.files.map((file) => {
      return renderFile(file);
    });

    inner = files;
  }

  return (
    <div className="directory-view">
      {inner}
    </div>
  );
}

function renderFile(file) {
  if (file.isDir) {
    return (<FolderView filename={file.displayName} to={file.rel} key={'file-' + file.rel} />);
  }
  else {
    return (<FileView filename={file.displayName} file={file} key={'file-' + file.rel} />);
  }
}

function ConnectError(props){
  return (
    <MessageDialog className="error">
      <h2>There was an issue connecting to the file server. { config.listingUrl }</h2>
    </MessageDialog>
  );
}
