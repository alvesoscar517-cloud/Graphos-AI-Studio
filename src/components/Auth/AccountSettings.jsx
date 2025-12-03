import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useUser, useAuthMethod, useHasGoogleLinked } from '../../stores/authStore'
import { useAuth } from '../../contexts/AuthContext'
import { cn } from '../../lib/utils'
import LinkGoogleAccount from './LinkGoogleAccount'
import SecuritySettings from './SecuritySettings'

const AccountSettings = () => {
  const { t } = useTranslation()
  const [activeSection, setActiveSection] = useState('account')
  // Use Zustand stores for user data
  const user = useUser()
  const authMethod = useAuthMethod()
  const hasGoogleLinked = useHasGoogleLinked()
  // Keep actions from context
  const { linkGoogleAccount, unlinkGoogleAccount } = useAuth()

  if (!user) return null

  return (
    <div className="p-5">
      {/* Tabs */}
      <div className="flex gap-1 mb-5 border-b border-border">
        <button onClick={() => setActiveSection('account')}
          className={cn("px-5 py-3 text-sm font-medium border-b-2 -mb-px transition-all",
            activeSection === 'account' ? "text-text-primary border-primary" : "text-text-muted border-transparent hover:text-text-primary")}>
          {t('auth.email.accountTab') || 'Account'}
        </button>
        <button onClick={() => setActiveSection('security')}
          className={cn("px-5 py-3 text-sm font-medium border-b-2 -mb-px transition-all",
            activeSection === 'security' ? "text-text-primary border-primary" : "text-text-muted border-transparent hover:text-text-primary")}>
          {t('auth.email.securityTab') || 'Security'}
        </button>
      </div>

      {activeSection === 'account' && (
        <>
          {/* Account Info */}
          <div className="flex items-center gap-4 p-5 bg-bg-secondary rounded-xl mb-5">
            <div className="w-16 h-16 rounded-full overflow-hidden shrink-0">
              {user.picture ? (
                <img src={user.picture} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-gray-900 to-gray-700 text-white flex items-center justify-center text-2xl font-semibold">
                  {user.name?.charAt(0)?.toUpperCase() || 'U'}
                </div>
              )}
            </div>
            <div>
              <h3 className="m-0 mb-1 text-lg font-semibold text-text-primary">{user.name}</h3>
              <p className="m-0 mb-2 text-sm text-text-muted">{user.email}</p>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-bg-primary border border-border rounded-full text-xs font-medium text-text-muted">
                {authMethod === 'google' ? (
                  <><svg width="14" height="14" viewBox="0 0 18 18" fill="none">
                    <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" fill="#4285F4"/>
                    <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z" fill="#34A853"/>
                    <path d="M3.964 10.71c-.18-.54-.282-1.117-.282-1.71s.102-1.17.282-1.71V4.958H.957C.347 6.173 0 7.548 0 9s.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
                    <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
                  </svg>Google</>
                ) : (
                  <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
                  </svg>Email</>
                )}
              </span>
            </div>
          </div>

          {authMethod === 'email' && (
            <LinkGoogleAccount isLinked={hasGoogleLinked} linkedEmail={user.googleLinked?.googleEmail} onLink={linkGoogleAccount} onUnlink={unlinkGoogleAccount} />
          )}

          {authMethod === 'google' && (
            <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
                </svg>
              </div>
              <div>
                <h4 className="m-0 mb-0.5 text-sm font-semibold text-green-800">{t('auth.email.googleLinkTitle')}</h4>
                <p className="m-0 text-sm text-green-700">Google Drive sync is enabled</p>
              </div>
            </div>
          )}
        </>
      )}

      {activeSection === 'security' && <SecuritySettings />}
    </div>
  )
}

export default AccountSettings