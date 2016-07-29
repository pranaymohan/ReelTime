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

  // Initialize annyong voice command library and define commands
  initVoice(video) {
    var playFunction = () => {
      console.log('play voice command received');
      video.play();
      this.emitPlayAndListenForPause(video);
    };

    var pauseFunction = () => {
      console.log('pause voice command received');
      video.pause();
      this.emitPauseAndListenForPlay(video);
    };

    var goBackFunction = () => {
      console.log('go back voice command received');
      video.currentTime = Math.floor(video.currentTime - 10, 0);
      this.emitGoBack(video);
    };

    var muteFunction = () => {
      console.log('mute voice command received');
      video.muted = true;
    };

    var unmuteFunction = () => {
      console.log('unmute voice command received');
      video.muted = false;
    };

    var playCommands = {'play': playFunction};
    var goBackCommands = {'go back': goBackFunction};

    // define words that empirically sound like our main command, and synonyms
    var pauseWords = ['pause', 'call', 'car', 'cars', 'cause', 'hans', 
      'hollis', 'hot', 'palm', 'paul', 'paula\'s', 'paw', 'pawn', 
      'paws', 'pod', 'pods', 'polish', 'pond', 'posh'];
    var muteWords = ['mute', 'new', 'news', 'newt', 'nude', 'use', 'used', 'you'];
    var unmuteWords = ['unmute', 'enhance', 'enhanced', 'in hands', 'in hats', 'n hance'];

    // generate a command object for each array of command words
    var pauseCommands = pauseWords.reduce(function(obj, word) {
      obj[word] = pauseFunction;
      return obj;
    }, {});

    var muteCommands = muteWords.reduce(function(obj, word) {
      obj[word] = muteFunction;
      return obj;
    }, {});

    var unmuteCommands = unmuteWords.reduce(function(obj, word) {
      obj[word] = unmuteFunction;
      return obj;
    }, {});


    if (annyang) {
      annyang.debug();
      annyang.addCommands(playCommands);
      annyang.addCommands(pauseCommands);
      annyang.addCommands(goBackCommands);
      annyang.addCommands(muteCommands);
      annyang.addCommands(unmuteCommands);
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
