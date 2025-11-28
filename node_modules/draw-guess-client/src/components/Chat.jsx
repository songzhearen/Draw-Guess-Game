import React, { useState, useEffect, useRef } from 'react';

const Chat = ({ socket, roomId, isDrawer }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    socket.on('chat_message', (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    return () => {
      socket.off('chat_message');
    };
  }, [socket]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    
    socket.emit('send_message', { roomId, message: input });
    setInput('');
  };

  return (
    <div className="chat-container">
      <h3>聊天 / 猜词</h3>
      <div className="chat-messages">
        {messages.map((msg, idx) => (
          <div key={idx} className={`message ${msg.type === 'system' ? 'system' : ''} ${msg.text === '***' ? 'correct' : ''}`}>
            {msg.type !== 'system' && <strong>{msg.sender}: </strong>}
            {msg.text}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={sendMessage}>
        <input 
          type="text" 
          className="input-crayon" 
          style={{ width: '100%', boxSizing: 'border-box', margin: 0 }}
          placeholder={isDrawer ? "你正在画画，不能猜词" : "输入你的猜测..."}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={isDrawer}
        />
      </form>
    </div>
  );
};

export default Chat;
