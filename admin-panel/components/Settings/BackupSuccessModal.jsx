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
    // Mở Google Drive với link upload
    const driveUrl = `https://drive.google.com/drive/u/0/my-drive`;
    window.open(driveUrl, '_blank');
    
    // Đồng thời download file để user có thể upload
    handleDownload();
  };

  const formatSize = (bytes) => {
    return (bytes / 1024 / 1024).toFixed(2) + ' MB';
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="backup-success-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="success-icon">
            <img src="/icon/check-circle.svg" alt="Success" />
          </div>
          <h2>🎉 Backup thành công!</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="modal-body">
          <div className="backup-details">
            <div className="detail-row">
              <span className="label">📁 File:</span>
              <span className="value">{backupInfo.fileName}</span>
            </div>
            <div className="detail-row">
              <span className="label">🕐 Thời gian:</span>
              <span className="value">{new Date(backupInfo.timestamp).toLocaleString('vi-VN')}</span>
            </div>
            <div className="detail-row">
              <span className="label">📦 Bucket:</span>
              <span className="value">{backupInfo.bucket}</span>
            </div>
          </div>

          <div className="backup-stats">
            <h3>📊 Thống kê:</h3>
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
            <h3>📥 Tải xuống Backup:</h3>
            <p className="download-hint">
              Link download có hiệu lực trong 7 ngày. Bạn có thể lưu vào Google Drive cá nhân.
            </p>

            <div className="action-buttons">
              <button className="btn-primary" onClick={handleDownload}>
                <img src="/icon/download.svg" alt="Download" />
                Tải xuống ngay
              </button>

              <button className="btn-secondary" onClick={handleSaveToDrive}>
                <img src="/icon/upload.svg" alt="Drive" />
                Lưu vào Drive
              </button>

              <button 
                className={`btn-copy ${copying ? 'copied' : ''}`} 
                onClick={handleCopyLink}
              >
                <img src="/icon/copy.svg" alt="Copy" />
                {copying ? 'Đã copy!' : 'Copy link'}
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
            <p>
              Link download cũng đã được gửi đến email <strong>{backupInfo.emailSent ? '✅' : '⏳'}</strong>
            </p>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn-close" onClick={onClose}>
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
