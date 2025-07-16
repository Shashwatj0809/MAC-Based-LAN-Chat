import React, { useState } from 'react';
import styles from '../styles/MacInput.module.css';

function MacInput({ onConnect, error }) {
  const [mac, setMac] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (mac.trim()) {
      onConnect(mac.trim());
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.macInputContainer}>
      <input
        type="text"
        value={mac}
        onChange={(e) => setMac(e.target.value)}
        placeholder="Enter your MAC Address (e.g., AA:BB:CC:DD:EE:FF)"
        className={styles.macInputField}
        required
      />
      <button type="submit" className={styles.connectButton}>
        Connect to Chat
      </button>
      {error && <p className={styles.errorMessage}>{error}</p>}
    </form>
  );
}

export default MacInput;