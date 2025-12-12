import { useState, useEffect } from "react";
import { Camera, Mail, User, Briefcase, Calendar, LogOut } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import Auth from "../Auth";

export default function Profile() {
  const { user, loading, signOut, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    occupation: "",
    joinDate: "",
  });
  const [editedData, setEditedData] = useState(profileData);

  useEffect(() => {
    if (user) {
      const joinDate = new Date(user.created_at).toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric'
      });
      
      const userData = {
        name: user.user_metadata?.username || user.email?.split('@')[0] || "User",
        email: user.email || "",
        occupation: user.user_metadata?.occupation || "",
        joinDate: joinDate,
      };
      
      setProfileData(userData);
      setEditedData(userData);
    }
  }, [user]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const { error } = await updateProfile({
        full_name: editedData.name,
        occupation: editedData.occupation,
      });
      
      if (error) throw error;
      
      setProfileData(editedData);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditedData(profileData);
    setIsEditing(false);
  };

  const handleSignOut = async () => {
    await signOut();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Auth />;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="font-semibold text-4xl text-gray-900 dark:text-gray-200">Profile</h1>
        <button
          onClick={handleSignOut}
          className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
        >
          <LogOut size={20} />
          Sign Out
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-lg p-6 space-y-6">
            {/* Profile Picture */}
            <div className="flex flex-col items-center space-y-4">
              <div className="relative">
                <div className="w-32 h-32 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                  <User size={64} className="text-gray-400 dark:text-gray-500" />
                </div>
                <button className="absolute bottom-0 right-0 p-2 bg-blue-600 hover:bg-blue-700 rounded-full transition-colors">
                  <Camera size={20} className="text-white dark:text-gray-200" />
                </button>
              </div>
              <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-200">
                  {profileData.name}
                </h2>
                <p className="text-gray-600 dark:text-gray-400">{profileData.occupation}</p>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-4 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Member Since</span>
                <span className="text-gray-900 dark:text-gray-200 font-semibold">
                  {profileData.joinDate}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Desk Sessions</span>
                <span className="text-gray-900 dark:text-gray-200 font-semibold">127</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Total Hours</span>
                <span className="text-gray-900 dark:text-gray-200 font-semibold">342h</span>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Information */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-200">
                Personal Information
              </h2>
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white dark:text-gray-200 rounded-lg transition-colors"
                >
                  Edit Profile
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white dark:text-gray-200 rounded-lg transition-colors"
                  >
                    {saving ? 'Saving...' : 'Save'}
                  </button>
                  <button
                    onClick={handleCancel}
                    disabled={saving}
                    className="px-4 py-2 bg-gray-600 hover:bg-gray-500 disabled:bg-gray-400 text-white dark:bg-gray-600 dark:hover:bg-gray-500 dark:text-gray-200 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <ProfileField
                icon={User}
                label="Full Name"
                value={editedData.name}
                isEditing={isEditing}
                onChange={(value) =>
                  setEditedData({ ...editedData, name: value })
                }
              />
              <ProfileField
                icon={Mail}
                label="Email"
                value={editedData.email}
                isEditing={isEditing}
                onChange={(value) =>
                  setEditedData({ ...editedData, email: value })
                }
                type="email"
              />
              <ProfileField
                icon={Briefcase}
                label="Occupation"
                value={editedData.occupation}
                isEditing={isEditing}
                onChange={(value) =>
                  setEditedData({ ...editedData, occupation: value })
                }
              />
              <ProfileField
                icon={Calendar}
                label="Member Since"
                value={profileData.joinDate}
                isEditing={false}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProfileField({
  icon: Icon,
  label,
  value,
  isEditing,
  onChange,
  type = "text",
}) {
  return (
    <div className="flex items-center gap-4">
      <div className="p-3 bg-gray-200 dark:bg-gray-700 rounded-lg">
        <Icon size={24} className="text-gray-600 dark:text-gray-400" />
      </div>
      <div className="flex-1">
        <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
          {label}
        </label>
        {isEditing ? (
          <input
            type={type}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        ) : (
          <p className="text-gray-900 dark:text-gray-200 font-medium">{value}</p>
        )}
      </div>
    </div>
  );
}
