import { Heart, Lightbulb, Zap, CheckCircle } from 'lucide-react';

function About() {
  const values = [
    {
      icon: Heart,
      title: "Student-First Learning",
      description:
        "Our online tech bootcamp is built around student success, not rigid schedules or outdated teaching models."
    },
    {
      icon: Lightbulb,
      title: "Industry-Relevant Tech Skills",
      description:
        "We focus on modern software development skills that employers actually hire for—no filler, no outdated theory."
    },
    {
      icon: Zap,
      title: "Hands-On, Project-Based Training",
      description:
        "You don’t just watch lessons. You build real projects from day one and graduate with a job-ready portfolio."
    }
  ];

  const stats = [
  { number: "95%", label: "Course Completion Rate" },
  { number: "4.8/5", label: "Student Satisfaction Score" },
  { number: "5", label: "Industry-Aligned Programs" },
  { number: "24/7", label: "Online Resources Access" }
];


  const reasons = [
    {
      title: "Skills Employers Are Hiring For",
      description:
        "Our curriculum is continuously updated to match real-world job requirements in software development and tech."
    },
    {
      title: "Affordable Online Tech Bootcamp",
      description:
        "Get practical tech training without the high cost of traditional bootcamps or university programs."
    },
  {
  title: "A Community That Actually Supports You",
  description:
    "We build a safe, inclusive space where students collaborate, share feedback, and move forward together."
}
,
    {
      title: "Real Portfolio Projects",
      description:
        "Every course includes hands-on projects you can showcase to employers when applying for tech jobs."
    }
  ];

  return (
    <section
      id="about"
      className="py-16 md:py-24 bg-gradient-to-br from-gray-50 to-gray-100"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero */}
        <div className="text-center max-w-4xl mx-auto mb-16 md:mb-20">
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            ABOUT US
          </h2>
          
          <p className="text-base sm:text-lg text-gray-600 leading-relaxed">
            Learn real tech skills, build real projects, and prepare for real tech careers—without going into debt.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-16 md:mb-20">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl p-6 md:p-8 text-center shadow-lg border-2 border-gray-100"
            >
              <div className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-2">
                {stat.number}
              </div>
              <div className="text-sm md:text-base text-gray-600 font-medium">
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Story */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center mb-16 md:mb-20">
          <div>
            <h3 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              Why We Built SBA Tech Institute
            </h3>
            <div className="space-y-4 text-base md:text-lg text-gray-700 leading-relaxed">
              <p>
                Too many people are locked out of tech careers by expensive bootcamps, outdated degrees,
                and low-quality online courses that don’t lead to jobs.
              </p>
              <p>
                We believed there was a better way—an affordable online tech bootcamp that teaches
                practical software development skills and allows students to learn at their own pace.
              </p>
              <p>
                SBA Tech Institute was created to bridge the gap between learning and employment,
                helping students transition into real-world tech roles with confidence.
              </p>
            </div>
          </div>

          <div className="relative rounded-2xl overflow-hidden shadow-2xl">
            <img
              src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80"
              alt="Students learning software development together"
              className="w-full h-64 sm:h-80 md:h-96 lg:h-[450px] object-cover"
            />
          </div>
        </div>

        {/* Values */}
        <div className="bg-white rounded-3xl p-8 md:p-12 shadow-xl mb-16 md:mb-20">
          <div className="text-center mb-12">
            <h3 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Our Approach to Tech Education
            </h3>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Everything we do is designed to help students gain real, employable tech skills.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {values.map((value, index) => {
              const Icon = value.icon;
              return (
                <div
                  key={index}
                  className="p-6 md:p-8 rounded-2xl bg-gray-50 border-2 border-gray-200"
                >
                  <div className="w-14 h-14 bg-black rounded-xl flex items-center justify-center text-white mb-6">
                    <Icon className="w-7 h-7" />
                  </div>
                  <h4 className="text-xl md:text-2xl font-bold text-gray-900 mb-3">
                    {value.title}
                  </h4>
                  <p className="text-base md:text-lg text-gray-700">
                    {value.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Why Choose */}
        <div className="mb-16 md:mb-20">
          <div className="text-center mb-12">
            <h3 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Students Choose Our Tech Bootcamp
            </h3>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              We focus on outcomes, not hype.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            {reasons.map((reason, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl p-6 md:p-8 shadow-lg border-2 border-gray-100"
              >
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-gray-700" />
                  </div>
                  <div>
                    <h4 className="text-lg md:text-xl font-bold text-gray-900 mb-2">
                      {reason.title}
                    </h4>
                    <p className="text-base text-gray-700">
                      {reason.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* How It Works */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-3xl p-8 md:p-12">
          <div className="text-center mb-12">
            <h3 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              How Our Online Tech Bootcamp Works
            </h3>
            <p className="text-lg text-gray-700 max-w-2xl mx-auto">
              Simple, flexible, and focused on results.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 text-center">
            <div>
              <div className="w-16 h-16 bg-black text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6">
                1
              </div>
              <h4 className="text-xl font-bold text-gray-900 mb-3">
                Choose a Tech Path
              </h4>
              <p className="text-base text-gray-700">
                Select a course aligned with your career goals, from foundations to advanced skills.
              </p>
            </div>

            <div>
              <div className="w-16 h-16 bg-black text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6">
                2
              </div>
              <h4 className="text-xl font-bold text-gray-900 mb-3">
                Learn and Build Projects
              </h4>
              <p className="text-base text-gray-700">
                Follow structured lessons and build real-world software projects.
              </p>
            </div>

            <div>
              <div className="w-16 h-16 bg-black text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6">
                3
              </div>
              <h4 className="text-xl font-bold text-gray-900 mb-3">
                Apply for Tech Jobs
              </h4>
              <p className="text-base text-gray-700">
                Use your portfolio and skills to apply confidently for entry-level tech roles.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default About;
