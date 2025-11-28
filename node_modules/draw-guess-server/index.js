const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const gameManager = require('./game');

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // Allow all origins for simplicity in dev
    methods: ["GET", "POST"]
  }
});

// API to upload words
app.post('/api/words', (req, res) => {
  const { roomId, words } = req.body;
  if (gameManager.addWords(roomId, words)) {
    res.json({ success: true, message: '词库更新成功' });
  } else {
    res.status(400).json({ success: false, message: '房间不存在或格式错误' });
  }
});

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('create_room', ({ nickname }) => {
    const roomId = Math.random().toString(36).substring(2, 8).toUpperCase();
    const room = gameManager.createRoom(roomId, socket.id, nickname);
    if (room) {
      gameManager.joinRoom(roomId, socket.id, nickname);
      socket.join(roomId);
      socket.emit('room_joined', { roomId, userId: socket.id, room });
    }
  });

  socket.on('join_room', ({ roomId, nickname }) => {
    const room = gameManager.joinRoom(roomId, socket.id, nickname);
    if (room) {
      socket.join(roomId);
      socket.emit('room_joined', { roomId, userId: socket.id, room });
      io.to(roomId).emit('update_room', room);
    } else {
      socket.emit('error', '房间不存在');
    }
  });

  socket.on('start_game', ({ roomId }) => {
    const choices = gameManager.startGame(roomId);
    if (choices) {
      const room = gameManager.rooms.get(roomId);
      io.to(roomId).emit('clear_canvas'); // Clear waiting room drawings
      io.to(roomId).emit('game_started', room);
      // Send choices only to the drawer
      const drawerId = room.players[room.currentDrawerIndex].id;
      io.to(drawerId).emit('choose_word', choices);
    }
  });

  socket.on('word_selected', ({ roomId, word }) => {
    const room = gameManager.selectWord(roomId, word);
    if (room) {
      io.to(roomId).emit('clear_canvas'); // Clear previous drawings
      io.to(roomId).emit('round_start', { 
        drawerId: room.players[room.currentDrawerIndex].id,
        wordLength: word.length 
      });
      io.to(roomId).emit('update_room', room);
      // Send the word only to the drawer
      socket.emit('your_word', word);
    }
  });

  socket.on('draw_data', ({ roomId, data }) => {
    // Broadcast drawing data to others in the room
    socket.to(roomId).emit('draw_data', data);
    // Save history (simplified)
    const room = gameManager.rooms.get(roomId);
    if (room) room.drawHistory.push(data);
  });

  socket.on('clear_canvas', ({ roomId }) => {
    socket.to(roomId).emit('clear_canvas');
    const room = gameManager.rooms.get(roomId);
    if (room) room.drawHistory = [];
  });

  socket.on('send_message', ({ roomId, message }) => {
    const result = gameManager.handleGuess(roomId, socket.id, message);
    const room = gameManager.rooms.get(roomId);
    const player = room.players.find(p => p.id === socket.id);

    if (result.type === 'correct') {
      io.to(roomId).emit('chat_message', { 
        sender: 'System', 
        text: `${player.name} 猜对了！`, 
        type: 'system' 
      });
      io.to(roomId).emit('update_room', room); // Update scores

      if (result.endTurn) {
        endTurn(roomId);
      }
    } else if (result.type === 'system') {
        socket.emit('chat_message', { sender: 'System', text: result.msg, type: 'system' });
    } else {
      io.to(roomId).emit('chat_message', { 
        sender: player.name, 
        text: message,
        type: 'chat'
      });
    }
  });

  const endTurn = (roomId) => {
    const room = gameManager.rooms.get(roomId);
    io.to(roomId).emit('turn_end', { word: room.currentWord });
    
    setTimeout(() => {
      const next = gameManager.nextTurn(roomId);
      if (next === 'ended') {
        io.to(roomId).emit('game_over', room);
      } else {
        io.to(roomId).emit('update_room', room);
        const drawerId = room.players[room.currentDrawerIndex].id;
        io.to(drawerId).emit('choose_word', next);
      }
    }, 3000);
  };

  socket.on('disconnect', () => {
    // Handle disconnect logic (simplified)
    // In a real app, we'd need to handle reconnects or removing players
    console.log('User disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
