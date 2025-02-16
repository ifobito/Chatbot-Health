import React, { useState } from 'react';
import { LuMessageCircleDashed } from "react-icons/lu";
import { MdOutlineHistoryToggleOff } from "react-icons/md";

import './Header.css';

const Header = () => {
  const [chatState, setChatState] = useState('closed');

  const toggleChatState = () => {
    setChatState(prevState => (prevState === 'closed' ? 'open' : 'closed'));
  };

  return (
    <div className="header">
      {/* Icon for the chat */}
      <button className="chat-icon" onClick={toggleChatState}>
        <LuMessageCircleDashed />
      </button>

      {/* Chat title */}
      <div>Temporary Chat</div>

      {/* Chat state toggle */}
      <button className="chat-state" onClick={toggleChatState}>
        <MdOutlineHistoryToggleOff />
      </button>
    </div>
  );
};

export default Header;
