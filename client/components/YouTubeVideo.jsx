import React from 'react';
import ReactPlayer from 'react-player'

class YouTubeVideo extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      playing: false,
      played: 0,
      loaded: 0,
      duration: 0,
    }

    this.emitPlayAndListenForPause = this.emitPlayAndListenForPause.bind(this);
    this.emitPauseAndListenForPlay = this.emitPauseAndListenForPlay.bind(this);
    this.onProgress = this.onProgress.bind(this);
  }

  componentDidMount() {
    this.props.socket.on('progress', (otherProgress) => {
      console.log('this played:', this.state.played, 'otherplayed:', otherProgress.played);
      // Sync videos if they are way off:
      this.syncVideos(this.state.played, otherProgress.played);
    });
  }

  emitPlayAndListenForPause() {
    this.props.socket.emit('play', { played: this.state.played, loaded: this.state.loaded });
    this.props.socket.on('pause', (otherFraction) => {
      // console.log('thisplayed:', this.state.played, 'otherplayed:', otherFraction.played);
      // this.syncVideos(this.state.played, otherFraction.played);
      this.setState({ 
        playing: false,
      });
    });
  }

  emitPauseAndListenForPlay() {
    this.props.socket.emit('pause', { played: this.state.played, loaded: this.state.loaded });
    this.props.socket.on('play', (otherFraction) => {
      // console.log('thisplayed:', this.state.played, 'otherplayed:', otherFraction.played);
      // this.syncVideos(this.state.played, otherFraction.played);
      this.setState({ 
        playing: true,
      });
    });
  }

  syncVideos(currentPlayedFraction, otherPlayedFraction) {
    var currentTime = Math.floor(currentPlayedFraction * this.state.duration);
    var otherTime = Math.floor(otherPlayedFraction * this.state.duration);

    if (currentTime > otherTime + 0.5 || currentTime < otherTime - 0.5) {
      this.refs.player.seekTo(otherPlayedFraction);
    }
  }

  onProgress(state) {
    this.setState(state);
    // emit the progress of the video so server can listen and keep the two peers in sync
    this.props.socket.emit('progress', state);
  }

  render () {
    return (
      <ReactPlayer
        ref='player'
        url={ this.props.url }
        controls
        playing={ this.state.playing }
        onPlay={ this.emitPlayAndListenForPause }
        onPause={ this.emitPauseAndListenForPlay }
        onProgress = { this.onProgress }
        progressFrequency = { 250 }
        onDuration = { duration => this.setState({ duration }) }
      />
    )
  }
}

export default YouTubeVideo;
