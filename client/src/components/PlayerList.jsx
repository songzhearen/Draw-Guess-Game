import React from 'react';

const PlayerList = ({ players, currentDrawerId }) => {
  return (
    <div className="sidebar">
      <h3>玩家列表 ({players.length})</h3>
      <div className="player-list">
        {players.map((player) => (
          <div key={player.id} className="player-item" style={{ background: player.id === currentDrawerId ? '#fff3cd' : 'transparent' }}>
            <div className="avatar" style={{ backgroundColor: `hsl(${player.avatar * 36}, 70%, 80%)` }}>
              {player.name[0]}
            </div>
            <div className="player-info">
              <div style={{ fontWeight: 'bold' }}>
                {player.name} {player.id === currentDrawerId && '✏️'}
              </div>
              <div className="score">得分: {player.score}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PlayerList;
