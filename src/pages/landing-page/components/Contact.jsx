/**
 * Contact.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Fully responsive contact page for SBA Tech School.
 *
 * Dependencies (already in a typical Vite + React project):
 *   npm install react-helmet-async lucide-react
 *
 * Usage:
 *   import Contact from './Contact';
 *   // Then use <Contact /> anywhere — in a router, a page, or standalone.
 *
 * The component is self-contained:
 *   • All styles live in the <style> block via a <GlobalStyles /> helper
 *     so Tailwind is NOT required.
 *   • <Helmet> tags work when HelmetProvider wraps your app root.
 *     If HelmetProvider is absent the page still renders perfectly —
 *     just without the injected <head> tags.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { useState, useEffect, useRef } from 'react';

// ── Try to import Helmet; gracefully skip if react-helmet-async isn't present
let Helmet = null;
try {
  // Dynamic-style guard so bundlers don't error in projects without the lib
  // In a real project this is always available; just swap for a direct import:
  // import { Helmet } from 'react-helmet-async';
  Helmet = require('react-helmet-async').Helmet;
} catch (_) {}

import {
  Mail,
  Send,
  CheckCircle,
  ChevronRight,
  ArrowRight,
  Loader2,
  GraduationCap,
  Briefcase,
  HeadphonesIcon,
  MessageSquare,
} from 'lucide-react';

// ─── Structured data ──────────────────────────────────────────────────────────
const structuredData = {
  '@context': 'https://schema.org',
  '@type': 'ContactPage',
  name: 'Contact SBA Tech School',
  description:
    'Get in touch with SBA Tech School for program information, admissions, student support, or employer partnerships.',
  url: 'https://sbatechschool.com/contact',
  mainEntity: {
    '@type': 'EducationalOrganization',
    name: 'SBA Tech School',
    url: 'https://sbatechschool.com',
    email: 'hello@sbatechschool.com',
    contactPoint: [
      {
        '@type': 'ContactPoint',
        email: 'admissions@sbatechschool.com',
        contactType: 'admissions',
        availableLanguage: 'English',
      },
      {
        '@type': 'ContactPoint',
        email: 'support@sbatechschool.com',
        contactType: 'customer support',
        availableLanguage: 'English',
      },
      {
        '@type': 'ContactPoint',
        email: 'careers@sbatechschool.com',
        contactType: 'sales',
        availableLanguage: 'English',
      },
    ],
  },
};

// ─── Data ─────────────────────────────────────────────────────────────────────
const departments = [
  {
    icon: GraduationCap,
    label: 'Admissions',
    description: 'Program info, applications & cohort dates',
    email: 'admissions@sbatechschool.com',
  },
  {
    icon: MessageSquare,
    label: 'General Inquiries',
    description: 'Anything else — we read every message',
    email: 'hello@sbatechschool.com',
  },
  {
    icon: Briefcase,
    label: 'Employer & Careers',
    description: 'Hire our graduates or partner with us',
    email: 'careers@sbatechschool.com',
  },
  {
    icon: HeadphonesIcon,
    label: 'Student Support',
    description: "Current students — we've got you",
    email: 'support@sbatechschool.com',
  },
];

const inquiryTypes = [
  'Program Information',
  'Admissions & Application',
  'Book a Free Career Call',
  'Employer / Hiring Partnership',
  'Student Support',
  'Media & Press',
  'Other',
];

const faqs = [
  {
    q: 'When does the next cohort start?',
    a: 'Our Spring 2026 cohort begins March 2, 2026. Seats are limited — early applications are reviewed first.',
  },
  {
    q: 'Do I need prior experience?',
    a: 'Most programs are designed for beginners. The AI/ML track requires basic Python knowledge.',
  },
  {
    q: 'How long do programs take?',
    a: 'Programs range from 16 to 24 weeks. Plan for 10–15 hours per week of study and project work.',
  },
  {
    q: 'Is there a payment plan?',
    a: 'Yes. Email admissions@sbatechschool.com to learn about our payment and financing options.',
  },
  {
    q: 'Can I enrol in two programs?',
    a: 'Students may be enrolled in up to 2 programs simultaneously with an active subscription.',
  },
  {
    q: 'How does job placement work?',
    a: 'Graduates receive resume reviews, mock interviews, and direct introductions to our hiring partners.',
  },
];

// ─── Scoped CSS injected once ─────────────────────────────────────────────────
const CSS = `
  /* Google Font import */
  @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500;600;700&family=DM+Mono&display=swap');

  .sba-contact * { box-sizing: border-box; }

  /* ── Root vars ── */
  .sba-contact {
    --ink:    #111111;
    --muted:  #6b7280;
    --border: #e5e7eb;
    --bg:     #f9fafb;
    --white:  #ffffff;
    --green:  #16a34a;
    --red:    #dc2626;
    --accent: #111111;

    font-family: 'DM Sans', sans-serif;
    color: var(--ink);
    background: var(--bg);
    min-height: 100vh;
    -webkit-font-smoothing: antialiased;
  }

  /* ── Hero ── */
  .sba-hero {
    padding: clamp(3rem, 8vw, 6rem) 1.25rem clamp(2rem, 5vw, 4rem);
    text-align: center;
    max-width: 52rem;
    margin: 0 auto;
  }

  .sba-hero-eyebrow {
    font-size: 0.7rem;
    font-weight: 700;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: var(--muted);
    margin-bottom: 1rem;
  }

  .sba-hero h1 {
    font-family: 'DM Serif Display', serif;
    font-size: clamp(2.8rem, 8vw, 5.5rem);
    line-height: 1;
    letter-spacing: -0.02em;
    color: var(--ink);
    margin: 0 0 1.25rem;
  }

  .sba-hero p {
    font-size: clamp(1rem, 2.5vw, 1.15rem);
    color: var(--muted);
    line-height: 1.7;
    margin: 0;
  }

  /* ── Body grid ── */
  .sba-body {
    max-width: 72rem;
    margin: 0 auto;
    padding: clamp(2rem, 5vw, 4rem) 1.25rem;
    display: grid;
    grid-template-columns: 1fr;
    gap: 2.5rem;
  }

  @media (min-width: 1024px) {
    .sba-body { grid-template-columns: 2fr 3fr; gap: 3.5rem; }
  }

  /* ── Sidebar ── */
  .sba-sidebar { display: flex; flex-direction: column; gap: 1.25rem; }

  .sba-eyebrow {
    font-size: 0.65rem;
    font-weight: 700;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: var(--muted);
    margin-bottom: 0.75rem;
  }

  /* Dept cards */
  .sba-dept-list { display: flex; flex-direction: column; gap: 0.625rem; }

  /* On mobile: 2-column grid for dept cards */
  @media (min-width: 480px) and (max-width: 1023px) {
    .sba-dept-list { display: grid; grid-template-columns: 1fr 1fr; }
  }

  .sba-dept-card {
    display: flex;
    align-items: flex-start;
    gap: 0.875rem;
    padding: 1rem;
    background: var(--white);
    border-radius: 0.875rem;
    border: 1.5px solid var(--border);
    text-decoration: none;
    transition: border-color 0.18s, box-shadow 0.18s, transform 0.18s;
    cursor: pointer;
  }

  .sba-dept-card:hover {
    border-color: var(--ink);
    box-shadow: 0 4px 16px rgba(0,0,0,0.08);
    transform: translateY(-1px);
  }

  .sba-dept-icon {
    width: 2.25rem;
    height: 2.25rem;
    background: #f3f4f6;
    border-radius: 0.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    transition: background 0.18s;
  }

  .sba-dept-card:hover .sba-dept-icon { background: var(--ink); }
  .sba-dept-card:hover .sba-dept-icon svg { color: white !important; }

  .sba-dept-icon svg { width: 1.1rem; height: 1.1rem; color: var(--muted); transition: color 0.18s; }

  .sba-dept-body { flex: 1; min-width: 0; }
  .sba-dept-label { font-size: 0.82rem; font-weight: 700; color: var(--ink); margin-bottom: 0.15rem; }
  .sba-dept-desc { font-size: 0.72rem; color: var(--muted); margin-bottom: 0.35rem; line-height: 1.4; }
  .sba-dept-email { font-family: 'DM Mono', monospace; font-size: 0.68rem; color: #4b5563; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

  .sba-dept-chevron { width: 1rem; height: 1rem; color: #d1d5db; flex-shrink: 0; margin-top: 0.2rem; }

  /* Status pill */
  .sba-status {
    display: flex;
    align-items: flex-start;
    gap: 0.75rem;
    background: var(--white);
    border-radius: 0.875rem;
    border: 1.5px solid var(--border);
    padding: 1rem 1.125rem;
  }

  .sba-status-dot {
    width: 0.625rem;
    height: 0.625rem;
    border-radius: 50%;
    background: var(--green);
    flex-shrink: 0;
    margin-top: 0.35rem;
    box-shadow: 0 0 0 4px #dcfce7;
  }

  .sba-status-title { font-size: 0.82rem; font-weight: 700; color: var(--ink); margin-bottom: 0.25rem; }
  .sba-status-body { font-size: 0.75rem; color: var(--muted); line-height: 1.55; }

  /* CTA card */
  .sba-cta-card {
    background: var(--ink);
    border-radius: 1rem;
    padding: clamp(1.25rem, 4vw, 1.75rem);
  }

  .sba-cta-eyebrow { font-size: 0.65rem; font-weight: 700; letter-spacing: 0.18em; text-transform: uppercase; color: #9ca3af; margin-bottom: 0.5rem; }
  .sba-cta-title { font-family: 'DM Serif Display', serif; font-size: clamp(1.25rem, 3vw, 1.5rem); color: white; margin-bottom: 0.5rem; }
  .sba-cta-body { font-size: 0.8rem; color: #9ca3af; line-height: 1.6; margin-bottom: 1.1rem; }

  .sba-cta-btn {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    padding: 0.6rem 1.1rem;
    background: white;
    color: var(--ink);
    font-weight: 700;
    font-size: 0.8rem;
    border-radius: 0.5rem;
    text-decoration: none;
    transition: background 0.15s;
  }
  .sba-cta-btn:hover { background: #e5e7eb; }
  .sba-cta-btn svg { width: 0.9rem; height: 0.9rem; }

  /* ── Form panel ── */
  .sba-form-panel {
    background: var(--white);
    border-radius: 1.25rem;
    border: 1.5px solid var(--border);
    box-shadow: 0 2px 16px rgba(0,0,0,0.05);
    overflow: hidden;
  }

  .sba-form-inner { padding: clamp(1.5rem, 5vw, 2.5rem); }

  .sba-form-heading { font-family: 'DM Serif Display', serif; font-size: clamp(1.5rem, 4vw, 2rem); color: var(--ink); margin-bottom: 0.3rem; }
  .sba-form-sub { font-size: 0.82rem; color: var(--muted); margin-bottom: 2rem; }

  .sba-form { display: flex; flex-direction: column; gap: 1.1rem; }

  /* Name row: stack on mobile, side-by-side from 480px */
  .sba-name-row { display: grid; grid-template-columns: 1fr; gap: 1rem; }
  @media (min-width: 480px) { .sba-name-row { grid-template-columns: 1fr 1fr; } }

  .sba-field-group { display: flex; flex-direction: column; }

  .sba-label {
    font-size: 0.65rem;
    font-weight: 700;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    color: #374151;
    margin-bottom: 0.4rem;
  }
  .sba-label span { color: var(--red); }

  .sba-input, .sba-select, .sba-textarea {
    width: 100%;
    padding: 0.75rem 1rem;
    border-radius: 0.6rem;
    border: 1.5px solid var(--border);
    font-family: 'DM Sans', sans-serif;
    font-size: 0.875rem;
    color: var(--ink);
    background: white;
    outline: none;
    transition: border-color 0.15s, box-shadow 0.15s;
    -webkit-appearance: none;
    appearance: none;
  }

  .sba-input:focus, .sba-select:focus, .sba-textarea:focus {
    border-color: var(--ink);
    box-shadow: 0 0 0 3px rgba(17,17,17,0.08);
  }

  .sba-input.error, .sba-select.error, .sba-textarea.error {
    border-color: var(--red);
    background: #fef2f2;
  }

  .sba-select { cursor: pointer; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2.5'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 0.9rem center; padding-right: 2.25rem; }

  .sba-textarea { resize: none; line-height: 1.6; }

  .sba-error-msg { margin-top: 0.3rem; font-size: 0.72rem; color: var(--red); }

  .sba-char-row { display: flex; justify-content: space-between; align-items: center; margin-top: 0.3rem; }
  .sba-char-count { font-size: 0.72rem; }
  .sba-char-count.ok { color: var(--green); }
  .sba-char-count.low { color: var(--muted); }

  .sba-privacy { font-size: 0.72rem; color: var(--muted); line-height: 1.55; }
  .sba-privacy a { color: #4b5563; text-underline-offset: 2px; }
  .sba-privacy a:hover { color: var(--ink); }

  /* Submit button */
  .sba-submit {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    width: 100%;
    padding: 0.9rem;
    background: var(--ink);
    color: white;
    font-family: 'DM Sans', sans-serif;
    font-weight: 700;
    font-size: 0.875rem;
    border: none;
    border-radius: 0.6rem;
    cursor: pointer;
    transition: background 0.15s, transform 0.1s;
  }
  .sba-submit:hover:not(:disabled) { background: #333; transform: translateY(-1px); }
  .sba-submit:disabled { opacity: 0.55; cursor: not-allowed; }
  .sba-submit svg { width: 1rem; height: 1rem; }

  /* Spin animation */
  @keyframes sba-spin { to { transform: rotate(360deg); } }
  .sba-spin { animation: sba-spin 0.8s linear infinite; }

  /* ── Success state ── */
  .sba-success {
    text-align: center;
    padding: 3.5rem 1rem;
  }

  .sba-success-icon {
    width: 4rem;
    height: 4rem;
    background: #dcfce7;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 1.25rem;
  }
  .sba-success-icon svg { width: 2rem; height: 2rem; color: var(--green); }
  .sba-success h2 { font-family: 'DM Serif Display', serif; font-size: 1.75rem; color: var(--ink); margin-bottom: 0.75rem; }
  .sba-success p { font-size: 0.9rem; color: var(--muted); line-height: 1.65; max-width: 22rem; margin: 0 auto 2rem; }
  .sba-success strong { color: var(--ink); }

  .sba-reset-btn {
    padding: 0.65rem 1.4rem;
    border: 2px solid var(--border);
    background: white;
    color: #374151;
    font-family: 'DM Sans', sans-serif;
    font-size: 0.82rem;
    font-weight: 600;
    border-radius: 0.6rem;
    cursor: pointer;
    transition: border-color 0.15s, color 0.15s;
  }
  .sba-reset-btn:hover { border-color: var(--ink); color: var(--ink); }

  /* ── FAQ section ── */
  .sba-faq {
    background: var(--white);
    border-top: 1.5px solid var(--border);
    padding: clamp(3rem, 8vw, 5rem) 1.25rem;
  }

  .sba-faq-header {
    text-align: center;
    margin-bottom: clamp(2rem, 5vw, 3rem);
  }

  .sba-faq-header h2 {
    font-family: 'DM Serif Display', serif;
    font-size: clamp(2rem, 5vw, 3rem);
    color: var(--ink);
    margin-bottom: 0;
    margin-top: 0.5rem;
  }

  .sba-faq-grid {
    max-width: 72rem;
    margin: 0 auto;
    display: grid;
    grid-template-columns: 1fr;
    gap: 1rem;
    margin-bottom: clamp(2rem, 5vw, 3.5rem);
  }

  @media (min-width: 640px) { .sba-faq-grid { grid-template-columns: 1fr 1fr; } }
  @media (min-width: 1024px) { .sba-faq-grid { grid-template-columns: repeat(3, 1fr); } }

  .sba-faq-card {
    background: var(--bg);
    border-radius: 0.875rem;
    border: 1.5px solid var(--border);
    padding: 1.25rem 1.375rem;
    transition: border-color 0.15s, box-shadow 0.15s;
  }
  .sba-faq-card:hover { border-color: #9ca3af; box-shadow: 0 2px 10px rgba(0,0,0,0.05); }

  .sba-faq-q { font-weight: 700; font-size: 0.85rem; color: var(--ink); margin-bottom: 0.5rem; line-height: 1.45; }
  .sba-faq-a { font-size: 0.82rem; color: var(--muted); line-height: 1.65; }

  /* ── FAQ bottom CTA ── */
  .sba-faq-cta {
    max-width: 72rem;
    margin: 0 auto;
    background: var(--ink);
    border-radius: 1.25rem;
    padding: clamp(1.75rem, 5vw, 3rem) clamp(1.5rem, 5vw, 3rem);
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    align-items: flex-start;
  }

  @media (min-width: 640px) {
    .sba-faq-cta {
      flex-direction: row;
      align-items: center;
      justify-content: space-between;
    }
  }

  .sba-faq-cta-title { font-family: 'DM Serif Display', serif; font-size: clamp(1.5rem, 4vw, 2rem); color: white; margin: 0.4rem 0 0.5rem; }
  .sba-faq-cta-body { font-size: 0.82rem; color: #9ca3af; line-height: 1.6; max-width: 28rem; margin: 0; }

  .sba-faq-cta-btns {
    display: flex;
    flex-direction: column;
    gap: 0.625rem;
    flex-shrink: 0;
    width: 100%;
  }

  @media (min-width: 400px) { .sba-faq-cta-btns { flex-direction: row; width: auto; } }

  .sba-faq-btn-primary {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    padding: 0.7rem 1.2rem;
    background: white;
    color: var(--ink);
    font-weight: 700;
    font-size: 0.82rem;
    border-radius: 0.5rem;
    text-decoration: none;
    white-space: nowrap;
    transition: background 0.15s;
  }
  .sba-faq-btn-primary:hover { background: #e5e7eb; }
  .sba-faq-btn-primary svg { width: 0.9rem; height: 0.9rem; }

  .sba-faq-btn-secondary {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    padding: 0.7rem 1.2rem;
    border: 1.5px solid #4b5563;
    color: #d1d5db;
    font-weight: 600;
    font-size: 0.82rem;
    border-radius: 0.5rem;
    text-decoration: none;
    white-space: nowrap;
    transition: border-color 0.15s, color 0.15s;
  }
  .sba-faq-btn-secondary:hover { border-color: white; color: white; }
  .sba-faq-btn-secondary svg { width: 0.9rem; height: 0.9rem; }

  /* Fade-in animation on mount */
  @keyframes sba-fadein { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: none; } }
  .sba-fadein { animation: sba-fadein 0.45s ease both; }
  .sba-fadein-delay { animation: sba-fadein 0.45s 0.12s ease both; }
  .sba-fadein-delay2 { animation: sba-fadein 0.45s 0.22s ease both; }
`;

// ─── Style injection helper ───────────────────────────────────────────────────
function ScopedStyles() {
  useEffect(() => {
    const id = 'sba-contact-styles';
    if (document.getElementById(id)) return;
    const el = document.createElement('style');
    el.id = id;
    el.textContent = CSS;
    document.head.appendChild(el);
    return () => el.remove();
  }, []);
  return null;
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function Contact() {
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    inquiryType: '',
    message: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState({});
  const formRef = useRef(null);

  const validate = () => {
    const e = {};
    if (!form.firstName.trim()) e.firstName = 'Required';
    if (!form.lastName.trim()) e.lastName = 'Required';
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      e.email = 'Enter a valid email address';
    if (!form.inquiryType) e.inquiryType = 'Please select a type';
    if (!form.message.trim() || form.message.trim().length < 20)
      e.message = 'Please write at least 20 characters';
    return e;
  };

  const handleChange = (field) => (e) => {
    setForm((p) => ({ ...p, [field]: e.target.value }));
    if (errors[field]) setErrors((p) => ({ ...p, [field]: null }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      // Scroll to first error on mobile
      const first = formRef.current?.querySelector('.error');
      if (first) first.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    setSubmitting(true);
    // ── TODO: replace with your backend / Firebase / Resend / EmailJS call ──
    await new Promise((r) => setTimeout(r, 1400));
    setSubmitting(false);
    setSubmitted(true);
  };

  const reset = () => {
    setForm({ firstName: '', lastName: '', email: '', inquiryType: '', message: '' });
    setErrors({});
    setSubmitted(false);
  };

  return (
    <div className="sba-contact">
      <ScopedStyles />

      {/* ── SEO HEAD ── */}
      {Helmet && (
        <Helmet>
          <title>Contact Us | SBA Tech School</title>
          <meta
            name="description"
            content="Contact SBA Tech School for program information, admissions, student support, or employer partnerships. We reply within 24 hours."
          />
          <meta name="robots" content="index, follow" />
          <link rel="canonical" href="https://sbatechschool.com/contact" />

          {/* Open Graph */}
          <meta property="og:type" content="website" />
          <meta property="og:url" content="https://sbatechschool.com/contact" />
          <meta property="og:title" content="Contact Us | SBA Tech School" />
          <meta
            property="og:description"
            content="Reach our admissions, support, or careers team. We reply within 24 hours."
          />
          <meta property="og:site_name" content="SBA Tech School" />

          {/* Twitter Card */}
          <meta name="twitter:card" content="summary" />
          <meta name="twitter:title" content="Contact Us | SBA Tech School" />
          <meta
            name="twitter:description"
            content="Reach our admissions, support, or careers team. We reply within 24 hours."
          />

          {/* Structured data */}
          <script type="application/ld+json">
            {JSON.stringify(structuredData)}
          </script>
        </Helmet>
      )}

      {/* ── HERO ── */}
      <header className="sba-hero sba-fadein" aria-labelledby="contact-heading">
        <p className="sba-hero-eyebrow">SBA Tech School</p>
        <h1 id="contact-heading">Get in Touch</h1>
        <p>
          Have a question about programs, admissions, or careers?<br />
          A real person on our team will reply within 24 hours.
        </p>
      </header>

      {/* ── BODY ── */}
      <main className="sba-body" id="contact">

        {/* ── SIDEBAR ── */}
        <aside className="sba-sidebar sba-fadein-delay" aria-label="Contact channels">

          {/* Dept cards */}
          <section>
            <p className="sba-eyebrow">Reach the Right Team</p>
            <nav className="sba-dept-list" aria-label="Department contact list">
              {departments.map(({ icon: Icon, label, description, email }) => (
                <a
                  key={email}
                  href={`mailto:${email}`}
                  className="sba-dept-card"
                  aria-label={`Email ${label} at ${email}`}
                >
                  <div className="sba-dept-icon" aria-hidden="true">
                    <Icon />
                  </div>
                  <div className="sba-dept-body">
                    <p className="sba-dept-label">{label}</p>
                    <p className="sba-dept-desc">{description}</p>
                    <p className="sba-dept-email">{email}</p>
                  </div>
                  <ChevronRight className="sba-dept-chevron" aria-hidden="true" />
                </a>
              ))}
            </nav>
          </section>

          {/* Response time */}
          <div className="sba-status" role="status" aria-label="Response time information">
            <div className="sba-status-dot" aria-hidden="true" />
            <div>
              <p className="sba-status-title">We respond within 24 hours</p>
              <p className="sba-status-body">
                Monday–Friday, 9 AM – 6 PM EST. Weekend messages are answered first
                thing Monday morning.
              </p>
            </div>
          </div>

          {/* CTA card */}
          <div className="sba-cta-card">
            <p className="sba-cta-eyebrow">Prefer to talk?</p>
            <p className="sba-cta-title">Book a free 20-min career call</p>
            <p className="sba-cta-body">
              Chat with an advisor about which program fits your background and goals —
              no pressure.
            </p>
            <a
              href="mailto:admissions@sbatechschool.com?subject=Book a Career Call"
              className="sba-cta-btn"
              aria-label="Request a free career call via email"
            >
              Request a Call
              <ArrowRight aria-hidden="true" />
            </a>
          </div>
        </aside>

        {/* ── FORM ── */}
        <section className="sba-form-panel sba-fadein-delay2" aria-label="Contact form">
          <div className="sba-form-inner">
            {submitted ? (
              <div className="sba-success" role="alert" aria-live="polite">
                <div className="sba-success-icon" aria-hidden="true">
                  <CheckCircle />
                </div>
                <h2>Message sent!</h2>
                <p>
                  We've received your message and will reply to{' '}
                  <strong>{form.email}</strong> within 24 hours.
                </p>
                <button onClick={reset} className="sba-reset-btn">
                  Send another message
                </button>
              </div>
            ) : (
              <>
                <h2 className="sba-form-heading">Send us a message</h2>
                <p className="sba-form-sub">
                  Fill out the form and we'll route it to the right team.
                </p>

                <form
                  ref={formRef}
                  onSubmit={handleSubmit}
                  noValidate
                  className="sba-form"
                  aria-label="Contact form"
                >
                  {/* Name row */}
                  <div className="sba-name-row">
                    <div className="sba-field-group">
                      <label htmlFor="firstName" className="sba-label">
                        First Name <span aria-hidden="true">*</span>
                      </label>
                      <input
                        id="firstName"
                        type="text"
                        placeholder="Alex"
                        value={form.firstName}
                        onChange={handleChange('firstName')}
                        autoComplete="given-name"
                        aria-required="true"
                        aria-invalid={!!errors.firstName}
                        aria-describedby={errors.firstName ? 'err-first' : undefined}
                        className={`sba-input${errors.firstName ? ' error' : ''}`}
                      />
                      {errors.firstName && (
                        <p id="err-first" className="sba-error-msg" role="alert">
                          {errors.firstName}
                        </p>
                      )}
                    </div>
                    <div className="sba-field-group">
                      <label htmlFor="lastName" className="sba-label">
                        Last Name <span aria-hidden="true">*</span>
                      </label>
                      <input
                        id="lastName"
                        type="text"
                        placeholder="Johnson"
                        value={form.lastName}
                        onChange={handleChange('lastName')}
                        autoComplete="family-name"
                        aria-required="true"
                        aria-invalid={!!errors.lastName}
                        aria-describedby={errors.lastName ? 'err-last' : undefined}
                        className={`sba-input${errors.lastName ? ' error' : ''}`}
                      />
                      {errors.lastName && (
                        <p id="err-last" className="sba-error-msg" role="alert">
                          {errors.lastName}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Email */}
                  <div className="sba-field-group">
                    <label htmlFor="email" className="sba-label">
                      Email Address <span aria-hidden="true">*</span>
                    </label>
                    <input
                      id="email"
                      type="email"
                      placeholder="you@email.com"
                      value={form.email}
                      onChange={handleChange('email')}
                      autoComplete="email"
                      inputMode="email"
                      aria-required="true"
                      aria-invalid={!!errors.email}
                      aria-describedby={errors.email ? 'err-email' : undefined}
                      className={`sba-input${errors.email ? ' error' : ''}`}
                    />
                    {errors.email && (
                      <p id="err-email" className="sba-error-msg" role="alert">
                        {errors.email}
                      </p>
                    )}
                  </div>

                  {/* Inquiry type */}
                  <div className="sba-field-group">
                    <label htmlFor="inquiryType" className="sba-label">
                      What's this about? <span aria-hidden="true">*</span>
                    </label>
                    <select
                      id="inquiryType"
                      value={form.inquiryType}
                      onChange={handleChange('inquiryType')}
                      aria-required="true"
                      aria-invalid={!!errors.inquiryType}
                      aria-describedby={errors.inquiryType ? 'err-type' : undefined}
                      className={`sba-select${errors.inquiryType ? ' error' : ''}`}
                    >
                      <option value="">Select an inquiry type…</option>
                      {inquiryTypes.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                    {errors.inquiryType && (
                      <p id="err-type" className="sba-error-msg" role="alert">
                        {errors.inquiryType}
                      </p>
                    )}
                  </div>

                  {/* Message */}
                  <div className="sba-field-group">
                    <label htmlFor="message" className="sba-label">
                      Message <span aria-hidden="true">*</span>
                    </label>
                    <textarea
                      id="message"
                      rows={5}
                      placeholder="Tell us what's on your mind — the more detail, the better we can help."
                      value={form.message}
                      onChange={handleChange('message')}
                      aria-required="true"
                      aria-invalid={!!errors.message}
                      aria-describedby={
                        errors.message ? 'err-msg' : 'char-count'
                      }
                      className={`sba-textarea${errors.message ? ' error' : ''}`}
                    />
                    <div className="sba-char-row">
                      {errors.message ? (
                        <p id="err-msg" className="sba-error-msg" role="alert">
                          {errors.message}
                        </p>
                      ) : (
                        <span />
                      )}
                      <p
                        id="char-count"
                        className={`sba-char-count ${
                          form.message.length >= 20 ? 'ok' : 'low'
                        }`}
                        aria-live="polite"
                      >
                        {form.message.length} chars
                      </p>
                    </div>
                  </div>

                  {/* Privacy */}
                  <p className="sba-privacy">
                    By submitting you agree to our{' '}
                    <a href="/privacy">Privacy Policy</a>. We never share your
                    information with third parties.
                  </p>

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={submitting}
                    className="sba-submit"
                    aria-label={submitting ? 'Sending your message…' : 'Send message'}
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="sba-spin" aria-hidden="true" />
                        Sending…
                      </>
                    ) : (
                      <>
                        <Send aria-hidden="true" />
                        Send Message
                      </>
                    )}
                  </button>
                </form>
              </>
            )}
          </div>
        </section>
      </main>

      {/* ── FAQ ── */}
      <section className="sba-faq" aria-labelledby="faq-heading">
        <div className="sba-faq-header">
          <p className="sba-eyebrow">Before You Write</p>
          <h2 id="faq-heading">Common Questions</h2>
        </div>

        <div className="sba-faq-grid" role="list">
          {faqs.map(({ q, a }) => (
            <article key={q} className="sba-faq-card" role="listitem">
              <p className="sba-faq-q">{q}</p>
              <p className="sba-faq-a">{a}</p>
            </article>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="sba-faq-cta">
          <div>
            <p className="sba-cta-eyebrow">Still Have Questions?</p>
            <p className="sba-faq-cta-title">We read every email.</p>
            <p className="sba-faq-cta-body">
              A real person on our team will get back to you — not a bot.
            </p>
          </div>
          <div className="sba-faq-cta-btns">
            <a
              href="mailto:hello@sbatechschool.com"
              className="sba-faq-btn-primary"
              aria-label="Email us at hello@sbatechschool.com"
            >
              <Mail aria-hidden="true" />
              hello@sbatechschool.com
            </a>
            <a href="/" className="sba-faq-btn-secondary">
              View Programs
              <ArrowRight aria-hidden="true" />
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}