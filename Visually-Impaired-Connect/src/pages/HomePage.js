import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, Users, Shield, Globe, Mic, Fingerprint, MapPin, Clock } from 'lucide-react';
import VoiceAssistant from '../components/VoiceAssistant';

const HomePage = () => {
  const navigate = useNavigate();
  const [showVoiceAssistant, setShowVoiceAssistant] = useState(false);

  const features = [
    { icon: <Mic size={32} />, title: 'Voice Enabled', desc: 'Complete voice navigation for hands-free experience' },
    { icon: <Fingerprint size={32} />, title: 'Biometric Security', desc: 'Face & fingerprint authentication for safety' },
    { icon: <Globe size={32} />, title: 'Multi-Language', desc: 'Support for multiple regional languages' },
    { icon: <Shield size={32} />, title: 'Verified Volunteers', desc: 'Trusted companions for your journey' },
  ];

  const useCases = [
    { icon: <Clock size={24} />, title: 'Examinations', desc: 'Reach your exam center on time' },
    { icon: <MapPin size={24} />, title: 'Urgent Travel', desc: 'Emergency mobility assistance' },
    { icon: <Users size={24} />, title: 'Daily Activities', desc: 'Shopping, appointments, and more' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
              <Eye className="text-white" size={24} />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              VisionConnect
            </h1>
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={() => navigate('/login')}
              className="px-6 py-2 text-blue-600 font-semibold hover:bg-blue-50 rounded-lg transition"
            >
              Login
            </button>
            <button
              onClick={() => navigate('/role-selection')}
              className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition"
            >
              Sign Up
            </button>
          </div>
        </div>
      </header>

      <section className="max-w-7xl mx-auto px-6 py-20 text-center">
        <h2 className="text-5xl font-bold text-gray-900 mb-6">
          Empowering Mobility<br />
          <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Together We Travel
          </span>
        </h2>
        <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
          Connecting visually impaired individuals with compassionate volunteers for safe, reliable outdoor travel assistance
        </p>
        
        <div className="flex gap-4 justify-center flex-wrap">
          <button
            onClick={() => navigate('/role-selection')}
            className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-lg font-semibold rounded-xl hover:shadow-xl transition transform hover:scale-105"
          >
            Get Started
          </button>
          <button
            onClick={() => setShowVoiceAssistant(true)}
            className="px-8 py-4 bg-white text-blue-600 text-lg font-semibold rounded-xl border-2 border-blue-600 hover:bg-blue-50 transition flex items-center gap-2"
          >
            <Mic size={20} />
            Voice Guide
          </button>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 py-16">
        <h3 className="text-3xl font-bold text-center text-gray-900 mb-12">
          Built for Accessibility & Trust
        </h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, idx) => (
            <div key={idx} className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition border border-gray-100">
              <div className="text-blue-600 mb-4">{feature.icon}</div>
              <h4 className="text-xl font-bold text-gray-900 mb-2">{feature.title}</h4>
              <p className="text-gray-600">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 py-16">
        <h3 className="text-3xl font-bold text-center text-gray-900 mb-12">
          We're Here When You Need Us
        </h3>
        <div className="grid md:grid-cols-3 gap-6">
          {useCases.map((useCase, idx) => (
            <div key={idx} className="bg-gradient-to-br from-blue-500 to-purple-600 p-8 rounded-2xl text-white hover:shadow-2xl transition transform hover:scale-105">
              <div className="mb-4">{useCase.icon}</div>
              <h4 className="text-2xl font-bold mb-2">{useCase.title}</h4>
              <p className="text-blue-100">{useCase.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 py-20 text-center">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-12 text-white">
          <h3 className="text-4xl font-bold mb-4">Ready to Start Your Journey?</h3>
          <p className="text-xl mb-8 text-blue-100">Join thousands finding independence through community support</p>
          <button
            onClick={() => navigate('/role-selection')}
            className="px-10 py-4 bg-white text-blue-600 text-lg font-bold rounded-xl hover:shadow-2xl transition transform hover:scale-105"
          >
            Join VisionConnect
          </button>
        </div>
      </section>

      {showVoiceAssistant && <VoiceAssistant onClose={() => setShowVoiceAssistant(false)} />}

      {!showVoiceAssistant && (
        <button
          onClick={() => setShowVoiceAssistant(true)}
          className="fixed bottom-6 right-6 w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full shadow-2xl hover:shadow-3xl transition transform hover:scale-110 flex items-center justify-center z-40"
        >
          <Mic size={28} />
        </button>
      )}
    </div>
  );
};

export default HomePage;
