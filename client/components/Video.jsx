import React from 'react';

class Video extends React.Component {
  constructor(props) {
    super(props);

    this.emitPlayAndListenForPause = this.emitPlayAndListenForPause.bind(this);
    this.emitPauseAndListenForPlay = this.emitPauseAndListenForPlay.bind(this);
  }

  componentDidMount() {
    // Begin animating the video when it starts playing
    const video = document.querySelector('video');
    console.log('inside componentDidMount');
    this.initializeVoice(video);

    video.addEventListener('canplay', (e) => {
      video.className += ' video-reveal';
      setTimeout(() => { video.className = 'video'; }, 2000);
    });
  }

  initializeVoice(video) {
    // Initialize annyong voice command library and define commands
    if (annyang) {
      console.log('inside if annyang in initializeVoice');
      var commands = {
        'play': function() {
          console.log('play command received');
          video.play();
          this.emitPlayAndListenForPause(video);
        }
        // TODO: add pause command
      };

      annyang.addCommands(commands);

      annyang.start();
    }
  }

  emitPlayAndListenForPause(eventOrVideo) {
    const video = eventOrVideo.target ? eventOrVideo.target : eventOrVideo;
    this.props.socket.emit('play', video.currentTime);
    this.props.socket.on('pause', (otherTime) => {
      if (Math.floor(video.currentTime) > Math.floor(otherTime) + 0.5 ||
          Math.floor(video.currentTime) < Math.floor(otherTime) - 0.5) {
        video.currentTime = otherTime;
      }
      video.pause();
    });
  }

  emitPauseAndListenForPlay(e) {
    const video = e.target;
    this.props.socket.emit('pause', video.currentTime);
    this.props.socket.on('play', (otherTime) => {
      if (Math.floor(video.currentTime) > Math.floor(otherTime) + 0.5 ||
          Math.floor(video.currentTime) < Math.floor(otherTime) - 0.5) {
        video.currentTime = otherTime;
      }
      video.play();
    });
  }

  render() {
    return (
      <div className="video-container">
        <div className="video-border"></div>
        <video
          onPlay={this.emitPlayAndListenForPause}
          onPause={this.emitPauseAndListenForPlay}
          className="video"
          controls
        >
          <source src="" type="video/mp4"></source>
        </video>
        <div className="video-border"></div>
      </div>
    );
  }
}

Video.propTypes = {
  socket: React.PropTypes.object.isRequired,
};

export default Video;
