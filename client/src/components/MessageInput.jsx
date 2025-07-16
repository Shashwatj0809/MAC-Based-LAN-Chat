import React, { useState } from 'react';
import styles from '../styles/MessageInput.module.css';

function MessageInput({ onSendMessage }) {
  const [message, setMessage] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim()) {
      onSendMessage(message.trim());
      setMessage('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.messageInputContainer}>
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Type your message..."
        className={styles.messageInputField}
      />
      <button type="submit" className={styles.sendButton}>
        Send
      </button>
    </form>
  );
}

export default MessageInput;