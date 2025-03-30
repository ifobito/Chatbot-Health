import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const MessageBubble = ({ message, isUser, time, references }) => {
  const messageClass = isUser ? 'user-message' : 'ai-message';

  // Format URL hiển thị thân thiện hơn
  const formatDisplayUrl = (url) => {
    try {
      return url
        .replace('https://tamanhhospital.vn/', '')
        .replace(/-/g, ' ')
        .replace('/', '');
    } catch (e) {
      return url;
    }
  };

  return (
    <div className={`message-bubble ${messageClass}`}>
      <div className="message-text">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {message}
        </ReactMarkdown>
        
        {references && references.length > 0 && (
          <div className="references-section">
            <h3>Tài liệu tham khảo:</h3>
            <div className="reference-links-container">
              {references.map((url, index) => (
                <div key={index} className="reference-item-wrapper">
                  <span className="reference-bullet">•</span>
                  <a 
                    href={url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="reference-link"
                  >
                    {formatDisplayUrl(url)}
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      <div className="message-time">{time}</div>
    </div>
  );
}

export default MessageBubble;
