import React from 'react';
import './style.css';

export default function MessageDialog(props){
  let classes = 'message-dialog' + (props.className ? ' ' + props.className : '');
  return (
    <div className={classes}>
   	  {props.children}
    </div>
  );
}
