import React from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import About from './components/About';
import Footer from './components/Footer';
import Programs from './components/Programs';
import Contact from './components/Contact';
const LandingPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-200 to-white font-sans">
      
      <Header />

      <Hero />

      <Programs />

      <About />
      <Contact />
      <Footer />
    </div>
  );
};

export default LandingPage;