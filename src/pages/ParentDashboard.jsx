// src/pages/ParentDashboard.jsx
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const ParentDashboard = () => {
  const { user, logout } = useAuth();
  const [children, setChildren] = useState([]);
  const [notes, setNotes] = useState([]);
  const [selectedChild, setSelectedChild] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchChildren();
    fetchAllNotes();
  }, []);

  const fetchChildren = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/children', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setChildren(data.children);
      }
    } catch (error) {
      console.error('Error fetching children:', error);
    }
  };

  const fetchAllNotes = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/notes', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setNotes(data.notes.slice(0, 10)); // Show recent 10 notes
      }
    } catch (error) {
      console.error('Error fetching notes:', error);
    }
  };

  const filteredNotes = selectedChild 
    ? notes.filter(note => note.author._id === selectedChild)
    : notes;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="container mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900">
              Parent Dashboard - {user?.firstName} 👨‍👩‍👧‍👦
            </h1>
            <div className="flex space-x-4">
              <button
                onClick={() => navigate('/profile')}
                className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
              >
                Profile
              </button>
              <button
                onClick={logout}
                className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Children List */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-800">My Children</h2>
              </div>
              <div className="p-6">
                {children.length > 0 ? (
                  <div className="space-y-3">
                    <button
                      onClick={() => setSelectedChild(null)}
                      className={`w-full text-left p-3 rounded border ${
                        !selectedChild 
                          ? 'bg-blue-50 border-blue-300' 
                          : 'bg-gray-50 border-gray-300'
                      }`}
                    >
                      <span className="font-medium">All Children</span>
                    </button>
                    {children.map((child) => (
                      <button
                        key={child._id}
                        onClick={() => setSelectedChild(child._id)}
                        className={`w-full text-left p-3 rounded border ${
                          selectedChild === child._id 
                            ? 'bg-blue-50 border-blue-300' 
                            : 'bg-gray-50 border-gray-300'
                        }`}
                      >
                        <div className="font-medium">{child.firstName} {child.lastName}</div>
                        <div className="text-sm text-gray-600">@{child.username}</div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No children linked yet.</p>
                )}
              </div>
            </div>
          </div>

          {/* Notes Display */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-800">
                  {selectedChild ? 'Child\'s Notes' : 'All Notes'}
                </h2>
              </div>
              <div className="p-6">
                {filteredNotes.length > 0 ? (
                  <div className="space-y-4">
                    {filteredNotes.map((note) => (
                      <div key={note._id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-medium text-gray-900">{note.title}</h3>
                          <div className="flex items-center space-x-2">
                            <span className={`px-2 py-1 rounded text-xs ${
                              note.isCompleted 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-orange-100 text-orange-800'
                            }`}>
                              {note.isCompleted ? 'Completed' : 'Pending'}
                            </span>
                            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                              {note.category}
                            </span>
                          </div>
                        </div>
                        <p className="text-gray-600 mb-3">
                          {note.content.substring(0, 200)}...
                        </p>
                        <div className="flex justify-between items-center text-sm text-gray-500">
                          <span>By: {note.author.firstName} {note.author.lastName}</span>
                          <span>{new Date(note.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500">
                      {selectedChild ? 'This child has no notes yet.' : 'No notes from children yet.'}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ParentDashboard;
