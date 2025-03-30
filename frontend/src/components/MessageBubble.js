import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const MessageBubble = ({ message, isUser, time, references }) => {
  const messageClass = isUser ? 'user-message' : 'ai-message';

  return (
    <div className={`message-bubble ${messageClass}`}>
      <div className="message-text">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {message}
        </ReactMarkdown>
        
        {references && references.length > 0 && (
          <div className="references-section">
            <h3>Tài liệu tham khảo:</h3>
            <ul>
              {references.map((url, index) => (
                <li key={index}>
                  <a 
                    href={url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    {url.replace('https://tamanhhospital.vn/', '').replace(/-/g, ' ').replace('/', '')}
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
