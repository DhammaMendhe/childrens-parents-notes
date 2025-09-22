// src/pages/Home.jsx
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Family Notes App
          </h1>
          <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
            A safe space for children to create and manage their notes, 
            while parents can view and support their learning journey.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate('/login')}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg text-lg"
            >
              Sign In
            </button>
            <button
              onClick={() => navigate('/register')}
              className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-3 px-8 rounded-lg text-lg"
            >
              Sign Up
            </button>
          </div>
        </div>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <div className="bg-white p-8 rounded-lg shadow-lg">
            <div className="text-4xl mb-4">👶</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">For Children</h3>
            <ul className="text-gray-600 space-y-2">
              <li>✅ Create and organize your notes</li>
              <li>✅ Mark tasks as complete</li>
              <li>✅ Categorize by homework, personal, etc.</li>
              <li>✅ Safe and secure environment</li>
            </ul>
          </div>
          
          <div className="bg-white p-8 rounded-lg shadow-lg">
            <div className="text-4xl mb-4">👨‍👩‍👧‍👦</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">For Parents</h3>
            <ul className="text-gray-600 space-y-2">
              <li>✅ View your children's notes</li>
              <li>✅ Monitor their progress</li>
              <li>✅ Support their learning</li>
              <li>✅ Stay connected with their activities</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
