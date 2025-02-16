import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGlobe, faPaperclip, faArrowUp } from '@fortawesome/free-solid-svg-icons';
import { faReact } from '@fortawesome/free-brands-svg-icons';
import './MessageInput.css';

const MessageInput = ({ onSendMessage }) => {
  const [message, setMessage] = useState('');

  const handleSend = () => {
    if (message.trim()) {
      onSendMessage(message);
      setMessage('');
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault(); // Prevents new line in the textarea
      handleSend();
    }
  };

  return (
    <div className="message-container">
      <div className="message-input">
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown} // Add this for Enter key functionality
          placeholder="Message ChatHealth"
        />
        <div className="buttons">
          <button className="deepthink-btn">
            <FontAwesomeIcon icon={faReact} /> ModelV1
          </button>
          <button className="search-btn">
            <FontAwesomeIcon icon={faGlobe} /> Search
          </button>
        </div>
        <div className="icons">
          <button className="attach-btn">
            <FontAwesomeIcon icon={faPaperclip} />
          </button>
          <button className="send-button" onClick={handleSend}>
            <FontAwesomeIcon icon={faArrowUp} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default MessageInput;
