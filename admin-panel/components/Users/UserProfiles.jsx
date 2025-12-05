import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { usersApi } from '../../services/adminApi';
import { useNotify } from '../Common/NotificationProvider';
import LoadingScreen from '../Common/LoadingScreen';
import PageHeader from '../Common/PageHeader';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { cn } from '@/lib/utils';

export default function UserProfiles() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const notify = useNotify();
  
  const [user, setUser] = useState(null);
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingProfile, setDeletingProfile] = useState(null);

  useEffect(() => { loadData(); }, [userId]);

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
      notify.error('Error: ' + err.message);
      navigate(`/users/${userId}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProfile = async (profileId, profileName) => {
    const confirmed = await notify.confirm({
      title: 'Delete Profile',
      message: `Delete "${profileName}"?`,
      type: 'danger'
    });
    if (!confirmed) return;
    try {
      setDeletingProfile(profileId);
      await usersApi.deleteProfile(userId, profileId);
      notify.success('Deleted!');
      loadData();
    } catch (err) {
      notify.error('Error: ' + err.message);
    } finally {
      setDeletingProfile(null);
    }
  };

  if (loading) return <LoadingScreen />;

  return (
    <div className="p-6">
      <PageHeader
        icon="folder.svg"
        title={`Profiles - ${user?.name || user?.email || userId}`}
        subtitle="Voice profiles and writing styles"
        actions={
          <Button variant="ghost" onClick={() => navigate(`/users/${userId}`)}>
            <img src="/icon/arrow-left.svg" alt="" className="w-4 h-4" /> Back
          </Button>
        }
      />

      {/* Quick Info */}
      <div className="flex gap-6 mt-4 text-sm">
        <div><span className="text-muted">Email:</span> <span className="text-primary font-medium">{user?.email}</span></div>
        <div><span className="text-muted">Total:</span> <span className="text-primary font-medium">{profiles.length} profiles</span></div>
      </div>

      {/* Profiles Grid */}
      {profiles.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
          {profiles.map(profile => (
            <Card key={profile.id} className="p-5 relative group">
              <button
                className="absolute top-3 right-3 w-8 h-8 rounded-lg bg-surface-secondary opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity hover:bg-destructive/10 disabled:opacity-50"
                onClick={() => handleDeleteProfile(profile.id, profile.name)}
                disabled={deletingProfile === profile.id}
              >
                {deletingProfile === profile.id ? (
                  <div className="w-4 h-4 border-2 border-destructive border-t-transparent rounded-full animate-spin" />
                ) : (
                  <img src="/icon/trash-2.svg" alt="" className="w-4 h-4" style={{ filter: 'invert(36%) sepia(76%) saturate(2696%) hue-rotate(338deg)' }} />
                )}
              </button>

              <div className="flex items-start gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-surface-secondary flex items-center justify-center">
                  <img src="/icon/file-text.svg" alt="" className="w-5 h-5 icon-dark" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-primary truncate">{profile.name}</h3>
                  <Badge variant={profile.status === 'ready' ? 'success' : 'warning'} className="mt-1">
                    {profile.status === 'ready' ? 'Ready' : 'Processing'}
                  </Badge>
                </div>
              </div>

              <div className="flex items-center gap-4 text-xs text-muted">
                <span className="flex items-center gap-1">
                  <img src="/icon/file.svg" alt="" className="w-3 h-3" />
                  {profile.samplesCount} samples
                </span>
                {profile.createdAt && (
                  <span className="flex items-center gap-1">
                    <img src="/icon/calendar.svg" alt="" className="w-3 h-3" />
                    {new Date(profile.createdAt).toLocaleDateString()}
                  </span>
                )}
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 mt-6 bg-surface rounded-xl border border-border">
          <img src="/icon/inbox.svg" alt="" className="w-12 h-12 icon-gray mb-4" />
          <h3 className="font-semibold text-primary mb-1">No profiles found</h3>
          <p className="text-sm text-muted">This user hasn't created any profiles yet</p>
        </div>
      )}
    </div>
  );
}
