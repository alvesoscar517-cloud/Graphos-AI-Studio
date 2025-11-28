import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { usersApi } from '../../services/adminApi';
import { useNotify } from '../Common/NotificationProvider';
import LoadingScreen from '../Common/LoadingScreen';
import PageHeader from '../Common/PageHeader';
import './UserProfiles.css';

export default function UserProfiles() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const notify = useNotify();
  
  const [user, setUser] = useState(null);
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [userId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [userResponse, profilesResponse] = await Promise.all([
        usersApi.getById(userId),
        usersApi.getProfiles(userId)
      ]);
      setUser(userResponse.user);
      setProfiles(profilesResponse.profiles);
    } catch (err) {
      notify.error('Error loading data: ' + err.message);
      navigate(`/users/${userId}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProfile = async (profileId, profileName) => {
    const confirmed = await notify.confirm({
      title: 'Delete Profile',
      message: `Are you sure you want to delete profile "${profileName}"?`,
      confirmText: 'Delete',
      type: 'danger'
    });

    if (!confirmed) return;

    try {
      await usersApi.deleteProfile(userId, profileId);
      notify.success('Profile deleted successfully!');
      loadData();
    } catch (err) {
      notify.error('Error: ' + err.message);
    }
  };

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <div className="user-profiles-page">
      <PageHeader
        icon="folder.svg"
        title={`Manage Profiles - ${user?.name || user?.email || userId}`}
        subtitle="Voice profiles and writing styles"
        actions={
          <button className="btn-back" onClick={() => navigate(`/users/${userId}`)}>
            <img src="/icon/arrow-left.svg" alt="Back" />
            Back
          </button>
        }
      />

      {/* User Quick Info */}
      <div className="user-quick-info">
        <div className="info-item">
          <span className="label">Email:</span>
          <span className="value">{user?.email}</span>
        </div>
        <div className="info-item">
          <span className="label">Total Profiles:</span>
          <span className="value">{profiles.length}</span>
        </div>
      </div>

      {/* Profiles Content */}
      <div className="profiles-content">
        {profiles.length > 0 ? (
          <div className="profiles-grid">
            {profiles.map(profile => (
              <div key={profile.id} className="profile-card">
                <div className="profile-card-header">
                  <div className="profile-card-icon">
                    <img src="/icon/file-text.svg" alt="Profile" />
                  </div>
                  <button 
                    className="profile-card-delete"
                    onClick={() => handleDeleteProfile(profile.id, profile.name)}
                    title="Delete profile"
                  >
                    <img src="/icon/trash-2.svg" alt="Delete" />
                  </button>
                </div>
                
                <div className="profile-card-body">
                  <h3 className="profile-card-name">{profile.name}</h3>
                  
                  <div className="profile-card-meta">
                    <div className={`profile-card-status ${profile.status}`}>
                      <img 
                        src={`/icon/${profile.status === 'ready' ? 'check-circle' : 'clock'}.svg`} 
                        alt="Status" 
                      />
                      <span>{profile.status === 'ready' ? 'Ready' : 'Processing'}</span>
                    </div>
                    
                    <div className="profile-card-info">
                      <div className="profile-card-info-item">
                        <img src="/icon/file.svg" alt="Samples" />
                        <span>{profile.samplesCount} samples</span>
                      </div>
                      {profile.createdAt && (
                        <div className="profile-card-info-item">
                          <img src="/icon/calendar.svg" alt="Created" />
                          <span>{new Date(profile.createdAt).toLocaleDateString()}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <img src="/icon/inbox.svg" alt="Empty" />
            <h3>No profiles found</h3>
            <p>This user hasn't created any voice profiles yet</p>
          </div>
        )}
      </div>
    </div>
  );
}
