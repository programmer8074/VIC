import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, Heart, ArrowLeft } from 'lucide-react';

const RoleSelection = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-6">
      <div className="max-w-5xl w-full">
        <button
          onClick={() => navigate('/')}
          className="mb-8 flex items-center gap-2 text-gray-600 hover:text-gray-900 transition"
        >
          <ArrowLeft size={20} />
          Back to Home
        </button>

        <h2 className="text-4xl font-bold text-center text-gray-900 mb-4">
          Choose Your Role
        </h2>
        <p className="text-center text-gray-600 mb-12 text-lg">
          Select how you'd like to join VisionConnect
        </p>

        <div className="grid md:grid-cols-2 gap-8">
          <div
            onClick={() => navigate('/signup-user')}
            className="bg-white rounded-3xl p-10 shadow-xl hover:shadow-2xl transition transform hover:scale-105 cursor-pointer border-2 border-transparent hover:border-blue-500"
          >
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mb-6 mx-auto">
              <Eye className="text-white" size={40} />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 text-center mb-4">
              I Need Assistance
            </h3>
            <p className="text-gray-600 text-center mb-6">
              Connect with trusted volunteers for safe outdoor travel and mobility support
            </p>
            <ul className="space-y-3 mb-6">
              <li className="flex items-start gap-2 text-gray-700">
                <span className="text-blue-600 font-bold">✓</span>
                Voice-enabled navigation
              </li>
              <li className="flex items-start gap-2 text-gray-700">
                <span className="text-blue-600 font-bold">✓</span>
                Biometric authentication
              </li>
              <li className="flex items-start gap-2 text-gray-700">
                <span className="text-blue-600 font-bold">✓</span>
                24/7 volunteer availability
              </li>
            </ul>
            <button className="w-full py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold rounded-xl hover:shadow-lg transition">
              Sign Up as User
            </button>
          </div>

          <div
            onClick={() => navigate('/signup-volunteer')}
            className="bg-white rounded-3xl p-10 shadow-xl hover:shadow-2xl transition transform hover:scale-105 cursor-pointer border-2 border-transparent hover:border-purple-500"
          >
            <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center mb-6 mx-auto">
              <Heart className="text-white" size={40} />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 text-center mb-4">
              I Want to Help
            </h3>
            <p className="text-gray-600 text-center mb-6">
              Become a verified volunteer and make a meaningful difference in someone's life
            </p>
            <ul className="space-y-3 mb-6">
              <li className="flex items-start gap-2 text-gray-700">
                <span className="text-purple-600 font-bold">✓</span>
                Flexible volunteering hours
              </li>
              <li className="flex items-start gap-2 text-gray-700">
                <span className="text-purple-600 font-bold">✓</span>
                Verified profile badge
              </li>
              <li className="flex items-start gap-2 text-gray-700">
                <span className="text-purple-600 font-bold">✓</span>
                Community impact tracking
              </li>
            </ul>
            <button className="w-full py-4 bg-gradient-to-r from-purple-600 to-purple-700 text-white font-bold rounded-xl hover:shadow-lg transition">
              Sign Up as Volunteer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoleSelection;
