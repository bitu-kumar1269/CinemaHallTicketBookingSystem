import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    // Connect to current origin (Vite proxy forwards /socket.io to port 5005)
    const newSocket = io({
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
    });

    newSocket.on('connect', () => {
      setConnected(true);
      console.log('⚡ Socket connected to CineWave server:', newSocket.id);
    });

    newSocket.on('disconnect', () => {
      setConnected(false);
      console.log('⚡ Socket disconnected');
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, []);

  const joinShowRoom = (showId) => {
    if (socket && showId) {
      socket.emit('join_show', showId);
    }
  };

  const leaveShowRoom = (showId) => {
    if (socket && showId) {
      socket.emit('leave_show', showId);
    }
  };

  return (
    <SocketContext.Provider
      value={{
        socket,
        connected,
        joinShowRoom,
        leaveShowRoom,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);

