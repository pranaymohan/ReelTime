import React from 'react';
import ReactPlayer from 'react-player'

class YouTubeVideo extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      playing: this.props.playing || false,
      played: 0,
      loaded: 0,
      duration: 0,
      volume: this.props.volume || 0.8
    }

    this.emitPlayAndListenForPause = this.props.emitPlayAndListenForPause.bind(this);
    this.emitPauseAndListenForPlay = this.props.emitPauseAndListenForPlay.bind(this);
    this.onProgress = this.onProgress.bind(this);
  }

  componentDidMount() {
    this.props.initVoice(video); // HOW DO I GET THE VIDEO
    this.initListeners();
  }

  initListeners() {
    this.props.socket.on('play', (otherFraction) => {
      this.setState({ 
        playing: true
      });
    });

    this.props.socket.on('pause', (otherFraction) => {
      this.setState({ 
        playing: false
      });
    });

    // MAY NOT NEED THIS FOR YT DUE TO ON PROGRESS LISTENER
    // this.props.socket.on('go back', (otherTime) => {
    //   console.log('go back message received, about to sync');
    //   this.syncVideos(video, otherTime);
    // });

    this.props.socket.on('progress', (otherProgress) => {
      // Sync videos if they are way off:
      this.syncVideos(this.state.played, otherProgress.played);
    });
  }

  // COMMENTING THIS OUT BECAUSE I CANT SEE WHY ITS NEEDED. DELEGATING TO THE VERSION PASSED IN
  // emitPlayAndListenForPause() {
  //   this.props.socket.emit('play', { played: this.state.played, loaded: this.state.loaded });
  // }

  // emitPauseAndListenForPlay() {
  //   this.props.socket.emit('pause', { played: this.state.played, loaded: this.state.loaded });
  // }

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
        volume={ this.state.volume }
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
