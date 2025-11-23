import { useState } from 'react';
import './BackupSuccessModal.css';

export default function BackupSuccessModal({ backupInfo, onClose }) {
  const [copying, setCopying] = useState(false);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(backupInfo.downloadUrl);
      setCopying(true);
      setTimeout(() => setCopying(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleDownload = () => {
    window.open(backupInfo.downloadUrl, '_blank');
  };

  const handleSaveToDrive = () => {
    const driveUrl = `https://drive.google.com/drive/u/0/my-drive`;
    window.open(driveUrl, '_blank');
    handleDownload();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="backup-success-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="success-icon">
            <img src="/icon/check-circle.svg" alt="Success" />
          </div>
          <h2>Backup Completed Successfully</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="modal-body">
          <div className="backup-details">
            <div className="detail-row">
              <img src="/icon/file.svg" alt="File" className="row-icon" />
              <span className="label">File:</span>
              <span className="value">{backupInfo.fileName}</span>
            </div>
            <div className="detail-row">
              <img src="/icon/clock.svg" alt="Time" className="row-icon" />
              <span className="label">Time:</span>
              <span className="value">{new Date(backupInfo.timestamp).toLocaleString('vi-VN')}</span>
            </div>
            <div className="detail-row">
              <img src="/icon/database.svg" alt="Bucket" className="row-icon" />
              <span className="label">Bucket:</span>
              <span className="value">{backupInfo.bucket}</span>
            </div>
          </div>

          <div className="backup-stats">
            <h3>
              <img src="/icon/bar-chart.svg" alt="Stats" className="section-icon" />
              Statistics
            </h3>
            <div className="stats-grid">
              {Object.entries(backupInfo.stats).map(([collection, count]) => (
                <div key={collection} className="stat-item">
                  <span className="stat-label">{collection}</span>
                  <span className="stat-value">{count} docs</span>
                </div>
              ))}
            </div>
          </div>

          <div className="download-section">
            <h3>
              <img src="/icon/download.svg" alt="Download" className="section-icon" />
              Download Backup
            </h3>
            <p className="download-hint">
              Public URL - No expiration. Save to your personal Google Drive for safekeeping.
            </p>

            <div className="action-buttons">
              <button className="btn-primary" onClick={handleDownload}>
                <img src="/icon/download.svg" alt="Download" />
                Download Now
              </button>

              <button className="btn-secondary" onClick={handleSaveToDrive}>
                <img src="/icon/upload.svg" alt="Drive" />
                Open Drive
              </button>

              <button 
                className={`btn-copy ${copying ? 'copied' : ''}`} 
                onClick={handleCopyLink}
              >
                <img src="/icon/copy.svg" alt="Copy" />
                {copying ? 'Copied!' : 'Copy Link'}
              </button>
            </div>

            <div className="download-link">
              <input 
                type="text" 
                value={backupInfo.downloadUrl} 
                readOnly 
                onClick={(e) => e.target.select()}
              />
            </div>
          </div>

          <div className="email-notice">
            <img src="/icon/mail.svg" alt="Email" />
            <p>Download link has been sent to your email</p>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn-close" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
