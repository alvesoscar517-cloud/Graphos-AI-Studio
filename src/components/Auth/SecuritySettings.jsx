import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuthMethod, useAuth } from '../../stores/authStore'
import { cn } from '../../lib/utils'
import ChangePasswordV2 from './ChangePasswordV2'

const SecuritySettings = () => {
  const { t } = useTranslation()
  const authMethod = useAuthMethod() // Use Zustand store
  const { changePassword, deleteAccount, getActiveSessions, revokeSession, revokeAllOtherSessions, getLoginHistory } = useAuth()
  const [activeTab, setActiveTab] = useState('password')
  const [sessions, setSessions] = useState([])
  const [loginHistory, setLoginHistory] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deletePassword, setDeletePassword] = useState('')

  useEffect(() => {
    if (activeTab === 'sessions') loadSessions()
    else if (activeTab === 'history') loadLoginHistory()
  }, [activeTab])

  const loadSessions = async () => {
    setIsLoading(true); setError('')
    try { const data = await getActiveSessions(); setSessions(data || []) }
    catch (err) { setError(err.message || t('auth.email.loadSessionsFailed')) }
    finally { setIsLoading(false) }
  }

  const loadLoginHistory = async () => {
    setIsLoading(true); setError('')
    try { const data = await getLoginHistory(20); setLoginHistory(data || []) }
    catch (err) { setError(err.message || t('auth.email.loadHistoryFailed')) }
    finally { setIsLoading(false) }
  }

  const handleRevokeSession = async (sessionId) => {
    setIsLoading(true)
    try { await revokeSession(sessionId); setSessions(sessions.filter(s => s.sessionId !== sessionId)) }
    catch (err) { setError(err.message) }
    finally { setIsLoading(false) }
  }

  const handleRevokeAllOthers = async () => {
    setIsLoading(true)
    try { const count = await revokeAllOtherSessions(); await loadSessions(); alert(t('auth.email.sessionsRevoked', { count })) }
    catch (err) { setError(err.message) }
    finally { setIsLoading(false) }
  }

  const handleDeleteAccount = async () => {
    if (authMethod === 'email' && !deletePassword) { setError(t('auth.email.passwordRequired')); return }
    setIsLoading(true)
    try { await deleteAccount(deletePassword) }
    catch (err) { setError(err.message || t('auth.email.deleteAccountFailed')); setIsLoading(false) }
  }

  const formatDate = (date) => date ? new Date(date).toLocaleString() : 'Unknown'
  const parseUserAgent = (ua) => {
    if (!ua) return 'Unknown device'
    if (ua.includes('Chrome')) return 'Chrome'
    if (ua.includes('Firefox')) return 'Firefox'
    if (ua.includes('Safari')) return 'Safari'
    if (ua.includes('Edge')) return 'Edge'
    return 'Unknown browser'
  }

  const tabClass = (tab, danger = false) => cn(
    "px-4 py-3 text-sm font-medium border-b-2 -mb-px transition-all",
    activeTab === tab ? (danger ? "text-red-600 border-red-600" : "text-text-primary border-primary") : "text-text-muted border-transparent hover:text-text-primary",
    danger && "text-red-600"
  )

  return (
    <div className="p-5">
      <div className="flex gap-1 mb-6 border-b border-border-light">
        {authMethod === 'email' && <button onClick={() => setActiveTab('password')} className={tabClass('password')}>{t('auth.email.passwordTab')}</button>}
        <button onClick={() => setActiveTab('sessions')} className={tabClass('sessions')}>{t('auth.email.sessionsTab')}</button>
        <button onClick={() => setActiveTab('history')} className={tabClass('history')}>{t('auth.email.historyTab')}</button>
        <button onClick={() => setActiveTab('danger')} className={tabClass('danger', true)}>{t('auth.email.dangerTab')}</button>
      </div>

      <div className="min-h-[300px]">
        {error && <div className="flex items-center gap-2.5 p-3.5 mb-5 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
          <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="#dc2626"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>{error}
        </div>}

        {activeTab === 'password' && authMethod === 'email' && <ChangePasswordV2 onChangePassword={changePassword} onCancel={() => setActiveTab('sessions')} isLoading={isLoading} />}

        {activeTab === 'sessions' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h4 className="m-0 text-base font-semibold text-text-primary">{t('auth.email.activeSessions')}</h4>
              {sessions.length > 1 && <button onClick={handleRevokeAllOthers} disabled={isLoading} className="text-red-600 text-sm font-medium hover:text-red-700 disabled:opacity-60">{t('auth.email.revokeAllOthers')}</button>}
            </div>
            {isLoading ? <div className="text-center py-10 text-text-muted">{t('common.loading')}</div>
              : sessions.length === 0 ? <p className="text-center py-10 text-sm text-text-muted">{t('auth.email.noSessions')}</p>
              : <div className="flex flex-col gap-3">
                {sessions.map((session) => (
                  <div key={session.sessionId} className="flex justify-between items-center p-4 bg-bg-secondary rounded-lg border border-border-light">
                    <div>
                      <div className="flex items-center gap-2 mb-1"><span>💻</span><span className="text-sm font-medium text-text-primary">{parseUserAgent(session.deviceInfo?.userAgent)}</span></div>
                      <div className="flex gap-4 text-xs text-text-muted">
                        <span>{t('auth.email.lastActive')}: {formatDate(session.lastActiveAt)}</span>
                        <span>{t('auth.email.created')}: {formatDate(session.createdAt)}</span>
                      </div>
                    </div>
                    <button onClick={() => handleRevokeSession(session.sessionId)} disabled={isLoading}
                      className="px-4 py-2 text-xs font-medium bg-white border border-red-200 rounded-md text-red-600 hover:bg-red-50 disabled:opacity-60">{t('auth.email.revoke')}</button>
                  </div>
                ))}
              </div>}
          </div>
        )}
    
    {activeTab === 'history' && (
          <div>
            <h4 className="m-0 mb-4 text-base font-semibold text-text-primary">{t('auth.email.loginHistory')}</h4>
            {isLoading ? <div className="text-center py-10 text-text-muted">{t('common.loading')}</div>
              : loginHistory.length === 0 ? <p className="text-center py-10 text-sm text-text-muted">{t('auth.email.noHistory')}</p>
              : <div className="flex flex-col gap-3">
                {loginHistory.map((entry, index) => (
                  <div key={index} className={cn("flex justify-between items-center p-4 rounded-lg border", entry.isNewDevice ? "bg-amber-50 border-amber-300" : "bg-bg-secondary border-border-light")}>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span>{entry.isNewDevice ? '🆕' : '💻'}</span>
                        <span className="text-sm font-medium text-text-primary">{parseUserAgent(entry.deviceInfo?.userAgent)}</span>
                        {entry.isNewDevice && <span className="px-2 py-0.5 bg-amber-400 text-amber-900 text-2xs font-semibold rounded-full uppercase">{t('auth.email.newDevice')}</span>}
                      </div>
                      <div className="flex gap-4 text-xs text-text-muted">
                        <span>{formatDate(entry.loginAt)}</span>
                        <span>IP: {entry.ipAddress || 'Unknown'}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>}
          </div>
        )}

        {activeTab === 'danger' && (
          <div className="p-5 bg-red-50 border border-red-200 rounded-xl">
            <h4 className="m-0 mb-3 text-base font-semibold text-red-600">{t('auth.email.dangerZone')}</h4>
            <p className="m-0 mb-5 text-sm text-red-800 leading-relaxed">{t('auth.email.deleteAccountWarning')}</p>
            {!showDeleteConfirm ? (
              <button onClick={() => setShowDeleteConfirm(true)} className="w-full py-3 px-4 text-sm font-medium rounded-lg bg-red-600 text-white hover:bg-red-700 transition-all">{t('auth.email.deleteAccountBtn')}</button>
            ) : (
              <div className="mt-4 pt-4 border-t border-red-200">
                <p className="m-0 mb-4 text-sm text-red-800 font-medium">{t('auth.email.deleteConfirmMessage')}</p>
                {authMethod === 'email' && (
                  <div className="mb-4">
                    <label className="block mb-1.5 text-sm font-medium text-red-700">{t('auth.email.confirmWithPassword')}</label>
                    <input type="password" value={deletePassword} onChange={(e) => setDeletePassword(e.target.value)} placeholder={t('auth.email.passwordPlaceholder')} disabled={isLoading}
                      className="w-full px-3.5 py-3 text-sm border border-red-300 rounded-lg bg-white text-gray-800 focus:outline-none focus:border-red-500 disabled:opacity-80" />
                  </div>
                )}
                <div className="flex gap-3">
                  <button onClick={handleDeleteAccount} disabled={isLoading} className="flex-1 py-3 px-4 text-sm font-medium rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-60 transition-all">
                    {isLoading ? t('auth.email.deleting') : t('auth.email.confirmDelete')}
                  </button>
                  <button onClick={() => { setShowDeleteConfirm(false); setDeletePassword('') }} disabled={isLoading}
                    className="px-4 py-3 text-sm font-medium text-red-600 hover:text-red-700 disabled:opacity-60">{t('auth.email.cancel')}</button>
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