import React, { useEffect, useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import Canvas from '../components/Canvas';
import Chat from '../components/Chat';
import PlayerList from '../components/PlayerList';

const Room = ({ socket }) => {
  const { roomId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [roomData, setRoomData] = useState(location.state?.room || null);
  const [myWord, setMyWord] = useState('');
  const [wordChoices, setWordChoices] = useState([]);
  const [showWordModal, setShowWordModal] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0); // Optional: Timer

  const userId = location.state?.userId || socket.id;
  const nickname = location.state?.nickname;

  useEffect(() => {
    if (!nickname) {
      navigate('/');
      return;
    }

    // Initial fetch or join if refreshed (simplified)
    // In a real app, we'd check if we are already in room
    
    socket.on('update_room', (room) => {
      setRoomData(room);
    });

    socket.on('game_started', (room) => {
      setRoomData(room);
    });

    socket.on('choose_word', (choices) => {
      setWordChoices(choices);
      setShowWordModal(true);
    });

    socket.on('your_word', (word) => {
      setMyWord(word);
      setShowWordModal(false);
    });

    socket.on('round_start', ({ drawerId, wordLength }) => {
      setWordChoices([]);
      setShowWordModal(false);
      if (drawerId !== socket.id) {
        setMyWord('_ '.repeat(wordLength));
      }
    });

    socket.on('turn_end', ({ word }) => {
      setMyWord(word); // Reveal word
      // alert(`本轮结束！词语是：${word}`);
    });

    socket.on('game_over', () => {
      alert('游戏结束！');
      navigate('/');
    });

    // If no room data (e.g. refresh), try to join
    if (!roomData) {
        socket.emit('join_room', { roomId, nickname });
    }

    return () => {
      socket.off('update_room');
      socket.off('game_started');
      socket.off('choose_word');
      socket.off('your_word');
      socket.off('round_start');
      socket.off('turn_end');
      socket.off('game_over');
    };
  }, [socket, navigate, nickname, roomId]);

  const startGame = () => {
    socket.emit('start_game', { roomId });
  };

  const selectWord = (word) => {
    socket.emit('word_selected', { roomId, word });
  };

  const handleUploadWords = async () => {
    const text = prompt("请输入词语，用逗号分隔：");
    if (text) {
      const words = text.split(/[,，]/).map(w => w.trim()).filter(w => w);
      try {
        await fetch('http://localhost:3001/api/words', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ roomId, words })
        });
        alert('词库上传成功！新词语将在下一轮出现。');
      } catch (e) {
        alert('上传失败');
      }
    }
  };

  const handleCopyRoomId = () => {
    navigator.clipboard.writeText(roomId);
    alert('房间号已复制到剪贴板');
  };

  if (!roomData) return null;

  const isHost = roomData.hostId === userId;
  const currentDrawer = roomData.players[roomData.currentDrawerIndex];
  const isDrawerTurn = currentDrawer?.id === userId;
  const isWaiting = roomData.gameState === 'waiting';
  // Allow drawing if it's waiting state OR if it's my turn to draw
  const canDraw = isWaiting || (roomData.gameState === 'drawing' && isDrawerTurn);

  return (
    <div className="room-page">
      <PlayerList players={roomData.players} currentDrawerId={!isWaiting ? currentDrawer?.id : null} />
      
      <div className="main-area">
        {isWaiting ? (
            /* 等待区域 Header */
            <div className="game-header" style={{ flexDirection: 'column', alignItems: 'stretch', gap: '10px', background: 'rgba(0,0,0,0.03)', padding: '15px', borderRadius: '10px', border: '2px dashed var(--crayon-black)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <h2 style={{margin: 0, color: 'var(--crayon-blue)'}}>🎨 等待大厅</h2>
                        <span style={{ fontSize: '1.2rem', background: '#fff', padding: '5px 10px', borderRadius: '5px', border: '2px solid var(--crayon-black)', transform: 'rotate(-1deg)' }}>
                            房间号: <strong>{roomId}</strong>
                        </span>
                        <button className="btn-crayon" style={{ padding: '2px 8px', fontSize: '0.9rem', margin: 0 }} onClick={handleCopyRoomId}>复制</button>
                    </div>
                    <div style={{ fontStyle: 'italic', color: '#666', fontFamily: 'var(--font-hand)', fontSize: '1.2rem' }}>
                        大家可以在画板上自由涂鸦哦~
                    </div>
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '2px dashed #ccc', paddingTop: '10px', marginTop: '5px' }}>
                    <div style={{ fontSize: '1.1rem' }}>
                        当前人数: <span style={{ color: 'var(--crayon-red)', fontWeight: 'bold' }}>{roomData.players.length}</span> 人
                    </div>
                    {isHost ? (
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button className="btn-crayon btn-secondary" onClick={handleUploadWords} style={{fontSize: '1rem', padding: '5px 15px', margin: 0}}>📂 上传词库</button>
                            <button className="btn-crayon btn-primary" onClick={startGame} disabled={roomData.players.length < 2} style={{fontSize: '1rem', padding: '5px 15px', margin: 0}}>
                                ▶️ 开始游戏
                            </button>
                        </div>
                    ) : (
                        <div style={{ fontSize: '1.1rem', color: '#888' }}>
                            等待房主开始游戏...
                        </div>
                    )}
                </div>
            </div>
        ) : (
            /* 游戏区域 Header */
            <div className="game-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                房间: {roomId} 
                <button className="btn-crayon" style={{ padding: '2px 8px', fontSize: '1rem' }} onClick={handleCopyRoomId}>复制</button>
                | 轮数: {roomData.round}/{roomData.maxRounds}
              </div>
              <div className="word-display">
                {roomData.gameState === 'drawing' ? myWord : 
                 roomData.gameState === 'selecting' ? (isDrawerTurn ? '正在选词...' : '等待选词...') : 
                 '等待开始'}
              </div>
              <div style={{ width: '100px' }}></div>
            </div>
        )}

        <Canvas 
          socket={socket} 
          roomId={roomId} 
          isDrawer={canDraw} 
        />
      </div>

      <Chat socket={socket} roomId={roomId} isDrawer={isDrawerTurn && roomData.gameState === 'drawing'} />

      {showWordModal && (
        <div className="overlay">
          <div className="modal">
            <h2>请选择一个词语</h2>
            <div className="word-choices">
              {wordChoices.map(word => (
                <button key={word} className="btn-crayon" onClick={() => selectWord(word)}>
                  {word}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Room;
