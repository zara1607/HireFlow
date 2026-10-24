import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext(null);
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

export const SocketProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    let socketInstance = null;

    if (isAuthenticated && user?._id) {
      socketInstance = io(SOCKET_URL, {
        auth: { token: localStorage.getItem('hireflow_token') },
        transports: ['websocket', 'polling'],
      });

      socketInstance.on('connect', () => {
        // console.log('[Socket] Connected to server:', socketInstance.id);
        setConnected(true);
      });

      socketInstance.on('disconnect', () => {
        // console.log('[Socket] Disconnected from server');
        setConnected(false);
      });

      setSocket(socketInstance);
    } else {
      if (socket) {
        socket.disconnect();
        setSocket(null);
        setConnected(false);
      }
    }

    return () => {
      if (socketInstance) {
        socketInstance.disconnect();
      }
    };
  }, [isAuthenticated, user?._id]);

  return (
    <SocketContext.Provider value={{ socket, connected }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  return useContext(SocketContext);
};
