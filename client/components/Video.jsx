import React from 'react';

class Video extends React.Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    // Begin animating the video when it starts playing
    const video = document.querySelector('video');
    this.props.initVoice(video);
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

  syncVideos(video, otherTime) {
    if (Math.floor(video.currentTime) > Math.floor(otherTime) + 0.5 ||
        Math.floor(video.currentTime) < Math.floor(otherTime) - 0.5) {
      video.currentTime = otherTime;
    }
  }

  render() {
    return (
      <div className="video-container">
        <div className="video-border"></div>
        <video
          onPlay={this.props.emitPlayAndListenForPause}
          onPause={this.props.emitPauseAndListenForPlay}
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
