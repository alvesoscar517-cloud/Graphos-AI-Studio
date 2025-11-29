import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../../contexts/AuthContext'
import ChangePassword from './ChangePassword'
import './EmailAuth.css'

const SecuritySettings = () => {
  const { t } = useTranslation()
  const { 
    authMethod,
    changePassword,
    deleteAccount,
    getActiveSessions,
    revokeSession,
    revokeAllOtherSessions,
    getLoginHistory
  } = useAuth()
  
  const [activeTab, setActiveTab] = useState('password') // password, sessions, history, danger
  const [sessions, setSessions] = useState([])
  const [loginHistory, setLoginHistory] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deletePassword, setDeletePassword] = useState('')

  useEffect(() => {
    if (activeTab === 'sessions') {
      loadSessions()
    } else if (activeTab === 'history') {
      loadLoginHistory()
    }
  }, [activeTab])

  const loadSessions = async () => {
    setIsLoading(true)
    setError('')
    try {
      const data = await getActiveSessions()
      setSessions(data || [])
    } catch (err) {
      setError(err.message || t('auth.email.loadSessionsFailed'))
    } finally {
      setIsLoading(false)
    }
  }

  const loadLoginHistory = async () => {
    setIsLoading(true)
    setError('')
    try {
      const data = await getLoginHistory(20)
      setLoginHistory(data || [])
    } catch (err) {
      setError(err.message || t('auth.email.loadHistoryFailed'))
    } finally {
      setIsLoading(false)
    }
  }

  const handleRevokeSession = async (sessionId) => {
    setIsLoading(true)
    try {
      await revokeSession(sessionId)
      setSessions(sessions.filter(s => s.sessionId !== sessionId))
    } catch (err) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleRevokeAllOthers = async () => {
    setIsLoading(true)
    try {
      const count = await revokeAllOtherSessions()
      await loadSessions()
      alert(t('auth.email.sessionsRevoked', { count }))
    } catch (err) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteAccount = async () => {
    if (authMethod === 'email' && !deletePassword) {
      setError(t('auth.email.passwordRequired'))
      return
    }
    
    setIsLoading(true)
    try {
      await deleteAccount(deletePassword)
      // User will be logged out automatically
    } catch (err) {
      setError(err.message || t('auth.email.deleteAccountFailed'))
      setIsLoading(false)
    }
  }

  const formatDate = (date) => {
    if (!date) return 'Unknown'
    const d = new Date(date)
    return d.toLocaleString()
  }

  const parseUserAgent = (ua) => {
    if (!ua) return 'Unknown device'
    // Simple parsing - could be enhanced with a library
    if (ua.includes('Chrome')) return 'Chrome'
    if (ua.includes('Firefox')) return 'Firefox'
    if (ua.includes('Safari')) return 'Safari'
    if (ua.includes('Edge')) return 'Edge'
    return 'Unknown browser'
  }

  return (
    <div className="security-settings">
      <div className="security-tabs">
        {authMethod === 'email' && (
          <button 
            className={`tab-btn ${activeTab === 'password' ? 'active' : ''}`}
            onClick={() => setActiveTab('password')}
          >
            {t('auth.email.passwordTab')}
          </button>
        )}
        <button 
          className={`tab-btn ${activeTab === 'sessions' ? 'active' : ''}`}
          onClick={() => setActiveTab('sessions')}
        >
          {t('auth.email.sessionsTab')}
        </button>
        <button 
          className={`tab-btn ${activeTab === 'history' ? 'active' : ''}`}
          onClick={() => setActiveTab('history')}
        >
          {t('auth.email.historyTab')}
        </button>
        <button 
          className={`tab-btn danger ${activeTab === 'danger' ? 'active' : ''}`}
          onClick={() => setActiveTab('danger')}
        >
          {t('auth.email.dangerTab')}
        </button>
      </div>

      <div className="security-content">
        {error && <div className="form-error">{error}</div>}

        {activeTab === 'password' && authMethod === 'email' && (
          <ChangePassword
            onChangePassword={changePassword}
            onCancel={() => setActiveTab('sessions')}
            isLoading={isLoading}
          />
        )}

        {activeTab === 'sessions' && (
          <div className="sessions-section">
            <div className="section-header">
              <h4>{t('auth.email.activeSessions')}</h4>
              {sessions.length > 1 && (
                <button 
                  className="link-btn danger"
                  onClick={handleRevokeAllOthers}
                  disabled={isLoading}
                >
                  {t('auth.email.revokeAllOthers')}
                </button>
              )}
            </div>
            
            {isLoading ? (
              <div className="loading-spinner">{t('common.loading')}</div>
            ) : sessions.length === 0 ? (
              <p className="empty-message">{t('auth.email.noSessions')}</p>
            ) : (
              <div className="sessions-list">
                {sessions.map((session) => (
                  <div key={session.sessionId} className="session-item">
                    <div className="session-info">
                      <div className="session-device">
                        <span className="device-icon">💻</span>
                        <span className="device-name">
                          {parseUserAgent(session.deviceInfo?.userAgent)}
                        </span>
                      </div>
                      <div className="session-details">
                        <span>{t('auth.email.lastActive')}: {formatDate(session.lastActiveAt)}</span>
                        <span>{t('auth.email.created')}: {formatDate(session.createdAt)}</span>
                      </div>
                    </div>
                    <button
                      className="revoke-btn"
                      onClick={() => handleRevokeSession(session.sessionId)}
                      disabled={isLoading}
                    >
                      {t('auth.email.revoke')}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'history' && (
          <div className="history-section">
            <h4>{t('auth.email.loginHistory')}</h4>
            
            {isLoading ? (
              <div className="loading-spinner">{t('common.loading')}</div>
            ) : loginHistory.length === 0 ? (
              <p className="empty-message">{t('auth.email.noHistory')}</p>
            ) : (
              <div className="history-list">
                {loginHistory.map((entry, index) => (
                  <div key={index} className={`history-item ${entry.isNewDevice ? 'new-device' : ''}`}>
                    <div className="history-info">
                      <div className="history-device">
                        <span className="device-icon">
                          {entry.isNewDevice ? '🆕' : '💻'}
                        </span>
                        <span className="device-name">
                          {parseUserAgent(entry.deviceInfo?.userAgent)}
                        </span>
                        {entry.isNewDevice && (
                          <span className="new-device-badge">{t('auth.email.newDevice')}</span>
                        )}
                      </div>
                      <div className="history-details">
                        <span>{formatDate(entry.loginAt)}</span>
                        <span>IP: {entry.ipAddress || 'Unknown'}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'danger' && (
          <div className="danger-section">
            <h4>{t('auth.email.dangerZone')}</h4>
            <p className="danger-warning">{t('auth.email.deleteAccountWarning')}</p>
            
            {!showDeleteConfirm ? (
              <button 
                className="email-auth-btn danger"
                onClick={() => setShowDeleteConfirm(true)}
              >
                {t('auth.email.deleteAccountBtn')}
              </button>
            ) : (
              <div className="delete-confirm">
                <p>{t('auth.email.deleteConfirmMessage')}</p>
                
                {authMethod === 'email' && (
                  <div className="form-group">
                    <label>{t('auth.email.confirmWithPassword')}</label>
                    <input
                      type="password"
                      value={deletePassword}
                      onChange={(e) => setDeletePassword(e.target.value)}
                      placeholder={t('auth.email.passwordPlaceholder')}
                      disabled={isLoading}
                    />
                  </div>
                )}
                
                <div className="delete-actions">
                  <button 
                    className="email-auth-btn danger"
                    onClick={handleDeleteAccount}
                    disabled={isLoading}
                  >
                    {isLoading ? t('auth.email.deleting') : t('auth.email.confirmDelete')}
                  </button>
                  <button 
                    className="link-btn"
                    onClick={() => {
                      setShowDeleteConfirm(false)
                      setDeletePassword('')
                    }}
                    disabled={isLoading}
                  >
                    {t('auth.email.cancel')}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default SecuritySettings
