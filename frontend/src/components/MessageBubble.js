import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const MessageBubble = ({ message, isUser, time, references }) => {
  const messageClass = isUser ? 'user-message' : 'ai-message';

  // Tạo chuỗi Markdown cho phần tài liệu tham khảo
  const referencesMarkdown = references && references.length > 0 
    ? `\n\n### Tài liệu tham khảo:\n${references.map(url => `- [${url.replace('https://tamanhhospital.vn/', '').replace(/-/g, ' ').replace('/', '')}](${url})`).join('\n')}`
    : '';

  return (
    <div className={`message-bubble ${messageClass}`}>
      <div className="message-text">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {message + referencesMarkdown}
        </ReactMarkdown>
      </div>
      <div className="message-time">{time}</div>
    </div>
  );
}

export default MessageBubble;
