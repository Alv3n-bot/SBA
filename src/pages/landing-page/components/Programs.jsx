import { ArrowRight, Code, Layout, Server, Briefcase, Smartphone, Clock, CheckCircle, Users, TrendingUp, Award, ChevronRight } from 'lucide-react';
import fullStackImg from '../../../assets/programs/full-stack.jpg';
import dataScienceImg from '../../../assets/programs/data-science.jpg';
import aiMlImg from '../../../assets/programs/ai-ml.jpg';
import cybersecurityImg from '../../../assets/programs/cybersecurity.jpg';
import uxUiDesignImg from '../../../assets/programs/ux-ui-design.jpg';

// SEO structured data for Google rich results
const structuredData = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  "name": "SBA Tech Bootcamp Programs",
  "description": "Online tech bootcamps in Full-Stack Development, Data Science, AI/ML, Cybersecurity, and UX/UI Design. Cohort-based, career-focused programs with 95% job placement rate.",
  "itemListElement": [
    {
      "@type": "ListItem", "position": 1,
      "item": {
        "@type": "Course",
        "name": "Full-Stack Development Software Engineering",
        "description": "Become a job-ready software engineer by learning full-stack web development. Master HTML, CSS, JavaScript, React, Node.js, databases, APIs, and Git while building real-world projects and a professional portfolio.",
        "provider": { "@type": "Organization", "name": "SBA Programs", "sameAs": "https://yoursite.com" },
        "courseMode": "online", "educationalLevel": "Beginner to Intermediate",
        "timeRequired": "PT24W", "url": "https://yoursite.com/course/full-stack",
        "offers": { "@type": "Offer", "availability": "https://schema.org/InStock", "validFrom": "2026-03-02" }
      }
    },
    {
      "@type": "ListItem", "position": 2,
      "item": {
        "@type": "Course",
        "name": "Data Science & Analytics",
        "description": "Learn data analysis, Python, SQL, statistics, and data visualization to launch a career in data analytics or junior data science.",
        "provider": { "@type": "Organization", "name": "SBA Programs", "sameAs": "https://yoursite.com" },
        "courseMode": "online", "educationalLevel": "Beginner",
        "timeRequired": "PT20W", "url": "https://yoursite.com/course/data-science",
        "offers": { "@type": "Offer", "availability": "https://schema.org/InStock", "validFrom": "2026-03-02" }
      }
    },
    {
      "@type": "ListItem", "position": 3,
      "item": {
        "@type": "Course",
        "name": "Artificial Intelligence & Machine Learning",
        "description": "Build a strong foundation in AI and machine learning. Learn Python, data preprocessing, ML models, and applied AI techniques.",
        "provider": { "@type": "Organization", "name": "SBA Programs", "sameAs": "https://yoursite.com" },
        "courseMode": "online", "educationalLevel": "Intermediate",
        "timeRequired": "PT24W", "url": "https://yoursite.com/course/ai-ml",
        "offers": { "@type": "Offer", "availability": "https://schema.org/InStock", "validFrom": "2026-03-02" }
      }
    },
    {
      "@type": "ListItem", "position": 4,
      "item": {
        "@type": "Course",
        "name": "Cybersecurity Bootcamp",
        "description": "Start a career in cybersecurity by learning network security, ethical hacking, threat analysis, and defensive security practices.",
        "provider": { "@type": "Organization", "name": "SBA Programs", "sameAs": "https://yoursite.com" },
        "courseMode": "online", "educationalLevel": "Beginner",
        "timeRequired": "PT18W", "url": "https://yoursite.com/course/cybersecurity",
        "offers": { "@type": "Offer", "availability": "https://schema.org/InStock", "validFrom": "2026-03-02" }
      }
    },
    {
      "@type": "ListItem", "position": 5,
      "item": {
        "@type": "Course",
        "name": "UX/UI & Product Design Bootcamp",
        "description": "Learn UX/UI design principles, wireframing, prototyping, and product thinking. Build a professional design portfolio.",
        "provider": { "@type": "Organization", "name": "SBA Programs", "sameAs": "https://yoursite.com" },
        "courseMode": "online", "educationalLevel": "All Levels",
        "timeRequired": "PT16W", "url": "https://yoursite.com/course/ux-ui-design",
        "offers": { "@type": "Offer", "availability": "https://schema.org/InStock", "validFrom": "2026-03-02" }
      }
    }
  ]
};

const courses = [
  {
    id: 'full-stack',
    title: 'Full-Stack Development',
    subtitle: 'Software Engineering',
    description: 'Become a job-ready software engineer by mastering HTML, CSS, JavaScript, React, Node.js, databases, APIs, and Git — all through real-world projects and a professional portfolio.',
    image: fullStackImg,
    icon: Briefcase,
    path: '/course/full-stack',
    duration: '24 Weeks',
    level: 'Beginner',
    students: '500+',
    spots: 12,
    isOpen: true,
    startDate: 'March 2, 2026',
    outcomes: ['Software Engineer', 'Frontend Dev', 'Backend Dev'],
    skills: ['React', 'Node.js', 'MongoDB'],
    avgSalary: '$92K',
  },
  {
    id: 'data-science',
    title: 'Data Science & Analytics',
    subtitle: 'Data Engineering',
    description: 'Learn Python, SQL, statistics, and data visualization to launch a career in data analytics. Work with real datasets and build data-driven projects used in real businesses.',
    image: dataScienceImg,
    icon: Layout,
    path: '/course/data-science',
    duration: '20 Weeks',
    level: 'Beginner',
    students: '400+',
    spots: 8,
    isOpen: true,
    startDate: 'March 2, 2026',
    outcomes: ['Data Analyst', 'BI Developer', 'Data Engineer'],
    skills: ['Python', 'SQL', 'Tableau'],
    avgSalary: '$88K',
  },
  {
    id: 'ai-ml',
    title: 'AI & Machine Learning',
    subtitle: 'Applied Artificial Intelligence',
    description: 'Build a foundation in AI and machine learning — covering Python, data preprocessing, ML models, and applied AI — while developing practical, portfolio-ready projects.',
    image: aiMlImg,
    icon: Server,
    path: '/course/ai-ml',
    duration: '24 Weeks',
    level: 'Intermediate',
    students: '300+',
    spots: 15,
    isOpen: true,
    startDate: 'March 2, 2026',
    outcomes: ['ML Engineer', 'AI Developer', 'Data Scientist'],
    skills: ['Python', 'TensorFlow', 'NLP'],
    avgSalary: '$105K',
  },
  {
    id: 'cybersecurity',
    title: 'Cybersecurity',
    subtitle: 'Information Security',
    description: 'Start a career in cybersecurity through hands-on labs in network security, ethical hacking, threat analysis, and defensive security — built around real-world attack scenarios.',
    image: cybersecurityImg,
    icon: Code,
    path: '/course/cybersecurity',
    duration: '18 Weeks',
    level: 'Beginner',
    students: '250+',
    spots: 15,
    isOpen: true,
    startDate: 'March 2, 2026',
    outcomes: ['Security Analyst', 'SOC Analyst', 'Pen Tester'],
    skills: ['Network Security', 'Ethical Hacking', 'SIEM'],
    avgSalary: '$87K',
  },
  {
    id: 'ux-ui-design',
    title: 'UX/UI Design',
    subtitle: 'Product Design',
    description: 'Learn UX research, wireframing, prototyping, and product thinking in Figma. Build visually strong, user-centered designs and a portfolio that gets you hired.',
    image: uxUiDesignImg,
    icon: Smartphone,
    path: '/course/ux-ui-design',
    duration: '16 Weeks',
    level: 'All Levels',
    students: '350+',
    spots: 20,
    isOpen: true,
    startDate: 'March 2, 2026',
    outcomes: ['UX Designer', 'Product Designer', 'UI Engineer'],
    skills: ['Figma', 'User Research', 'Prototyping'],
    avgSalary: '$83K',
  },
];

function Programs() {
  return (
    <>
      {/* Structured data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <section
        id="courses"
        aria-labelledby="programs-heading"
        className="bg-white py-16 sm:py-20 lg:py-24"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* ── SECTION HEADER ── */}
          <header className="max-w-3xl mx-auto text-center mb-14 sm:mb-16">
            {/* Eyebrow */}
           

            <div className="text-center max-w-4xl mx-auto mb-16 md:mb-20">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              PROGRAMS
            </h1>
            
          </div>

            

            {/* Inline trust bar */}
         
          </header>

          {/* ── COURSE GRID ── */}
          <div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mb-16"
            role="list"
            aria-label="Available tech programs"
          >
            {courses.map((course) => {
              const Icon = course.icon;
              const urgency = course.spots <= 10;

              return (
                <article
                  key={course.id}
                  role="listitem"
                  className="group bg-white rounded-xl overflow-hidden border-2 border-gray-200 hover:border-black hover:shadow-2xl transition-all duration-300 flex flex-col"
                >
                  {/* Image */}
                  <div className="relative h-48 sm:h-52 overflow-hidden">
                    <img
                      src={course.image}
                      alt={`${course.title} — ${course.subtitle} online bootcamp`}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      loading="lazy"
                      width="600"
                      height="400"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                    {/* Open badge */}
                    <div className="absolute top-4 left-4">
                      <span className="px-3 py-1.5 rounded-full font-bold text-xs uppercase tracking-wide bg-white text-black">
                        ● Enrolling
                      </span>
                    </div>

                    {/* Urgency badge */}
                    {urgency && (
                      <div className="absolute top-4 right-10">
                        <span className="px-2.5 py-1.5 rounded-full font-bold text-xs bg-black text-white flex items-center gap-1">
                          <TrendingUp className="w-3 h-3" />
                          {course.spots} left
                        </span>
                      </div>
                    )}

                    {/* Icon */}
                    <div className="absolute top-4 right-4 bg-white p-2.5 rounded-full shadow-lg transform group-hover:-translate-y-1 transition-transform duration-300">
                      <Icon className="w-5 h-5 text-black" />
                    </div>

                    {/* Avg salary — revealed on hover */}
                    <div className="absolute bottom-4 left-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <span className="px-3 py-1.5 bg-black text-white rounded-full text-xs font-bold">
                        Avg. salary {course.avgSalary}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-5 sm:p-6 flex flex-col flex-grow">
                    {/* Title */}
                    <div className="mb-3">
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">
                        {course.subtitle}
                      </p>
                      <h3 className="text-xl sm:text-2xl font-bold text-black leading-snug">
                        {course.title}
                      </h3>
                    </div>

                    <p className="text-sm text-gray-600 mb-4 leading-relaxed flex-grow">
                      {course.description}
                    </p>

                    {/* Skills */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {course.skills.map(skill => (
                        <span
                          key={skill}
                          className="px-2.5 py-1 bg-gray-100 text-gray-700 text-xs font-semibold rounded-md"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>

                    {/* Meta row */}
                    <div className="flex items-center justify-between text-sm mb-4 pb-4 border-b border-gray-100">
                      <div className="flex items-center gap-1.5 text-gray-600">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <span className="font-medium">{course.duration}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-gray-600">
                        <Users className="w-4 h-4 text-gray-400" />
                        <span className="font-medium">{course.students} enrolled</span>
                      </div>
                    </div>

                    {/* Outcomes */}
                    <div className="mb-5">
                      <p className="text-xs text-gray-400 uppercase tracking-widest font-semibold mb-2">
                        Career Outcomes
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {course.outcomes.map(role => (
                          <span
                            key={role}
                            className="flex items-center gap-1 text-xs text-gray-700 font-medium"
                          >
                            <CheckCircle className="w-3 h-3 text-black flex-shrink-0" />
                            {role}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Start date + CTA */}
                    <div className="mt-auto space-y-2">
                      <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                        <span>Next cohort:</span>
                        <span className="font-bold text-black">{course.startDate}</span>
                      </div>

                      <a
                        href={course.path}
                        className="w-full px-4 py-3 rounded-lg font-bold bg-black text-white hover:bg-gray-900 transition-all duration-200 flex items-center justify-center gap-2 text-sm no-underline"
                        aria-label={`Apply to ${course.title} starting ${course.startDate}`}
                      >
                        <span>Apply Now</span>
                        <ChevronRight className="w-4 h-4" />
                      </a>

                      <a
                        href={course.path}
                        className="w-full px-4 py-2.5 rounded-lg font-semibold border-2 border-gray-200 text-gray-700 hover:border-black hover:text-black transition-all duration-200 flex items-center justify-center gap-2 text-sm no-underline"
                        aria-label={`View ${course.title} curriculum details`}
                      >
                        <span>View Curriculum</span>
                        <ArrowRight className="w-4 h-4" />
                      </a>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>

          {/* ── BOTTOM CTA BAND ── */}
          <div className="bg-black rounded-2xl px-8 py-10 sm:px-12 sm:py-12 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-widest font-semibold mb-2">
                Spring 2026 · Limited Seats
              </p>
              <h3 className="text-2xl sm:text-3xl font-bold text-white mb-1">
                Not sure which program fits?
              </h3>
              <p className="text-gray-400 text-sm sm:text-base max-w-lg">
                Book a free 20-minute career call and we'll help you pick the right path based on your background and goals.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 flex-shrink-0">
              <a
                href="/contact"
                className="px-6 py-3.5 bg-white text-black font-bold rounded-lg text-sm hover:bg-gray-100 transition-all flex items-center gap-2 no-underline whitespace-nowrap"
              >
                Book a Free Call
                <ArrowRight className="w-4 h-4" />
              </a>
              <a
                href="#courses"
                className="px-6 py-3.5 border-2 border-gray-700 text-gray-300 font-semibold rounded-lg text-sm hover:border-white hover:text-white transition-all flex items-center gap-2 no-underline whitespace-nowrap"
              >
                Browse Programs
              </a>
            </div>
          </div>

        </div>
      </section>
    </>
  );
}

export default Programs;