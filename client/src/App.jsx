import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Room from './pages/Room';
import { io } from 'socket.io-client';
import { useEffect, useState } from 'react';

// Initialize socket outside component to prevent multiple connections
const socket = io('http://localhost:3001');

function App() {
  return (
    <BrowserRouter>
      <div className="app-container">
        <Routes>
          <Route path="/" element={<Home socket={socket} />} />
          <Route path="/room/:roomId" element={<Room socket={socket} />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
