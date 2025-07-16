import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import MacInput from './components/MacInput';
import ChatWindow from './components/ChatWindow';
import MessageInput from './components/MessageInput';
import PerformanceMetricsButton from './components/PerformanceMetricsButton';
// Removed: import ParticleBackground from './components/ParticleBackground';
import styles from './styles/App.module.css';

const SOCKET_SERVER_URL = 'http://127.0.0.1:12345'; // Replace with your server's IP if different

function App() {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [macAddress, setMacAddress] = useState('');
  const [accessMessage, setAccessMessage] = useState('');
  const [messages, setMessages] = useState([]); // { sender_mac: '...', message: '...', isSelf: true/false }
  const [error, setError] = useState('');

  const perfButtonRef = useRef(null);

  // Initialize socket connection
  useEffect(() => {
    if (!macAddress) return;

    const newSocket = io(SOCKET_SERVER_URL, {
      transports: ['websocket', 'polling'], // Prioritize websockets
      autoConnect: false, // Don't auto-connect, wait for user action
    });

    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('Connected to server, authenticating...');
      setIsConnected(true);
      setError('');
      newSocket.emit('authenticate', { mac_address: macAddress });
    });

    newSocket.on('access_response', (data) => {
      setAccessMessage(data.message);
      if (data.status === 'granted') {
        console.log('Access granted:', data.message);
      } else {
        console.error('Access denied:', data.message);
        newSocket.disconnect();
        setIsConnected(false);
      }
    });

    newSocket.on('message', (msg_payload) => {
      console.log('Received message:', msg_payload);
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          sender_mac: msg_payload.sender_mac,
          message: msg_payload.message,
          timestamp: msg_payload.timestamp,
          isSelf: msg_payload.sender_mac === macAddress,
        },
      ]);
    });

    newSocket.on('disconnect', () => {
      console.log('Disconnected from server.');
      setIsConnected(false);
      setMessages([]);
      setAccessMessage('');
    });

    newSocket.on('connect_error', (err) => {
      console.error('Connection Error:', err.message);
      setError('Failed to connect to server. Please check IP and server status.');
      setIsConnected(false);
    });

    return () => {
      if (newSocket) {
        newSocket.off('connect');
        newSocket.off('access_response');
        newSocket.off('message');
        newSocket.off('disconnect');
        newSocket.off('connect_error');
        newSocket.disconnect();
      }
    };
  }, [macAddress]);

  const handleConnect = (mac) => {
    setMacAddress(mac);
    setError('');
    setAccessMessage('');
    setMessages([]);
    if (socket && !socket.connected) {
      socket.connect();
    } else if (!socket) {
      // This path will be covered by the useEffect setting up the socket
    }
  };

  const handleSendMessage = (message) => {
    if (socket && isConnected) {
      socket.emit('message', { message });
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          sender_mac: macAddress,
          message: message,
          timestamp: new Date().toISOString(),
          isSelf: true,
        },
      ]);
    } else {
      console.warn('Not connected to send message.');
      setError('You are not connected to the chat.');
    }
  };

  const handleShowPerformance = () => {
    alert('Performance metrics feature coming soon!');
  };

  return (
    <div className={styles.appContainer}> {/* No Fragment needed here now */}
      <h1 className={styles.appTitle}>MAC-Based LAN Chat</h1>
      {!isConnected ? (
        <>
          <MacInput onConnect={handleConnect} error={error} />
          {accessMessage && <p className={styles.accessMessage}>{accessMessage}</p>}
        </>
      ) : (
        <div className={styles.chatInterface}>
          <p className={styles.connectedStatus}>Connected as: <span className={styles.macText}>{macAddress}</span></p>
          {accessMessage && <p className={styles.accessMessage}>{accessMessage}</p>}
          <ChatWindow messages={messages} currentMac={macAddress} />
          <MessageInput onSendMessage={handleSendMessage} />
          <PerformanceMetricsButton onClick={handleShowPerformance} />
        </div>
      )}
    </div>
  );
}

export default App;