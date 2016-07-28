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

  emitPlayAndListenForPause() {
    this.props.socket.emit('play', this.state.played);
    this.props.socket.on('pause', (otherPlayedFraction) => {
      console.log('thisplayed:', this.state.played, 'otherplayed:', otherPlayedFraction);
      this.syncVideos(this.state.played, otherPlayedFraction);
      this.setState({ 
        playing: false,
      });
    });
  }

  emitPauseAndListenForPlay() {
    this.props.socket.emit('pause', this.state.played);
    this.props.socket.on('play', (otherPlayedFraction) => {
      console.log('thisplayed:', this.state.played, 'otherplayed:', otherPlayedFraction);
      this.syncVideos(this.state.played, otherPlayedFraction);
      this.setState({ 
        playing: true,
      });
    });
  }

  syncVideos(currentFraction, otherFraction) {
    var currentTime = Math.floor(currentFraction * this.state.duration);
    var otherTime = Math.floor(otherFraction * this.state.duration);

    if (currentTime > otherTime + 0.5 || currentTime < otherTime - 0.5) {
      this.refs.player.seekTo(otherFraction);
    }
  }

  onProgress(state) {
    //TODO save progress
    this.setState(state);
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
        onDuration = { duration => this.setState({ duration })}
      />
    )
  }
}

export default YouTubeVideo;
