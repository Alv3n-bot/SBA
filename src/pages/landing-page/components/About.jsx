/**
 * About.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Fully responsive About page for SBA Tech School.
 *
 * Dependencies:
 *   npm install react-helmet-async lucide-react
 *
 * Usage:
 *   import About from './About';
 *   // Drop <About /> anywhere — router, page, or standalone.
 *
 * Self-contained:
 *   • Scoped CSS injected via useEffect — NO Tailwind required.
 *   • react-helmet-async is optional; page renders fine without it.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { useEffect } from 'react';
import { Heart, Lightbulb, Zap, CheckCircle } from 'lucide-react';

// ── Optional Helmet ───────────────────────────────────────────────────────────
let Helmet = null;
try {
  Helmet = require('react-helmet-async').Helmet;
} catch (_) {}

// ── Structured data (Schema.org) ──────────────────────────────────────────────
const structuredData = {
  '@context': 'https://schema.org',
  '@type': 'EducationalOrganization',
  name: 'SBA Tech School',
  url: 'https://sbatechschool.com',
  description:
    'SBA Tech School is an affordable online tech bootcamp offering industry-relevant software development training with hands-on, project-based learning.',
  sameAs: ['https://sbatechschool.com'],
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: '4.8',
    bestRating: '5',
    worstRating: '1',
    reviewCount: '200',
  },
};

// ── Data ──────────────────────────────────────────────────────────────────────
const stats = [
  { number: '95%',   label: 'Course Completion Rate' },
  { number: '4.8/5', label: 'Student Satisfaction Score' },
  { number: '5',     label: 'Industry-Aligned Programs' },
  { number: '24/7',  label: 'Online Resources Access' },
];

const values = [
  {
    icon: Heart,
    title: 'Student-First Learning',
    description:
      'Our online tech bootcamp is built around student success, not rigid schedules or outdated teaching models.',
  },
  {
    icon: Lightbulb,
    title: 'Industry-Relevant Tech Skills',
    description:
      'We focus on modern software development skills that employers actually hire for—no filler, no outdated theory.',
  },
  {
    icon: Zap,
    title: 'Hands-On, Project-Based Training',
    description:
      'You dont just watch lessons. You build real projects from day one and graduate with a job-ready portfolio.',
  },
];

const reasons = [
  {
    title: 'Skills Employers Are Hiring For',
    description:
      'Our curriculum is continuously updated to match real-world job requirements in software development and tech.',
  },
  {
    title: 'Affordable Online Tech Bootcamp',
    description:
      'Get practical tech training without the high cost of traditional bootcamps or university programs.',
  },
  {
    title: 'A Community That Actually Supports You',
    description:
      'We build a safe, inclusive space where students collaborate, share feedback, and move forward together.',
  },
  {
    title: 'Real Portfolio Projects',
    description:
      'Every course includes hands-on projects you can showcase to employers when applying for tech jobs.',
  },
];

const steps = [
  {
    n: '1',
    title: 'Choose a Tech Path',
    body: 'Select a course aligned with your career goals, from foundations to advanced skills.',
  },
  {
    n: '2',
    title: 'Learn and Build Projects',
    body: 'Follow structured lessons and build real-world software projects.',
  },
  {
    n: '3',
    title: 'Apply for Tech Jobs',
    body: 'Use your portfolio and skills to apply confidently for entry-level tech roles.',
  },
];

// ── Scoped CSS ────────────────────────────────────────────────────────────────
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500;600;700&display=swap');

.sba-about * { box-sizing: border-box; margin: 0; padding: 0; }

.sba-about {
  --ink:    #111111;
  --muted:  #6b7280;
  --border: #e5e7eb;
  --bg:     #f9fafb;
  --white:  #ffffff;
  --accent: #111111;

  font-family: 'DM Sans', sans-serif;
  color: var(--ink);
  background: var(--bg);
  -webkit-font-smoothing: antialiased;
}

/* ── Shared helpers ── */
.sba-about .sba-eyebrow {
  font-size: 0.65rem;
  font-weight: 700;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--muted);
  margin-bottom: 0.75rem;
}

.sba-about .sba-section {
  max-width: 72rem;
  margin: 0 auto;
  padding: clamp(3rem, 8vw, 5rem) 1.25rem;
}

/* ── Hero ── */
.sba-about .sba-hero {
  text-align: center;
  padding: clamp(3.5rem, 10vw, 6rem) 1.25rem clamp(2rem, 6vw, 4rem);
  max-width: 52rem;
  margin: 0 auto;
}

.sba-about .sba-hero h1 {
  font-family: 'DM Serif Display', serif;
  font-size: clamp(3rem, 9vw, 6rem);
  line-height: 1;
  letter-spacing: -0.02em;
  color: var(--ink);
  margin-bottom: 1.25rem;
}

.sba-about .sba-hero p {
  font-size: clamp(1rem, 2.5vw, 1.2rem);
  color: var(--muted);
  line-height: 1.7;
  max-width: 38rem;
  margin: 0 auto;
}

/* ── Stats ── */
.sba-about .sba-stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  max-width: 72rem;
  margin: 0 auto;
  padding: 0 1.25rem clamp(3rem, 8vw, 5rem);
}
@media (min-width: 768px) {
  .sba-about .sba-stats-grid { grid-template-columns: repeat(4, 1fr); gap: 1.25rem; }
}

.sba-about .sba-stat-card {
  background: var(--white);
  border-radius: 1.25rem;
  padding: clamp(1.25rem, 4vw, 2rem) 1rem;
  text-align: center;
  border: 1.5px solid var(--border);
  box-shadow: 0 2px 12px rgba(0,0,0,0.05);
  transition: transform 0.2s, box-shadow 0.2s;
}
.sba-about .sba-stat-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 20px rgba(0,0,0,0.09);
}

.sba-about .sba-stat-number {
  font-family: 'DM Serif Display', serif;
  font-size: clamp(2rem, 6vw, 3.25rem);
  color: var(--ink);
  line-height: 1;
  margin-bottom: 0.4rem;
}
.sba-about .sba-stat-label {
  font-size: clamp(0.75rem, 1.8vw, 0.875rem);
  color: var(--muted);
  font-weight: 500;
  line-height: 1.4;
}

/* ── Story ── */
.sba-about .sba-story {
  max-width: 72rem;
  margin: 0 auto;
  padding: 0 1.25rem clamp(3rem, 8vw, 5rem);
  display: grid;
  grid-template-columns: 1fr;
  gap: 2.5rem;
  align-items: center;
}
@media (min-width: 1024px) {
  .sba-about .sba-story { grid-template-columns: 1fr 1fr; gap: 4rem; }
}

.sba-about .sba-story-text h2 {
  font-family: 'DM Serif Display', serif;
  font-size: clamp(1.75rem, 5vw, 3rem);
  line-height: 1.1;
  color: var(--ink);
  margin-bottom: 1.5rem;
}

.sba-about .sba-story-text p {
  font-size: clamp(0.9rem, 2vw, 1.05rem);
  color: #374151;
  line-height: 1.75;
  margin-bottom: 1rem;
}
.sba-about .sba-story-text p:last-child { margin-bottom: 0; }

.sba-about .sba-story-img {
  border-radius: 1.25rem;
  overflow: hidden;
  box-shadow: 0 8px 40px rgba(0,0,0,0.14);
}
.sba-about .sba-story-img img {
  width: 100%;
  height: clamp(220px, 40vw, 450px);
  object-fit: cover;
  display: block;
}

/* ── Values ── */
.sba-about .sba-values-wrap {
  max-width: 72rem;
  margin: 0 auto;
  padding: 0 1.25rem clamp(3rem, 8vw, 5rem);
}

.sba-about .sba-values-panel {
  background: var(--white);
  border-radius: 1.5rem;
  padding: clamp(1.75rem, 5vw, 3rem);
  border: 1.5px solid var(--border);
  box-shadow: 0 2px 20px rgba(0,0,0,0.06);
}

.sba-about .sba-panel-header {
  text-align: center;
  margin-bottom: clamp(1.75rem, 4vw, 3rem);
}
.sba-about .sba-panel-header h2 {
  font-family: 'DM Serif Display', serif;
  font-size: clamp(1.75rem, 4.5vw, 2.75rem);
  color: var(--ink);
  margin-bottom: 0.75rem;
}
.sba-about .sba-panel-header p {
  font-size: clamp(0.9rem, 2vw, 1.05rem);
  color: var(--muted);
  max-width: 32rem;
  margin: 0 auto;
  line-height: 1.7;
}

.sba-about .sba-values-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.25rem;
}
@media (min-width: 640px) { .sba-about .sba-values-grid { grid-template-columns: 1fr 1fr; } }
@media (min-width: 900px) { .sba-about .sba-values-grid { grid-template-columns: repeat(3, 1fr); } }

.sba-about .sba-value-card {
  padding: clamp(1.25rem, 3vw, 1.75rem);
  border-radius: 1rem;
  background: var(--bg);
  border: 1.5px solid var(--border);
  transition: border-color 0.18s, box-shadow 0.18s, transform 0.18s;
}
.sba-about .sba-value-card:hover {
  border-color: var(--ink);
  box-shadow: 0 4px 16px rgba(0,0,0,0.08);
  transform: translateY(-2px);
}

.sba-about .sba-value-icon {
  width: 3rem;
  height: 3rem;
  background: var(--ink);
  border-radius: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1.1rem;
}
.sba-about .sba-value-icon svg { width: 1.4rem; height: 1.4rem; color: white; }

.sba-about .sba-value-card h3 {
  font-size: clamp(1rem, 2.5vw, 1.2rem);
  font-weight: 700;
  color: var(--ink);
  margin-bottom: 0.5rem;
  line-height: 1.3;
}
.sba-about .sba-value-card p {
  font-size: 0.875rem;
  color: #4b5563;
  line-height: 1.7;
}

/* ── Why Choose ── */
.sba-about .sba-reasons-wrap {
  max-width: 72rem;
  margin: 0 auto;
  padding: 0 1.25rem clamp(3rem, 8vw, 5rem);
}

.sba-about .sba-reasons-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.1rem;
}
@media (min-width: 640px) { .sba-about .sba-reasons-grid { grid-template-columns: 1fr 1fr; } }

.sba-about .sba-reason-card {
  background: var(--white);
  border-radius: 1rem;
  padding: clamp(1.1rem, 3vw, 1.5rem);
  border: 1.5px solid var(--border);
  box-shadow: 0 2px 10px rgba(0,0,0,0.04);
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  transition: border-color 0.18s, box-shadow 0.18s;
}
.sba-about .sba-reason-card:hover {
  border-color: #9ca3af;
  box-shadow: 0 4px 16px rgba(0,0,0,0.07);
}

.sba-about .sba-reason-icon {
  width: 2.25rem;
  height: 2.25rem;
  background: #f3f4f6;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.sba-about .sba-reason-icon svg { width: 1.2rem; height: 1.2rem; color: var(--ink); }

.sba-about .sba-reason-card h3 {
  font-size: clamp(0.9rem, 2vw, 1.05rem);
  font-weight: 700;
  color: var(--ink);
  margin-bottom: 0.35rem;
}
.sba-about .sba-reason-card p {
  font-size: 0.84rem;
  color: #4b5563;
  line-height: 1.65;
}

/* ── How It Works ── */
.sba-about .sba-how-wrap {
  max-width: 72rem;
  margin: 0 auto;
  padding: 0 1.25rem clamp(3rem, 8vw, 5rem);
}

.sba-about .sba-how-panel {
  background: var(--ink);
  border-radius: 1.5rem;
  padding: clamp(1.75rem, 5vw, 3rem);
}

.sba-about .sba-how-panel .sba-panel-header h2 { color: white; }
.sba-about .sba-how-panel .sba-panel-header p  { color: #9ca3af; }
.sba-about .sba-how-panel .sba-eyebrow         { color: #6b7280; }

.sba-about .sba-steps-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: clamp(2rem, 5vw, 3rem);
  text-align: center;
}
@media (min-width: 640px) { .sba-about .sba-steps-grid { grid-template-columns: repeat(3, 1fr); } }

.sba-about .sba-step-number {
  width: 3.5rem;
  height: 3.5rem;
  background: white;
  color: var(--ink);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'DM Serif Display', serif;
  font-size: 1.5rem;
  margin: 0 auto 1.25rem;
}

.sba-about .sba-step h3 {
  font-size: clamp(1rem, 2.5vw, 1.15rem);
  font-weight: 700;
  color: white;
  margin-bottom: 0.6rem;
}
.sba-about .sba-step p {
  font-size: 0.875rem;
  color: #9ca3af;
  line-height: 1.7;
  max-width: 18rem;
  margin: 0 auto;
}

/* Divider between steps on mobile */
@media (max-width: 639px) {
  .sba-about .sba-step:not(:last-child) {
    padding-bottom: clamp(1.5rem, 4vw, 2rem);
    border-bottom: 1px solid #374151;
  }
}

/* ── Fade-in animations ── */
@keyframes sba-about-fadein {
  from { opacity: 0; transform: translateY(14px); }
  to   { opacity: 1; transform: none; }
}
.sba-about .sba-fadein  { animation: sba-about-fadein 0.5s ease both; }
.sba-about .sba-fadein1 { animation: sba-about-fadein 0.5s 0.1s ease both; }
.sba-about .sba-fadein2 { animation: sba-about-fadein 0.5s 0.2s ease both; }
.sba-about .sba-fadein3 { animation: sba-about-fadein 0.5s 0.3s ease both; }
`;

// ── Style injector ─────────────────────────────────────────────────────────────
function ScopedStyles() {
  useEffect(() => {
    const id = 'sba-about-styles';
    if (document.getElementById(id)) return;
    const el = document.createElement('style');
    el.id = id;
    el.textContent = CSS;
    document.head.appendChild(el);
    return () => el.remove();
  }, []);
  return null;
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function About() {
  return (
    <div id="about" className="sba-about">
      <ScopedStyles />

      {/* ── SEO HEAD ── */}
      {Helmet && (
        <Helmet>
          <title>About Us | SBA Tech School — Affordable Online Tech Bootcamp</title>
          <meta
            name="description"
            content="Learn about SBA Tech School — an affordable online tech bootcamp with a 95% completion rate, hands-on project-based training, and industry-relevant software development skills."
          />
          <meta name="robots" content="index, follow" />
          <link rel="canonical" href="https://sbatechschool.com/about" />

          {/* Open Graph */}
          <meta property="og:type" content="website" />
          <meta property="og:url" content="https://sbatechschool.com/about" />
          <meta property="og:title" content="About SBA Tech School — Affordable Online Tech Bootcamp" />
          <meta
            property="og:description"
            content="SBA Tech School bridges the gap between learning and employment. Practical skills, real projects, affordable pricing."
          />
          <meta property="og:site_name" content="SBA Tech School" />
          <meta
            property="og:image"
            content="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80"
          />

          {/* Twitter Card */}
          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:title" content="About SBA Tech School" />
          <meta
            name="twitter:description"
            content="An affordable online tech bootcamp focused on real skills and real jobs."
          />
          <meta
            name="twitter:image"
            content="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80"
          />

          {/* Structured data */}
          <script type="application/ld+json">{JSON.stringify(structuredData)}</script>
        </Helmet>
      )}

      {/* ── HERO ── */}
      <header className="sba-hero sba-fadein" aria-labelledby="about-heading">
        <p className="sba-eyebrow">Who We Are</p>
        <h1 id="about-heading">About Us</h1>
        <p>
          We're on a mission to make quality tech education accessible to everyone — wherever
          you are, whatever your background.
        </p>
      </header>

      {/* ── STATS ── */}
      <div
        className="sba-stats-grid sba-fadein1"
        role="list"
        aria-label="Key statistics"
      >
        {stats.map((s) => (
          <div key={s.label} className="sba-stat-card" role="listitem">
            <p className="sba-stat-number" aria-label={`${s.number} ${s.label}`}>
              {s.number}
            </p>
            <p className="sba-stat-label">{s.label}</p>
          </div>
        ))}
      </div>

      {/* ── STORY ── */}
      <section
        className="sba-story sba-fadein2"
        aria-labelledby="story-heading"
      >
        <div className="sba-story-text">
          <h2 id="story-heading">Why We Built SBA Tech School</h2>
          <p>
            Too many people are locked out of tech careers by expensive bootcamps, outdated
            degrees, and low-quality online courses that don't lead to jobs.
          </p>
          <p>
            We believed there was a better way — an affordable online tech bootcamp that
            teaches practical software development skills and lets students learn at their
            own pace.
          </p>
          <p>
            SBA Tech School was created to bridge the gap between learning and employment,
            helping students transition into real-world tech roles with confidence.
          </p>
        </div>

        <div className="sba-story-img">
          <img
            src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80"
            alt="Students collaborating on software development projects"
            loading="lazy"
            decoding="async"
            width="1200"
            height="800"
          />
        </div>
      </section>

      {/* ── VALUES ── */}
      <div className="sba-values-wrap sba-fadein2">
        <div className="sba-values-panel">
          <div className="sba-panel-header">
            <p className="sba-eyebrow">Our Philosophy</p>
            <h2>Our Approach to Tech Education</h2>
            <p>Everything we do is designed to help students gain real, employable tech skills.</p>
          </div>

          <div className="sba-values-grid" role="list">
            {values.map(({ icon: Icon, title, description }) => (
              <article key={title} className="sba-value-card" role="listitem">
                <div className="sba-value-icon" aria-hidden="true">
                  <Icon />
                </div>
                <h3>{title}</h3>
                <p>{description}</p>
              </article>
            ))}
          </div>
        </div>
      </div>

      {/* ── WHY CHOOSE ── */}
      <section
        className="sba-reasons-wrap sba-fadein3"
        aria-labelledby="reasons-heading"
      >
        <div className="sba-panel-header" style={{ textAlign: 'center', marginBottom: 'clamp(1.75rem, 4vw, 3rem)' }}>
          <p className="sba-eyebrow">Why Us</p>
          <h2
            id="reasons-heading"
            style={{ fontFamily: "'DM Serif Display', serif", fontSize: 'clamp(1.75rem, 4.5vw, 2.75rem)', color: 'var(--ink)', marginBottom: '0.75rem' }}
          >
            Why Students Choose Our Tech Bootcamp
          </h2>
          <p style={{ fontSize: 'clamp(0.9rem, 2vw, 1.05rem)', color: 'var(--muted)', maxWidth: '32rem', margin: '0 auto', lineHeight: 1.7 }}>
            We focus on outcomes, not hype.
          </p>
        </div>

        <div className="sba-reasons-grid" role="list">
          {reasons.map(({ title, description }) => (
            <article key={title} className="sba-reason-card" role="listitem">
              <div className="sba-reason-icon" aria-hidden="true">
                <CheckCircle />
              </div>
              <div>
                <h3>{title}</h3>
                <p>{description}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <div className="sba-how-wrap sba-fadein3">
        <div className="sba-how-panel">
          <div className="sba-panel-header">
            <p className="sba-eyebrow">The Process</p>
            <h2>How Our Online Tech Bootcamp Works</h2>
            <p>Simple, flexible, and focused on results.</p>
          </div>

          <ol className="sba-steps-grid" aria-label="How SBA Tech School works">
            {steps.map(({ n, title, body }) => (
              <li key={n} className="sba-step">
                <div className="sba-step-number" aria-hidden="true">{n}</div>
                <h3>{title}</h3>
                <p>{body}</p>
              </li>
            ))}
          </ol>
        </div>
      </div>

    </div>
  );
}