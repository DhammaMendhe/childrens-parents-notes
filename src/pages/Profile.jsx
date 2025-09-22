// src/pages/Profile.jsx
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const Profile = () => {
  const { user } = useAuth();
  const [profileData, setProfileData] = useState(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/profile', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setProfileData(data.user);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  if (!profileData) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-xl">Loading...</div>
    </div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Profile</h1>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">Full Name</label>
                <p className="mt-1 text-lg text-gray-900">
                  {profileData.firstName} {profileData.lastName}
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Username</label>
                <p className="mt-1 text-lg text-gray-900">{profileData.username}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <p className="mt-1 text-lg text-gray-900">{profileData.email}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Role</label>
                <span className={`mt-1 inline-block px-3 py-1 rounded-full text-sm font-medium ${
                  profileData.role === 'child' 
                    ? 'bg-blue-100 text-blue-800' 
                    : 'bg-purple-100 text-purple-800'
                }`}>
                  {profileData.role === 'child' ? 'Child' : 'Parent'}
                </span>
              </div>

              {profileData.role === 'child' && profileData.parents?.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Parents</label>
                  <div className="space-y-2">
                    {profileData.parents.map((parent) => (
                      <div key={parent._id} className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-sm font-medium">
                            {parent.firstName[0]}
                          </span>
                        </div>
                        <span>{parent.firstName} {parent.lastName}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {profileData.role === 'parent' && profileData.children?.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Children</label>
                  <div className="space-y-2">
                    {profileData.children.map((child) => (
                      <div key={child._id} className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-sm font-medium">
                            {child.firstName[0]}
                          </span>
                        </div>
                        <span>{child.firstName} {child.lastName}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
