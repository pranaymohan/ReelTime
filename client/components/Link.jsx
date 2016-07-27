import React from 'react';
import CopyToClipboard from 'react-copy-to-clipboard';

let host = process.env.NODE_ENV === 'production' ? 'https://reeltimeapp.herokuapp.com/' : 'http://localhost:3000/'; 

const Link = (props) => {
  let url = host + '?id=' + props.myId;

  return (
    <div id="link">
      <div id="link-message">
        Send your friend the following link:<br />
        <span id="link-url">{url}</span>
        <CopyToClipboard text={`${url}`}>
          <button>Copy to clipboard</button>
        </CopyToClipboard>
      </div>
    </div>
  );
};

Link.propTypes = {
  myId: React.PropTypes.string,
};

export default Link;
