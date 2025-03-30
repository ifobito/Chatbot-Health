import React, { useState } from 'react';
import { LuMessageCircleDashed } from "react-icons/lu";
import { MdOutlineHistoryToggleOff } from "react-icons/md";
import './Header.css';

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleChat = () => {
    setIsOpen(prev => !prev);
  };

  return (
    <div className="header">
      {/* Icon for the chat */}
      <button className="chat-icon" onClick={toggleChat}>
        <LuMessageCircleDashed />
      </button>

      {/* Chat title */}
      <div>Temporary Chat</div>

      {/* Chat state toggle */}
      <button className="chat-state" onClick={toggleChat}>
        <MdOutlineHistoryToggleOff />
      </button>
    </div>
  );
};

export default Header;
