/**
 * Central portfolio content — edit this file to update the whole site.
 */

export const profile = {
  name: "Full-Stack Engineer",
  role: "Senior Full-Stack Developer · Security-Minded Builder",
  tagline:
    "I build production-ready web and desktop apps end-to-end — polished React frontends, hardened Node APIs, and cloud deployments tested against OWASP top risks.",
  location: "Lahore, Pakistan",
  availability: "Available for Upwork Contracts & Strategic Engineering",
  experienceYears: "1+",
  roles: [
    "Full-Stack Web Developer",
    "Secure Backend Architect",
    "React · Node · Cloud",
    "OWASP-Hardened APIs",
  ],
  heroStats: [
    { label: "React 19 · Node", tone: "accent" },
    { label: "OWASP-aware APIs", tone: "secure" },
    { label: "Cloud · CI/CD", tone: "indigo" },
  ],
};

export const links = {
  upwork: "https://www.upwork.com/freelancers/",
  github: "https://github.com/Ahme-Byte",
  linkedin: "https://www.linkedin.com/in/muhammad-ahmad-7b6717445/",
  email: "ahmipersonal05@gmail.com",
  whatsapp: "https://wa.me/923357247914",
};

export const navLinks = [
  { id: "hero", label: "Home", hash: "#hero" },
  { id: "about", label: "About", hash: "#about" },
  { id: "skills", label: "Skills", hash: "#skills" },
  { id: "projects", label: "Projects", hash: "#projects" },
  { id: "experience", label: "Experience", hash: "#experience" },
  { id: "education", label: "Education", hash: "#education" },
  { id: "contact", label: "Contact", hash: "#contact" },
];

/** Skills pillars — used by Arsenal (glass + 3D) */
export const skillPillars = [
  {
    id: "frontend",
    title: "Frontend Engineering",
    color: "#38BDF8",
    colorV: 0x38bdf8,
    blurb: "Polished, accessible UIs with modern React architecture.",
    skills: [
      { id: "react", label: "React 19", score: 98 },
      { id: "next", label: "Next.js", score: 92 },
      { id: "ts", label: "TypeScript", score: 94 },
      { id: "tw", label: "Tailwind v4", score: 96 },
      { id: "r3f", label: "R3F / Three.js", score: 88 },
    ],
  },
  {
    id: "backend",
    title: "Backend Architecture",
    color: "#6366F1",
    colorV: 0x6366f1,
    blurb: "Scalable APIs, auth flows, and service boundaries.",
    skills: [
      { id: "node", label: "Node.js", score: 96 },
      { id: "express", label: "Express / Fastify", score: 94 },
      { id: "rest", label: "REST & GraphQL", score: 90 },
      { id: "auth", label: "JWT / OAuth2", score: 93 },
      { id: "workers", label: "Queues & Workers", score: 86 },
    ],
  },
  {
    id: "cloud",
    title: "Database & Cloud",
    color: "#60A5FA",
    colorV: 0x60a5fa,
    blurb: "Data models, caching, and reliable deploys.",
    skills: [
      { id: "pg", label: "PostgreSQL", score: 90 },
      { id: "mysql", label: "MySQL", score: 88 },
      { id: "mongo", label: "MongoDB", score: 95 },
      { id: "redis", label: "Redis", score: 88 },
      { id: "docker", label: "Docker", score: 90 },
      { id: "cicd", label: "CI/CD · AWS", score: 87 },
    ],
  },
  {
    id: "security",
    title: "Security & DevSecOps",
    color: "#34D399",
    colorV: 0x34d399,
    blurb: "OWASP-aware design baked into every layer.",
    skills: [
      { id: "owasp", label: "OWASP Top 10", score: 92 },
      { id: "api-sec", label: "API Security", score: 91 },
      { id: "helmet", label: "Headers · CSP", score: 90 },
      { id: "encrypt", label: "Encrypted Data", score: 88 },
      { id: "audit", label: "Dependency Audit", score: 89 },
    ],
  },
  {
    id: "desktop",
    title: "Desktop Apps",
    color: "#14B8A6",
    colorV: 0x14b8a6,
    blurb: "Cross-platform desktop applications with Electron.",
    skills: [
      { id: "electron", label: "Electron.js", score: 88 },
      { id: "desktop-app-development", label: "Desktop App Development", score: 86 },
    ],
  },
];

export const projects = [
  {
    id: "proj-workingtrust",
    title: "WorkingTrust",
    subtitle: "Freelance marketplace",
    year: "2026",
    status: "Live",
    description:
      "An Upwork-style marketplace where clients and freelancers create profiles, buy plans and connects, bid on work, get hired, and message directly.",
    preview: {
      from: "#38BDF8",
      to: "#6366F1",
      label: "workingtrust.online",
      image: "/projects/workingtrust.gif",
    },
    stack: ["Next.js", "TypeScript", "Node.js"],
    architecture: "Next.js application · Typed Node.js APIs · Marketplace flows",
    security: [
      "Validated profiles",
      "Protected messaging",
      "Role-aware workflows",
    ],
    links: {
      live: "https://workingtrust.online/",
    },
  },
  {
    id: "proj-jtbsocial",
    title: "JTB Social",
    subtitle: "Facebook-style social network",
    year: "2026",
    status: "Live",
    description:
      "A PHP social network with profiles, stories, posts, reels, comments, likes, shares, reposts, marketplace, groups, and messenger.",
    preview: {
      from: "#10B981",
      to: "#3B82F6",
      label: "jtbsocial.com",
      image: "/projects/jtbsocial.gif",
    },
    stack: ["PHP", "MySQL", "JavaScript", "HTML", "CSS"],
    architecture: "PHP application · MySQL persistence · Interactive social feeds",
    security: [
      "Prepared statements",
      "Input validation",
      "Session protections",
    ],
    links: {
      live: "https://jtbsocial.com/",
      github: "https://github.com/Ahme-Byte",
    },
  },
  {
    id: "proj-earnnova",
    title: "EarnNova",
    subtitle: "Campaigns & membership platform",
    year: "2026",
    status: "Live",
    description:
      "A revenue platform with campaigns, USD balances and local-currency equivalents, plus membership plans for earning opportunities.",
    preview: {
      from: "#34D399",
      to: "#0EA5E9",
      label: "earnnova.online",
      image: "/projects/earnnova.gif",
    },
    stack: ["Next.js", "Node.js", "MongoDB"],
    architecture: "Next.js product UI · Node.js services · Revenue workflows",
    security: ["Account protections", "Validated transactions", "Secure sessions"],
    links: {
      live: "https://www.earnnova.online/",
    },
  },
  {
    id: "proj-greenbus",
    title: "GreenBus",
    subtitle: "Electric bus transit management",
    year: "2026",
    status: "Live",
    description:
      "A MERN transit-management platform for electric bus operations, built with JWT authentication and role-based access controls.",
    preview: {
      from: "#0EA5E9",
      to: "#34D399",
      label: "greenbus.online",
      image: "/projects/greenbus.gif",
    },
    stack: ["MongoDB", "Express", "React", "Node.js"],
    architecture: "MERN application · JWT authentication · RBAC",
    security: [
      "OWASP Top 10 hardening",
      "JWT sessions",
      "Role-based access control",
      "Input validation",
    ],
    links: {
      live: "https://greenbus.online",
      github: "https://github.com/Ahme-Byte/electro",
    },
  },
  {
    id: "proj-osha-learning",
    title: "OSHA Learning",
    subtitle: "Learning platform & course delivery",
    year: "2026",
    status: "Live",
    description:
      "A course platform with paid and free learning paths, student quizzes, and completion certificates.",
    preview: {
      from: "#F59E0B",
      to: "#38BDF8",
      label: "osha-learning.vercel.app",
      image: "/projects/osha-learning.gif",
    },
    stack: ["Next.js", "Node.js", "MongoDB"],
    architecture: "Next.js learning experience · Node.js course services",
    security: ["Protected course access", "Student accounts", "Validated quizzes"],
    links: {
      live: "https://osha-learning.vercel.app/",
    },
  },
  {
    id: "proj-sandun-portfolio",
    title: "Sandun Portfolio",
    subtitle: "Client portfolio website",
    year: "2026",
    status: "Live",
    description:
      "A polished, responsive portfolio built for a client, focused on a clear presentation of their work and profile.",
    preview: {
      from: "#6366F1",
      to: "#EC4899",
      label: "sandun-portfoilo.vercel.app",
      image: "/projects/sandun-portfolio.gif",
    },
    stack: ["Next.js", "React", "CSS"],
    architecture: "Frontend-only Next.js portfolio",
    security: ["Responsive, accessible UI", "Static frontend delivery"],
    links: {
      live: "https://sandun-portfoilo.vercel.app/",
    },
  },
  {
    id: "proj-service-company",
    title: "Software House Portfolio",
    subtitle: "Official agency web presence & showcase platform",
    year: "2026",
    status: "Live",
    description:
      "Corporate web platform for a full-service software agency — featuring responsive service showcases, interactive case studies, client testimonial flows, and integrated lead-capture pipelines.",
    preview: {
      from: "#6366F1",
      to: "#A855F7",
      label: "company-p.netlify.app",
    },
    stack: ["React 19", "Tailwind CSS", "Framer Motion", "Vite", "Netlify"],
    architecture: "Component-driven agency UI · Jamstack · Netlify CI/CD",
    security: [
      "HTTPS enforcement",
      "Input sanitization",
      "Environment variable protection",
      "Headers hardening",
    ],
    links: {
      live: "https://company-p.netlify.app",
      github: "https://github.com/Ahme-Byte/service-company",
    },
  },
  {
    id: "proj-staymesh",
    title: "StayMesh Rentals",
    subtitle: "Hardened marketplace with SSR templates",
    year: "2025",
    status: "Live",
    description:
      "Full-stack lodging marketplace with resource-level authorization, hardened sessions, and multi-tenant CRUD protected by ownership middleware.",
    preview: {
      from: "#34D399",
      to: "#0EA5E9",
      label: "airbnb-basic.onrender.com",
    },
    stack: ["Express", "EJS", "MongoDB", "Passport", "Nginx"],
    architecture: "Monolithic SSR · Passport auth · MongoStore sessions",
    security: [
      "Ownership guards",
      "NoSQL injection filters",
      "Session hardening",
    ],
    links: {
      live: "https://airbnb-basic.onrender.com",
      github: "https://github.com/Ahme-Byte/Airbnb-basic.git",
    },
  },
  {
    id: "proj-meteo",
    title: "Meteo Shield",
    subtitle: "Role-based weather intelligence",
    year: "2026",
    status: "Production",
    description:
      "Weather platform with email verification, secure password resets, proxied API keys, and strict rate limits on premium endpoints.",
    preview: {
      from: "#6366F1",
      to: "#38BDF8",
      label: "meteo-shield",
    },
    stack: ["React 19", "Node", "MongoDB", "Redis", "JWT"],
    architecture: "Auth service · API proxy · Redis token blacklist",
    security: ["HTTPOnly cookies", "HMAC tokens", "CORS whitelist", "CSP"],
    links: {
      live: "#",
      github: "https://github.com/Ahme-Byte/Full_stack-weather",
    },
  },
];

export const experience = [
  {
    id: "exp-devarion",
    role: "Full Stack Web Developer",
    company: "DevArion Solution",
    location: "Lahore, Pakistan",
    period: "April 2026 — Present",
    duration: "6 months",
    type: "Full-time",
    ongoing: true,
    highlights: [
      "Built scalable full-stack web applications for production clients",
      "Implemented secure authentication (JWT / session hardening)",
      "Integrated cloud and VPS deployments with CI/CD pipelines",
      "Optimized frontend performance and API response paths",
    ],
  },
];

export const deploymentStack = [
  { id: "vps", label: "VPS / Linux" },
  { id: "docker", label: "Docker" },
  { id: "netlify", label: "Netlify" },
  { id: "vercel", label: "Vercel" },
  { id: "render", label: "Render" },
  { id: "railway", label: "Railway" },
  { id: "nginx", label: "Nginx" },
  { id: "hostinger", label: "Hostinger KVM VPS" },
  { id: "cicd", label: "CI/CD Pipelines" },
  { id: "ssl", label: "SSL / TLS" },
];

export const education = [
  {
    degree: "Bachelor of Science in Computer Science (BS CS)",
    institution: "The Islamia University of Bahawalpur (IUB)",
    cgpa: "3.2 / 4.0",
    status: "Graduated",
    highlights: [
      "Strong foundation in Data Structures, Algorithms, Software Engineering, and Web Systems.",
      "Specialized in Secure Application Architecture, Network Security, and Modern Web Frameworks.",
      "Graduated with High Merit distinction (3.6 CGPA).",
    ],
    courses: [
      "Data Structures & Algorithms",
      "Cybersecurity & Cryptography",
      "Database Systems",
      "Web Engineering",
      "Software Engineering",
      "Computer Networks",
    ],
  },
];

export const securityBadges = [
  { id: "owasp", label: "OWASP Top 10 Verified" },
  { id: "ssl", label: "SSL Encrypted" },
  { id: "clean", label: "Clean Code Certified" },
];

export const contact = {
  formspreeEndpoint: "https://formspree.io/f/meewyeza",
  projectTypes: [
    "Full-stack web app",
    "Frontend rebuild",
    "API / backend",
    "Security audit",
    "Other",
  ],
  budgets: ["Under $2k", "$2k–$5k", "$5k–$15k", "$15k+", "Ongoing retainer"],
  badges: [
    { label: "TLS Encrypted", tone: "secure" },
    { label: "Direct · Private", tone: "accent" },
    { label: "No spam stored", tone: "indigo" },
  ],
};

export const footer = {
  bio: "Elite full-stack engineer crafting high-performance web apps with security-first backends. Based in Lahore — shipping for global clients on Upwork.",
  builtWith: "React · Three.js · Framer Motion · Lenis",
};
