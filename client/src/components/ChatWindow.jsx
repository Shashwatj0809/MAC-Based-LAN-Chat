import React, { useEffect, useRef } from 'react';
import styles from '../styles/ChatWindow.module.css';

function ChatWindow({ messages, currentMac }) {
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className={styles.chatWindow}>
      {messages.length === 0 && (
        <p className={styles.noMessages}>Start chatting!</p>
      )}
      {messages.map((msg, index) => (
        <div
          key={index}
          className={`${styles.messageBubble} ${
            msg.isSelf ? styles.sent : styles.received
          }`}
        >
          {!msg.isSelf && ( // Display sender MAC only for received messages
            <span className={styles.senderMac}>{msg.sender_mac.slice(-5)}:</span>
          )}
          <p className={styles.messageContent}>{msg.message}</p>
          <span className={styles.messageTimestamp}>
            {new Date(msg.timestamp).toLocaleTimeString()}
          </span>
        </div>
      ))}
      <div ref={messagesEndRef} /> {/* For auto-scrolling */}
    </div>
  );
}

export default ChatWindow;