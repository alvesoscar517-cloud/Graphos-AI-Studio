import { useState } from 'react';
import { Button } from '../ui/button';
import { cn } from '@/lib/utils';

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

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-surface rounded-xl w-full max-w-lg shadow-xl" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="p-6 border-b border-border text-center relative">
          <div className="w-16 h-16 mx-auto rounded-full bg-success/10 flex items-center justify-center mb-4">
            <img src="/icon/check-circle.svg" alt="" className="w-8 h-8" style={{ filter: 'invert(48%) sepia(79%) saturate(2476%) hue-rotate(86deg) brightness(118%) contrast(119%)' }} />
          </div>
          <h2 className="text-xl font-semibold text-primary">Backup Completed</h2>
          <button className="absolute top-4 right-4 text-2xl text-muted hover:text-primary" onClick={onClose}>×</button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {/* Details */}
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-sm">
              <img src="/icon/file.svg" alt="" className="w-4 h-4 icon-gray" />
              <span className="text-muted">File:</span>
              <span className="text-primary font-medium truncate">{backupInfo.fileName}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <img src="/icon/clock.svg" alt="" className="w-4 h-4 icon-gray" />
              <span className="text-muted">Time:</span>
              <span className="text-primary">{new Date(backupInfo.timestamp).toLocaleString()}</span>
            </div>
          </div>

          {/* Storage Status */}
          <div>
            <h3 className="text-sm font-semibold text-primary mb-3 flex items-center gap-2">
              <img src="/icon/cloud.svg" alt="" className="w-4 h-4 icon-dark" />
              Storage Status
            </h3>
            <div className="space-y-2">
              {/* Cloud Storage */}
              <div className="flex items-center justify-between p-3 bg-surface-secondary rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                    <img src="/icon/cloud.svg" alt="" className="w-4 h-4" style={{ filter: 'invert(45%) sepia(98%) saturate(1653%) hue-rotate(196deg)' }} />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-primary">Cloud Storage</div>
                    <div className="text-xs text-muted">{backupInfo.cloudStorage?.bucket || 'Primary'}</div>
                  </div>
                </div>
                <span className="px-2 py-1 bg-success/10 text-success text-xs font-medium rounded-full flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-success"></span>
                  Saved
                </span>
              </div>

              {/* Google Drive */}
              <div className="flex items-center justify-between p-3 bg-surface-secondary rounded-lg">
                <div className="flex items-center gap-2">
                  <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", backupInfo.storage?.driveSynced ? "bg-green-500/10" : "bg-gray-500/10")}>
                    <img src="/icon/hard-drive.svg" alt="" className="w-4 h-4" style={{ filter: backupInfo.storage?.driveSynced ? 'invert(48%) sepia(79%) saturate(2476%) hue-rotate(86deg)' : 'grayscale(100%)' }} />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-primary">Google Drive</div>
                    <div className="text-xs text-muted">Secondary sync (shared folder)</div>
                  </div>
                </div>
                {backupInfo.storage?.driveEnabled ? (
                  <span className={cn("px-2 py-1 text-xs font-medium rounded-full flex items-center gap-1", backupInfo.storage?.driveSynced ? "bg-success/10 text-success" : "bg-warning/10 text-warning")}>
                    <span className={cn("w-1.5 h-1.5 rounded-full", backupInfo.storage?.driveSynced ? "bg-success" : "bg-warning")}></span>
                    {backupInfo.storage?.driveSynced ? 'Synced' : 'Pending'}
                  </span>
                ) : (
                  <span className="px-2 py-1 bg-gray-500/10 text-gray-500 text-xs font-medium rounded-full">
                    Disabled
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Stats */}
          <div>
            <h3 className="text-sm font-semibold text-primary mb-3 flex items-center gap-2">
              <img src="/icon/bar-chart.svg" alt="" className="w-4 h-4 icon-dark" />
              Collections Backed Up
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(backupInfo.stats || {}).map(([collection, count]) => (
                <div key={collection} className="flex items-center justify-between p-2 bg-surface-secondary rounded-lg text-sm">
                  <span className="text-muted capitalize">{collection.replace('_', ' ')}</span>
                  <span className="font-medium text-primary">{count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Download */}
          <div>
            <h3 className="text-sm font-semibold text-primary mb-2 flex items-center gap-2">
              <img src="/icon/download.svg" alt="" className="w-4 h-4 icon-dark" />
              Download Backup
            </h3>
            <p className="text-xs text-muted mb-3">Signed URL valid for 7 days</p>

            <div className="flex gap-2 mb-3">
              <Button onClick={handleDownload} className="flex-1">
                <img src="/icon/download.svg" alt="" className="w-4 h-4 icon-white" />
                Download
              </Button>
              <Button variant={copying ? "success" : "secondary"} onClick={handleCopyLink}>
                <img src="/icon/copy.svg" alt="" className={cn("w-4 h-4", copying ? "icon-white" : "icon-dark")} />
                {copying ? 'Copied!' : 'Copy URL'}
              </Button>
            </div>

            <input 
              type="text" 
              value={backupInfo.downloadUrl} 
              readOnly 
              onClick={(e) => e.target.select()}
              className="w-full px-3 py-2 text-xs bg-surface-secondary border border-border rounded-lg text-muted"
            />
          </div>

          {/* Email Notice */}
          <div className="flex items-center gap-2 p-3 bg-info/10 rounded-lg text-sm text-info">
            <img src="/icon/mail.svg" alt="" className="w-4 h-4" />
            <p>Backup notification sent to your email</p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border">
          <Button variant="secondary" className="w-full" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}
