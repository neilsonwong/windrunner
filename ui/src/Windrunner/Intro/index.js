import React from 'react';
import './style.css';

export default class Intro extends React.Component {
  constructor(props){
    super(props);
    this.secret = '';
    this.state = {
      ready: false
    };

    this.handleKeydown = this.handleKeydown.bind(this);
    this.bypass = this.bypass.bind(this);
  }

  componentDidMount(){
    document.addEventListener('keydown', this.handleKeydown, false);
  }

  componentWillUnmount(){
    document.removeEventListener('keydown', this.handleKeydown);
  }

  handleKeydown(e){
    let letter = String.fromCharCode(e.keyCode);
    if (letter.match(/[a-zA-Z0-9]/i)) {
      console.log('adding letter to easter egg: ' + letter);
      this.secret += letter;

      if (this.secret === '224P') {
        console.log('easter egg activated');
        this.setState({ ready: true });
      }
    }
  }

  bypass(){
    localStorage.setItem('windrunner-user', this.user.value);
    console.log('registered as ' + this.user.value);
  }

  render(){
    let what = (<section><p>WindRunner is my home grown <span className="cross-out">project</span> solution to streaming media at home. Basically it's a lighter version of plex that suits my own needs.</p></section>);
    let why = (<section><p> It grew out of my desire to store all my pictures, videos, music, and miscellaneous files on my local area network. The simplest approach was to utilize my already existing raspberry pi. In the end, what I ended up with is a basically a file explorer on the browser launching applications natively. </p></section>);
    let how = (
      <section>
        <p>There are three main parts to the application. </p>
        <p>The web UI is responsible for graphical interface. This is done in reactJs. </p>
        <p>There is an agent installed on each machine as a client service. This handles the automatic mounting of the shared folders. The agent also opens the files when the user clicks on them in the web ui. The agent is written golang and compiles to binaries for windows, osx, and linux. </p>
        <p>The file share server also hosts an additional interfacing server to show information about directories and files themselves. Thumbnail generation for videos is done on the fly here. The first time a thumbnail is requested, if it doesn't exist it is generated. NodeJs was used for simplicity and speed of development. </p>
      </section>
    );

    if (this.state.ready) {
      return (
        <div>
          <input type="text" ref={user => this.user = user } placeholder="name" />
          <button onClick={ this.bypass } >let's go</button>
        </div>
      );
    }

    return (
      <div className="windrunner-intro">
        <div className="intro-main">
          <div className="windrunner-logo"></div>
          <div className="windrunner-title"><h1>WindRunner</h1></div>
          <div className="windrunner-subheading"></div>
          <Subsection title="What is this?" content={what} />
          <Subsection title="Why did you do this?" content={why} />
          <Subsection title="How did you this?" content={how} />

          <div className="intro-video">
            <h3>Look ma!!</h3>
            <video controls>
              <source src="/windrunner.webm" type="video/webm" />
            </video>
          </div>

          <div className="intro-footer">
            The project is hosted on <a href="https://github.com/neilsonwong/windrunner">Github</a>.
          </div>
        </div>
      </div>
    );
  }
}

function Subsection(props){
  return (
    <div className="intro-subsection">
      <div className="intro-subsection-title">
        <h2>{props.title}</h2>
      </div>
      <div className="intro-subsection-text">
        {props.content}
      </div>
    </div>
  );
}