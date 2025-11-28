const fs = require('fs');
const path = require('path');

class GameManager {
  constructor() {
    this.rooms = new Map(); // roomId -> roomData
    this.defaultWords = require('./words.json');
  }

  createRoom(roomId, hostId, hostName) {
    if (this.rooms.has(roomId)) return null;
    this.rooms.set(roomId, {
      id: roomId,
      hostId: hostId,
      players: [], // { id, name, score, avatar }
      gameState: 'waiting', // waiting, selecting, drawing, ended
      currentDrawerIndex: 0,
      currentWord: '',
      round: 0,
      maxRounds: 3,
      drawHistory: [],
      wordChoices: [],
      guessedPlayers: [],
      words: [...this.defaultWords] // Room-specific words
    });
    return this.rooms.get(roomId);
  }

  joinRoom(roomId, playerId, playerName) {
    const room = this.rooms.get(roomId);
    if (!room) return null;
    
    // Check if player already exists (reconnect)
    const existingPlayer = room.players.find(p => p.id === playerId);
    if (!existingPlayer) {
      room.players.push({
        id: playerId,
        name: playerName,
        score: 0,
        avatar: Math.floor(Math.random() * 10) // Random avatar index
      });
    }
    return room;
  }

  leaveRoom(roomId, playerId) {
    const room = this.rooms.get(roomId);
    if (!room) return;

    room.players = room.players.filter(p => p.id !== playerId);
    if (room.players.length === 0) {
      this.rooms.delete(roomId);
    } else if (room.hostId === playerId) {
      room.hostId = room.players[0].id; // Assign new host
    }
    return room;
  }

  startGame(roomId) {
    const room = this.rooms.get(roomId);
    if (!room || room.players.length < 2) return false;

    room.gameState = 'selecting';
    room.round = 1;
    // Shuffle players
    room.players.sort(() => Math.random() - 0.5);
    room.currentDrawerIndex = 0;
    room.drawHistory = [];
    room.guessedPlayers = [];
    
    return this.generateWordChoices(roomId);
  }

  generateWordChoices(roomId) {
    const room = this.rooms.get(roomId);
    if (!room) return null;
    
    const choices = [];
    for(let i=0; i<3; i++) {
      const randomIndex = Math.floor(Math.random() * room.words.length);
      choices.push(room.words[randomIndex]);
    }
    room.wordChoices = choices;
    return choices;
  }

  selectWord(roomId, word) {
    const room = this.rooms.get(roomId);
    if (!room) return;
    room.currentWord = word;
    room.gameState = 'drawing';
    room.guessedPlayers = [];
    return room;
  }

  handleGuess(roomId, playerId, guess) {
    const room = this.rooms.get(roomId);
    if (!room || room.gameState !== 'drawing') return { type: 'chat', msg: guess };

    const player = room.players.find(p => p.id === playerId);
    const isDrawer = room.players[room.currentDrawerIndex].id === playerId;

    if (isDrawer) return { type: 'system', msg: '画画的人不能猜！' };
    if (room.guessedPlayers.includes(playerId)) return { type: 'system', msg: '你已经猜对啦！' };

    if (guess === room.currentWord) {
      player.score += 10;
      // Drawer gets points too
      room.players[room.currentDrawerIndex].score += 5;
      room.guessedPlayers.push(playerId);
      
      // Check if everyone guessed
      if (room.guessedPlayers.length === room.players.length - 1) {
        return { type: 'correct', msg: '***', endTurn: true };
      }
      return { type: 'correct', msg: '***' };
    }

    return { type: 'chat', msg: guess };
  }

  nextTurn(roomId) {
    const room = this.rooms.get(roomId);
    if (!room) return;

    room.currentDrawerIndex++;
    if (room.currentDrawerIndex >= room.players.length) {
      room.currentDrawerIndex = 0;
      room.round++;
    }

    if (room.round > room.maxRounds) {
      room.gameState = 'ended';
      return 'ended';
    }

    room.gameState = 'selecting';
    room.drawHistory = [];
    room.currentWord = '';
    room.guessedPlayers = [];
    return this.generateWordChoices(roomId);
  }

  addWords(roomId, newWords) {
    const room = this.rooms.get(roomId);
    if (room && Array.isArray(newWords)) {
      // Add new words to the room's word list
      room.words = [...new Set([...room.words, ...newWords])];
      return true;
    }
    return false;
  }
}

module.exports = new GameManager();
