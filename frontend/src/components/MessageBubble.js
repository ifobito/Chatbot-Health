import React from 'react';
import ReactMarkdown from 'react-markdown';

const MessageBubble = ({ message, isUser, time }) => {
  const messageClass = isUser ? 'user-message' : 'ai-message';

  return (
    <div className={`message-bubble ${messageClass}`}>
      <div className="message-text">
        <ReactMarkdown>{message}</ReactMarkdown>
      </div>
      <div className="message-time">{time}</div>
    </div>
  );
}

export default MessageBubble;
