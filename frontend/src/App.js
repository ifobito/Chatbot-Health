import React from 'react';
import Header from './components/Header';
import ChatBox from './components/ChatBox';
import './styles.css';

const App = () => {
  return (
    <div className="app">
      <Header />
      <ChatBox />
    </div>
  );
}

export default App;
