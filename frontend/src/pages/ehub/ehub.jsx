import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../../firebase';
import { doc, getDoc } from 'firebase/firestore';
import About from '../landing-page/components/About';
import Footer from '../landing-page/components/Footer';
import Settings from './Settings';
import Notifications from './Notifications';
import Programs from './Programs';
import EHubHeader from './EHubHeader';
import Contact from '../landing-page/components/Contact';
export default function EHub() {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
      if (!currentUser) {
        navigate('/login');
        return;
      }
      setUser(currentUser);
      const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
      if (userDoc.exists()) {
        setUserData(userDoc.data());
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [navigate]);

  // Subscription helper functions
  const isSubscriptionActive = () => {
    if (!userData?.subscription?.endDate) return false;
    const endDate = userData.subscription.endDate.toDate ?
      userData.subscription.endDate.toDate() :
      new Date(userData.subscription.endDate);
    return endDate > new Date();
  };

  const getDaysRemaining = () => {
    if (!userData?.subscription?.endDate) return 0;
    const endDate = userData.subscription.endDate.toDate ?
      userData.subscription.endDate.toDate() :
      new Date(userData.subscription.endDate);
    const today = new Date();
    const diffTime = endDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  const scrollToCourses = () => {
    const coursesSection = document.getElementById('courses-section');
    if (coursesSection) {
      coursesSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{background: 'linear-gradient(to bottom, #a5b4fc, #e0e7ff)'}}>
        <p className="text-lg text-gray-600">Loading...</p>
      </div>
    );
  }

  const enrolledCount = userData?.enrolledCourses?.length || 0;

  return (
    <div className="min-h-screen" style={{background: 'linear-gradient(to bottom, #a5b4fc, #e0e7ff)'}}>
      {/* Header */}
      <EHubHeader 
        userData={userData} 
        onOpenSettings={() => setShowSettings(true)}
        onOpenNotifications={() => setShowNotifications(true)}
      />

      {/* Hero Section */}
      <section className="py-8 md:py-16 min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="bg-white rounded-3xl p-6 md:p-16 flex flex-col md:flex-row items-center gap-8 md:gap-12">
            <div className="md:w-1/2 text-gray-900">
              <h1 className="text-4xl md:text-6xl font-bold mb-4">
                Welcome to EHub
              </h1>
              <p className="text-lg md:text-2xl mb-3">
                Your central workspace for learning, building, and progressing.
              </p>
              <p className="text-base text-gray-600 mb-8 max-w-xl">
                Access your enrolled courses, track your progress, continue lessons,
                and stay focused on the skills that move your tech career forward.
              </p>
              {/* Stats Display */}
              <div className="grid grid-cols-3 gap-4 mb-8">
                <div className="bg-gray-50 rounded-lg p-4 text-center">
                  <p className="text-2xl font-bold text-gray-900">{enrolledCount}</p>
                  <p className="text-xs text-gray-600">Courses</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 text-center">
                  <p className="text-2xl font-bold text-gray-900">{getDaysRemaining()}</p>
                  <p className="text-xs text-gray-600">Days Left</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 text-center">
                  <p className={`text-sm font-bold ${isSubscriptionActive() ? 'text-green-600' : 'text-orange-600'}`}>
                    {isSubscriptionActive() ? 'Active' : 'Inactive'}
                  </p>
                  <p className="text-xs text-gray-600">Status</p>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={scrollToCourses}
                  className="bg-black text-white px-8 py-4 rounded-full font-bold hover:bg-gray-800 transition-all"
                >
                  Continue Learning
                </button>
                <button
                  onClick={() => setShowSettings(true)}
                  className="border-2 border-black px-8 py-4 rounded-full font-bold hover:bg-black hover:text-white transition-all"
                >
                  Manage Subscription
                </button>
              </div>
            </div>
            <div className="md:w-1/2">
              <img
                src="https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=800&q=80"
                alt="Person learning on laptop"
                className="rounded-lg w-full"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Courses Section */}
      <section id="courses-section" className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Programs />
        </div>
      </section>

      <About />
      <Contact />
      {/* Footer */}
      <Footer />

      {/* Modals */}
      <Settings isOpen={showSettings} onClose={() => setShowSettings(false)} />
      <Notifications isOpen={showNotifications} onClose={() => setShowNotifications(false)} />
    </div>
  );
}