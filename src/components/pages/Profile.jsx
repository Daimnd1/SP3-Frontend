import { useState } from "react";
import { Camera, Mail, User, Briefcase, Calendar } from "lucide-react";

export default function Profile() {
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    name: "John Doe",
    email: "john.doe@example.com",
    occupation: "Software Developer",
    joinDate: "January 2025",
  });
  const [editedData, setEditedData] = useState(profileData);

  const handleSave = () => {
    setProfileData(editedData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedData(profileData);
    setIsEditing(false);
  };

  return (
    <div className="space-y-6">
      <h1 className="font-semibold text-4xl text-zinc-200">Profile</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="lg:col-span-1">
          <div className="bg-zinc-800 border-2 border-zinc-700 rounded-lg p-6 space-y-6">
            {/* Profile Picture */}
            <div className="flex flex-col items-center space-y-4">
              <div className="relative">
                <div className="w-32 h-32 bg-zinc-700 rounded-full flex items-center justify-center">
                  <User size={64} className="text-zinc-500" />
                </div>
                <button className="absolute bottom-0 right-0 p-2 bg-sky-600 hover:bg-sky-700 rounded-full transition-colors">
                  <Camera size={20} className="text-zinc-200" />
                </button>
              </div>
              <div className="text-center">
                <h2 className="text-2xl font-bold text-zinc-200">
                  {profileData.name}
                </h2>
                <p className="text-zinc-400">{profileData.occupation}</p>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="border-t border-zinc-700 pt-4 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-zinc-400">Member Since</span>
                <span className="text-zinc-200 font-semibold">
                  {profileData.joinDate}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-zinc-400">Desk Sessions</span>
                <span className="text-zinc-200 font-semibold">127</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-zinc-400">Total Hours</span>
                <span className="text-zinc-200 font-semibold">342h</span>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Information */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-zinc-800 border-2 border-zinc-700 rounded-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold text-zinc-200">
                Personal Information
              </h2>
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-zinc-200 rounded-lg transition-colors"
                >
                  Edit Profile
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={handleSave}
                    className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-zinc-200 rounded-lg transition-colors"
                  >
                    Save
                  </button>
                  <button
                    onClick={handleCancel}
                    className="px-4 py-2 bg-zinc-600 hover:bg-zinc-500 text-zinc-200 rounded-lg transition-colors"
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
      <div className="p-3 bg-zinc-700 rounded-lg">
        <Icon size={24} className="text-zinc-400" />
      </div>
      <div className="flex-1">
        <label className="block text-sm font-medium text-zinc-400 mb-1">
          {label}
        </label>
        {isEditing ? (
          <input
            type={type}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full px-3 py-2 bg-zinc-700 border border-zinc-600 rounded-lg text-zinc-200 focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
        ) : (
          <p className="text-zinc-200 font-medium">{value}</p>
        )}
      </div>
    </div>
  );
}
