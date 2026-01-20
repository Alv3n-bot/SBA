import { Target, Users, BookOpen, TrendingUp, Award, Heart, Lightbulb, Zap, CheckCircle } from 'lucide-react';

function About() {
  const values = [
    {
      icon: Heart,
      title: "Student-First",
      description: "Every decision we make starts with one question: How does this help our students succeed?"
    },
    {
      icon: Lightbulb,
      title: "Real Skills",
      description: "We teach what actually matters. No fluff, no outdated content—just skills that get you hired."
    },
    {
      icon: Zap,
      title: "Learn by Doing",
      description: "Theory is important, but practice is everything. Build real projects from day one."
    }
  ];

  const stats = [
    { number: "500+", label: "Students Enrolled" },
    { number: "95%", label: "Completion Rate" },
    { number: "5", label: "Industry Courses" },
    { number: "24/7", label: "Learning Access" }
  ];

  const reasons = [
    {
      title: "Learn What Companies Actually Need",
      description: "Our curriculum focuses on the skills employers are actively hiring for right now—not what was popular 5 years ago."
    },
    {
      title: "Affordable, Transparent Pricing",
      description: "Quality education shouldn't cost a fortune. Get access to all courses for less than the price of a coffee a day."
    },
    {
      title: "Learn at Your Own Pace",
      description: "Life is busy. That's why our courses are available 24/7, so you can learn when it works for you."
    },
    {
      title: "Build Real Portfolio Projects",
      description: "Employers want to see what you can do. Every course includes projects you can showcase to land your next opportunity."
    }
  ];

  return (
    <section id="about" className="py-16 md:py-24 bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Hero Statement */}
        <div className="text-center max-w-4xl mx-auto mb-16 md:mb-20">
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            We're Building Something Different
          </h2>
          <p className="text-lg sm:text-xl md:text-2xl text-gray-700 leading-relaxed mb-4">
            Tech education that's <span className="font-bold text-gray-900">accessible</span>, <span className="font-bold text-gray-900">practical</span>, and actually <span className="font-bold text-gray-900">works</span>.
          </p>
          <p className="text-base sm:text-lg text-gray-600 leading-relaxed">
            No corporate jargon. No empty promises. Just real skills that help you build the career you want.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-16 md:mb-20">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white rounded-2xl p-6 md:p-8 text-center shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-gray-100 hover:border-black">
              <div className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-2">
                {stat.number}
              </div>
              <div className="text-sm md:text-base text-gray-600 font-medium">
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Our Story */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center mb-16 md:mb-20">
          <div>
            <h3 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              Why We Started SBA
            </h3>
            <div className="space-y-4 text-base md:text-lg text-gray-700 leading-relaxed">
              <p>
                We saw too many talented people held back by expensive bootcamps, outdated university programs, and "gurus" selling get-rich-quick courses.
              </p>
              <p>
                <span className="font-semibold text-gray-900">There had to be a better way.</span> A way to learn real tech skills without going into debt. A way to learn at your own pace, on your own schedule. A way that actually prepares you for real jobs.
              </p>
              <p>
                So we built it. SBA Tech Institute is what we wished existed when we were starting our own tech careers.
              </p>
            </div>
          </div>
          
          <div className="relative">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl">
              <img
                src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80"
                alt="Students learning together"
                className="w-full h-64 sm:h-80 md:h-96 lg:h-[450px] object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
              
              {/* Quote Overlay */}
              <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
                <div className="bg-white/95 backdrop-blur-sm rounded-xl p-6">
                  <p className="text-lg md:text-xl font-semibold text-gray-900 mb-2">
                    "Education should open doors, not drain bank accounts."
                  </p>
                  <p className="text-sm text-gray-600">
                    — SBA Founders
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Core Values */}
        <div className="bg-white rounded-3xl p-8 md:p-12 shadow-xl mb-16 md:mb-20">
          <div className="text-center mb-12">
            <h3 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              What We Stand For
            </h3>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              These aren't just words on a wall. They guide every course we create and every decision we make.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {values.map((value, index) => {
              const Icon = value.icon;
              return (
                <div 
                  key={index} 
                  className="p-6 md:p-8 rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-200 transition-all duration-300 border-2 border-gray-200 hover:border-black"
                >
                  <div className="w-14 h-14 bg-black rounded-xl flex items-center justify-center text-white mb-6">
                    <Icon className="w-7 h-7" />
                  </div>
                  <h4 className="text-xl md:text-2xl font-bold text-gray-900 mb-3">
                    {value.title}
                  </h4>
                  <p className="text-base md:text-lg text-gray-700 leading-relaxed">
                    {value.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Why Choose Us */}
        <div className="mb-16 md:mb-20">
          <div className="text-center mb-12">
            <h3 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Students Choose SBA
            </h3>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              We're honest about what we offer—and what makes us different.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            {reasons.map((reason, index) => (
              <div 
                key={index}
                className="bg-white rounded-2xl p-6 md:p-8 shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-gray-100 hover:border-black group"
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-gray-100 group-hover:bg-black rounded-full flex items-center justify-center transition-colors duration-300">
                      <CheckCircle className="w-6 h-6 text-gray-600 group-hover:text-white transition-colors duration-300" />
                    </div>
                  </div>
                  <div>
                    <h4 className="text-lg md:text-xl font-bold text-gray-900 mb-2">
                      {reason.title}
                    </h4>
                    <p className="text-base text-gray-700 leading-relaxed">
                      {reason.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* How It Works */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-3xl p-8 md:p-12 mb-16 md:mb-20">
          <div className="text-center mb-12">
            <h3 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h3>
            <p className="text-lg text-gray-700 max-w-2xl mx-auto">
              Getting started is simple. Here's what to expect.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
            <div className="text-center">
              <div className="w-16 h-16 bg-black text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6">
                1
              </div>
              <h4 className="text-xl font-bold text-gray-900 mb-3">
                Choose Your Path
              </h4>
              <p className="text-base text-gray-700">
                Pick a course that matches your goals. Not sure? Start with our Professional Foundations course.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-black text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6">
                2
              </div>
              <h4 className="text-xl font-bold text-gray-900 mb-3">
                Learn & Build
              </h4>
              <p className="text-base text-gray-700">
                Work through lessons and build real projects. Go at your own pace—we're here when you need us.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-black text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6">
                3
              </div>
              <h4 className="text-xl font-bold text-gray-900 mb-3">
                Launch Your Career
              </h4>
              <p className="text-base text-gray-700">
                Use your portfolio projects to land interviews. We'll help you prepare to nail them.
              </p>
            </div>
          </div>
        </div>

        

      </div>
    </section>
  );
}

export default About;