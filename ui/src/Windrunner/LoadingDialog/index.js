import React from 'react';
import './style.css';

export default class LoadingDialog extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      dots: ''
    };
  }

  componentDidMount() {
    this.timerID = setInterval(
      () => this.tick(),
      1000
    );
  }

  componentWillUnmount() {
    clearInterval(this.timerID);
  }

  tick(){
    this.setState((prevState) => ({
      dots: prevState.dots.length > 3 ? '' : prevState.dots + '.'
    }));
  }

  render(){
    return (
      <div className="loading">
        <div className="loading-animation"></div>
        <h2>loading{this.state.dots}</h2>
      </div>
    );
  }
}