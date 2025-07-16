import React from 'react';
import styles from '../styles/PerformanceMetricsButton.module.css';

function PerformanceMetricsButton({ onClick }) {
  return (
    <button onClick={onClick} className={styles.metricsButton}>
      Show Performance Metrics
    </button>
  );
}

export default PerformanceMetricsButton;