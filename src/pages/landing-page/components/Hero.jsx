import { useState } from 'react';
import { ArrowRight, Users, Award, Briefcase, Code } from 'lucide-react';

function Hero() {
  const handleJoin = () => {
    window.open('/ehub', '_blank');
  };

  const handleViewCourses = () => {
    const element = document.getElementById('courses');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="relative min-h-[70vh] lg:min-h-[85vh] flex items-center justify-center overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-100">
      <div
        className="absolute inset-0 bg-cover bg-center opacity-20"
        style={{ backgroundImage: `url('https://via.placeholder.com/1920x1080?text=Tech+Education+Background')` }}
      ></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-12 py-25 lg:py-25">
          
          {/* Left Content */}
          <div className="lg:w-1/2 text-center lg:text-left order-2 lg:order-1 mt-8 lg:mt-0">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-md mb-4">
              <Award className="w-4 h-4 text-indigo-600" />
              <span className="text-sm font-bold text-gray-900">Industry-Certified Programs</span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 leading-tight tracking-tight">
              Shape Your Future with Africa's Top<span className="text-indigo-600">  Tech Bootcamp</span>
            </h1>
            
           <p className="text-base sm:text-lg md:text-xl text-gray-700 mt-4 md:mt-6 max-w-xl mx-auto lg:mx-0 font-medium">
  Learn Software Engineering, AI, Data & Cybersecurity through hands-on projects,
  live mentorship, and industry-aligned training designed to help you land real tech jobs.
</p>


            {/* Stats */}
            <div className="flex items-center justify-center lg:justify-start gap-6 mt-6">
              <div className="text-center lg:text-left">
                <div className="text-2xl sm:text-3xl font-bold text-gray-900">95%</div>
                <div className="text-xs sm:text-sm text-gray-600">Course Completion</div>
              </div>
              <div className="w-px h-10 bg-gray-300"></div>
              <div className="text-center lg:text-left">
                <div className="text-2xl sm:text-3xl font-bold text-gray-900">90%</div>
                <div className="text-xs sm:text-sm text-gray-600">Success Rate</div>
              </div>
              <div className="w-px h-10 bg-gray-300"></div>
              <div className="text-center lg:text-left">
                <div className="text-2xl sm:text-3xl font-bold text-gray-900">50+</div>
                <div className="text-xs sm:text-sm text-gray-600">Job Placed</div>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 mt-8">
              <button 
                onClick={handleJoin}
                className="group w-full sm:w-auto px-8 py-4 bg-black text-white font-bold rounded-full shadow-lg hover:bg-gray-900 transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2"
              >
                Join SBA Now
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              
              <button 
                onClick={handleViewCourses}
                className="w-full sm:w-auto px-8 py-4 bg-white text-gray-900 font-bold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 border-2 border-gray-200"
              >
                View Courses
              </button>
            </div>

            {/* Trust Indicators */}
            <div className="mt-8 flex items-center justify-center lg:justify-start gap-4 flex-wrap">
              <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg shadow-sm">
                <Code className="w-4 h-4 text-indigo-600" />
                <span className="text-xs font-semibold text-gray-700">Hands-on Projects</span>
              </div>
              <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg shadow-sm">
                <Briefcase className="w-4 h-4 text-indigo-600" />
                <span className="text-xs font-semibold text-gray-700">Job Placement Support</span>
              </div>
              <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg shadow-sm">
                <Users className="w-4 h-4 text-indigo-600" />
                <span className="text-xs font-semibold text-gray-700">Community Access</span>
              </div>
            </div>
          </div>

          {/* Right Image */}
          <div className="lg:w-1/2 w-full max-w-md lg:max-w-none order-1 lg:order-2 relative">
            {/* Floating Card 1 */}
            <div className="absolute -top-4 -left-4 bg-white px-4 py-3 rounded-xl shadow-xl z-10 hidden sm:block">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center">
                  <Award className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="text-sm font-bold text-gray-900">Certified</div>
                  <div className="text-xs text-gray-600">Industry Ready</div>
                </div>
              </div>
            </div>

            {/* Floating Card 2 */}
            <div className="absolute -bottom-4 -right-4 bg-white px-4 py-3 rounded-xl shadow-xl z-10 hidden sm:block">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-lg font-bold">✓</span>
                </div>
                <div>
                  <div className="text-sm font-bold text-gray-900">Live Classes</div>
                  <div className="text-xs text-gray-600">Expert Instructors</div>
                </div>
              </div>
            </div>

            <img
              src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80"
              alt="Person learning on laptop"
              className="w-full h-auto rounded-2xl shadow-2xl transform hover:scale-105 transition-transform duration-500 ease-in-out object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

export default Hero;