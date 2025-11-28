import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Home = ({ socket }) => {
  const navigate = useNavigate();
  const [nickname, setNickname] = useState('');
  const [roomId, setRoomId] = useState('');
  const [mode, setMode] = useState('menu'); // menu, join

  useEffect(() => {
    socket.on('room_joined', ({ roomId, userId, room }) => {
      navigate(`/room/${roomId}`, { state: { nickname, userId, room } });
    });

    socket.on('error', (msg) => {
      alert(msg);
    });

    return () => {
      socket.off('room_joined');
      socket.off('error');
    };
  }, [socket, navigate, nickname]);

  const createRoom = () => {
    if (!nickname) return alert('请输入昵称');
    socket.emit('create_room', { nickname });
  };

  const joinRoom = () => {
    if (!nickname || !roomId) return alert('请输入昵称和房间号');
    socket.emit('join_room', { roomId, nickname });
  };

  return (
    <div className="home-page">
      <h1 className="title">
        <span>你</span>
        <span>画</span>
        <span>我</span>
        <span>猜</span>
      </h1>
      
      {mode === 'menu' && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <input 
            type="text" 
            className="input-crayon" 
            placeholder="你的昵称" 
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            maxLength={10}
          />
          <button className="btn-crayon btn-primary" onClick={createRoom}>创建房间</button>
          <button className="btn-crayon btn-secondary" onClick={() => setMode('join')}>加入房间</button>
        </div>
      )}

      {mode === 'join' && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <input 
            type="text" 
            className="input-crayon" 
            placeholder="你的昵称" 
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
          />
          <input 
            type="text" 
            className="input-crayon" 
            placeholder="房间号" 
            value={roomId}
            onChange={(e) => setRoomId(e.target.value.toUpperCase())}
          />
          <button className="btn-crayon btn-primary" onClick={joinRoom}>进入房间</button>
          <button className="btn-crayon" onClick={() => setMode('menu')}>返回</button>
        </div>
      )}
    </div>
  );
};

export default Home;
