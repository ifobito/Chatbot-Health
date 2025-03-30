import React from 'react';
import ReactMarkdown from 'react-markdown';

const MessageBubble = ({ message, isUser, time, references }) => {
  const messageClass = isUser ? 'user-message' : 'ai-message';

  return (
    <div className={`message-bubble ${messageClass}`}>
      <div className="message-text">
        <ReactMarkdown>{message}</ReactMarkdown>
        
        {references && references.length > 0 && (
          <div className="references-section">
            <h4>Tài liệu tham khảo:</h4>
            <ul>
              {references.map((url, index) => (
                <li key={index}>
                  <a href={url} target="_blank" rel="noopener noreferrer">
                    {url.length > 60 ? `${url.substring(0, 60)}...` : url}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
      <div className="message-time">{time}</div>
    </div>
  );
}

export default MessageBubble;
