import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import useAuth from '../hooks/useAuth';
import api from '../config/api';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import toast from 'react-hot-toast';

export default function Profile() {
  const { profile, fetchProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ full_name: '', bio: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (profile) {
      setFormData({ full_name: profile.full_name || '', bio: profile.bio || '' });
    }
  }, [profile]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.put('/profile', formData);
      await fetchProfile();
      setIsEditing(false);
      toast.success('Profile updated');
    } catch (err) {
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const initial = profile?.full_name?.charAt(0).toUpperCase() || '?';

  return (
    <div className="max-w-3xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-3xl overflow-hidden"
      >
        <div className="h-32 bg-gradient-to-r from-accent-600 to-emerald-500 relative">
          <div className="absolute -bottom-12 left-8 w-24 h-24 bg-navy-900 rounded-full border-4 border-navy-900 flex items-center justify-center text-3xl font-bold text-white shadow-xl">
            {initial}
          </div>
        </div>
        
        <div className="pt-16 pb-8 px-8">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-2xl font-bold text-white">{profile?.full_name}</h1>
              <p className="text-navy-300">{profile?.email}</p>
              <div className="mt-2 inline-flex px-2 py-1 bg-white/10 rounded text-xs font-semibold text-white">
                {profile?.role}
              </div>
            </div>
            {!isEditing && (
              <Button onClick={() => setIsEditing(true)} variant="secondary" size="sm">
                Edit Profile
              </Button>
            )}
          </div>

          {isEditing ? (
            <form onSubmit={handleSubmit} className="space-y-4 border-t border-white/10 pt-6 mt-6">
              <Input
                label="Full Name"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                required
              />
              <div>
                <label className="block text-sm font-medium text-navy-200 mb-1">Bio</label>
                <textarea
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-accent/50 focus:ring-2 focus:ring-accent/20 transition-all resize-none"
                  rows="4"
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                />
              </div>
              <div className="flex space-x-3 pt-2">
                <Button type="submit" loading={loading}>Save Changes</Button>
                <Button type="button" variant="ghost" onClick={() => setIsEditing(false)}>Cancel</Button>
              </div>
            </form>
          ) : (
            <div className="border-t border-white/10 pt-6 mt-6">
              <h3 className="text-sm font-semibold text-navy-200 uppercase tracking-wider mb-2">About</h3>
              <p className="text-white whitespace-pre-line">{profile?.bio || 'No bio added yet.'}</p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
