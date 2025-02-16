import React, { useState } from 'react';
import axios from 'axios';
import MessageBubble from './MessageBubble';
import MessageInput from './MessageInput';
import LoadingSpinner from './LoadingSpinner';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHospital } from '@fortawesome/free-regular-svg-icons';
import './ChatBox.css';

const ChatBox = () => {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showIntro, setShowIntro] = useState(true); // State để kiểm soát hiển thị intro

  const handleSendMessage = async (message) => {
    if (showIntro) setShowIntro(false); // Ẩn phần intro khi gửi tin nhắn đầu tiên

    const userMessage = { message, isUser: true, time: new Date().toLocaleTimeString() };
    setMessages((prevMessages) => [...prevMessages, userMessage]);

    setIsLoading(true);
    try {
      const response = await axios.post('https://backend.ifobito.online/ask', { question: message });
      const aiMessage = { message: response.data.response, isUser: false, time: new Date().toLocaleTimeString() };
      setMessages((prevMessages) => [...prevMessages, aiMessage]);
    } catch (error) {
      const errorMessage = { message: `Error: ${error.message}`, isUser: false, time: new Date().toLocaleTimeString() };
      setMessages((prevMessages) => [...prevMessages, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="chat-box">
      {/* Chỉ hiển thị phần intro nếu showIntro === true */}
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

      {/* Phần tin nhắn */}
      <div className="messages">
        {messages.map((msg, index) => (
          <MessageBubble key={index} message={msg.message} isUser={msg.isUser} time={msg.time} />
        ))}
        {isLoading && <LoadingSpinner />}
      </div>
      <MessageInput onSendMessage={handleSendMessage} />
    </div>
  );
};

export default ChatBox;
