import React, { useState, useRef, useEffect } from 'react';
import MessageBubble from './MessageBubble';
import MessageInput from './MessageInput';
import LoadingSpinner from './LoadingSpinner';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHospital } from '@fortawesome/free-regular-svg-icons';
import './ChatBox.css';

const ChatBox = () => {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showIntro, setShowIntro] = useState(true);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSendMessage = async (message) => {
    if (showIntro) setShowIntro(false);
  
    const userMessage = { message, isUser: true, time: new Date().toLocaleTimeString() };
    setMessages((prevMessages) => [...prevMessages, userMessage]);
  
    setIsLoading(true);
    try {
      const response = await fetch('https://backend.ifobito.online/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: message }),
      });
  
      if (!response.ok) {
        throw new Error(`Server error: ${response.statusText}`);
      }
  
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let currentMessage = '';
      let references = [];
      let isCollectingReferences = false;

      // eslint-disable-next-line no-constant-condition
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value, { stream: true });
        
        // Kiểm tra xem chunk có chứa delimiter tài liệu tham khảo không
        if (chunk.includes("###REFERENCES###")) {
          const parts = chunk.split("###REFERENCES###");
          currentMessage += parts[0];
          isCollectingReferences = true;
          
          // Nếu có dữ liệu tài liệu tham khảo trong cùng chunk
          if (parts[1]) {
            const refLines = parts[1].trim().split('\n');
            references = [...references, ...refLines.filter(url => url.trim() !== '')];
          }
        } else if (isCollectingReferences) {
          // Tiếp tục thu thập URLs tham khảo
          const refLines = chunk.trim().split('\n');
          references = [...references, ...refLines.filter(url => url.trim() !== '')];
        } else {
          // Chunk bình thường, thêm vào nội dung tin nhắn
          currentMessage += chunk;
        }
  
        setMessages((prevMessages) => {
          const updatedMessages = [...prevMessages];
          const lastMessage = updatedMessages[updatedMessages.length - 1];
  
          if (lastMessage && !lastMessage.isUser) {
            updatedMessages[updatedMessages.length - 1] = {
              ...lastMessage,
              message: currentMessage,
              references: references.length > 0 ? references : undefined
            };
          } else {
            updatedMessages.push({
              message: currentMessage,
              isUser: false,
              time: new Date().toLocaleTimeString(),
              references: references.length > 0 ? references : undefined
            });
          }
  
          return updatedMessages;
        });
      }
    } catch (error) {
      const errorMessage = { message: `Error: ${error.message}`, isUser: false, time: new Date().toLocaleTimeString() };
      setMessages((prevMessages) => [...prevMessages, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="chat-box">
      {showIntro && (
        <div className="deepseek-intro">
          <div className="icon-container">
            <FontAwesomeIcon icon={faHospital} />
          </div>
          <div className="intro-text">
            <div className="greeting">Hi, I'm ChatHealth.</div>
            <div className="question">How can I help you today?</div>
          </div>
        </div>
      )}

      <div className="messages">
        {messages.map((msg, index) => (
          <MessageBubble 
            key={index} 
            message={msg.message} 
            isUser={msg.isUser} 
            time={msg.time} 
            references={msg.references}
          />
        ))}
        {isLoading && <LoadingSpinner />}
        <div ref={messagesEndRef} />
      </div>
      <MessageInput onSendMessage={handleSendMessage} />
    </div>
  );
};

export default ChatBox;
