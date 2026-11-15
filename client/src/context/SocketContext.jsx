import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    // Dynamic socket endpoint: supports custom VITE_SOCKET_URL, derives from VITE_API_URL, or defaults to current origin
    const socketUrl =
      import.meta.env.VITE_SOCKET_URL ||
      (import.meta.env.VITE_API_URL
        ? import.meta.env.VITE_API_URL.replace(/\/api\/?$/, '')
        : undefined);

    const newSocket = io(socketUrl, {
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

