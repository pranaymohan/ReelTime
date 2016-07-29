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
    this.initVoice(video);
    this.initListeners(video);

    video.addEventListener('canplay', (e) => {
      video.className += ' video-reveal';
      setTimeout(() => { video.className = 'video'; }, 2000);
    });
  }

  initListeners(video) {
    this.props.socket.on('play', (otherTime) => {
      this.syncVideos(video, otherTime);
      video.play();
    });

    this.props.socket.on('pause', (otherTime) => {
      this.syncVideos(video, otherTime);
      video.pause();
    });

    this.props.socket.on('go back', (otherTime) => {
      console.log('go back message received, about to sync');
      this.syncVideos(video, otherTime);
    });
  }

  initVoice(video) {
    // Initialize annyong voice command library and define commands
    if (annyang) {
      var commands = {
        'play': () => {
          console.log('play voice command received');
          video.play();
          this.emitPlayAndListenForPause(video);
        },
        'pause': () => {
          console.log('pause voice command received');
          video.pause();
          this.emitPauseAndListenForPlay(video);
        },
        'go back': () => {
          console.log('go back voice command received');
          video.currentTime = Math.floor(video.currentTime - 10, 0);
          this.emitGoBack(video);
        },
        'mute': () => {
          console.log('mute voice command received');
          video.muted = true;
        },
        'unmute': () => {
          console.log('unmute voice command received');
          video.muted = false;
        }
      };

      annyang.debug();
      annyang.addCommands(commands);
      annyang.start();

      setInterval(function() {
        var listen = annyang.isListening();
        console.log('listen:', listen);
      }, 1000);

      annyang.addCallback('error', function(err) {
        console.log('annyang error:', err);
      });
    }
  }

  syncVideos(video, otherTime) {
    if (Math.floor(video.currentTime) > Math.floor(otherTime) + 0.5 ||
        Math.floor(video.currentTime) < Math.floor(otherTime) - 0.5) {
      video.currentTime = otherTime;
    }
  }

  emitPlayAndListenForPause(eventOrVideo) {
    const video = eventOrVideo.target ? eventOrVideo.target : eventOrVideo;
    this.props.socket.emit('play', video.currentTime);
  }

  emitPauseAndListenForPlay(eventOrVideo) {
    const video = eventOrVideo.target ? eventOrVideo.target : eventOrVideo;
    this.props.socket.emit('pause', video.currentTime);
  }

  emitGoBack(video) {
    // this method will only ever be passed a video, never an event
    this.props.socket.emit('go back', video.currentTime);
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
