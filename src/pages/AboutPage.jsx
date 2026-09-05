// =======================================================
// AboutPage Component (/about)
// Public Mission, Impact Pillars & Technical Architecture
// =======================================================

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { authAPI } from '../services/api.js';
import Badge from '../components/common/Badge.jsx';
import {
  HeartHandshake,
  ShieldCheck,
  Users,
  Building2,
  Database,
  CheckCircle2,
  Terminal,
  Copy,
  Check,
  Sparkles,
  Award,
  Globe2,
  Heart,
  TrendingUp,
  Target,
  Eye,
} from 'lucide-react';

const PILLARS = [
  {
    icon: ShieldCheck,
    title: '100% Verified Non-Profits',
    color: 'bg-emerald-50 text-emerald-700',
    desc: 'Every registered NGO undergoes strict verification of legal credentials, 12A/80G status, and audit track records to eliminate fraudulent solicitations.',
  },
  {
    icon: Users,
    title: 'Empowered Volunteer Community',
    color: 'bg-orange-50 text-orange-700',
    desc: 'Matching skilled volunteers with on-ground causes, tracking community service hours, and issuing blockchain-verifiable impact certificates.',
  },
  {
    icon: Building2,
    title: 'Civic & Grassroots Collaboration',
    color: 'bg-blue-50 text-blue-700',
    desc: 'Providing non-profits with free enterprise-grade digital tools to organize volunteer drives, recruit members, and transparently publish progress.',
  },
  {
    icon: Heart,
    title: 'Direct & Transparent Giving',
    color: 'bg-rose-50 text-rose-700',
    desc: 'Transparent philanthropic channels ensuring that every rupee donated goes directly to verified community programs with digital receipts.',
  },
];

const VALUES = [
  {
    title: 'Radical Transparency',
    desc: 'We believe trust is built in the open. From NGO registrations to volunteer hour tracking and fund allocations, every action has verifiable accountability.',
  },
  {
    title: 'Dignity in Service',
    desc: 'Volunteering is not charity—it is community solidarity. We treat beneficiaries and volunteers with the utmost respect and empathy.',
  },
  {
    title: 'Grassroots First',
    desc: 'The most impactful changemakers often operate in rural and semi-urban pockets without digital visibility. SevaSetu bridges this technological divide.',
  },
];

export default function AboutPage() {
  const [activeTab, setActiveTab] = useState('mission');
  const [dbStatus, setDbStatus] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    authAPI.getDbStatus().then((res) => setDbStatus(res.data)).catch(() => {});
  }, []);

  const copyWorkbenchSql = () => {
    navigator.clipboard.writeText('mysql -u root -p < database.sql');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const dbTables = [
    {
      name: 'users',
      role: 'Core identity and authentication store',
      fields: 'id, name, email, password, phone, location, profile_image, role, created_at',
      keys: 'PK: id | Unique: email | Roles: user, volunteer, ngo, admin',
    },
    {
      name: 'ngos',
      role: 'Verified social impact organizations',
      fields: 'id, user_id, name, email, phone, category, description, address, logo, registration_number, verification_status, created_at',
      keys: 'PK: id | FK: user_id -> users(id) | Unique: registration_number',
    },
    {
      name: 'volunteers',
      role: 'Skill-indexed volunteer directory',
      fields: 'id, user_id, skills, interests, availability, location, created_at',
      keys: 'PK: id | FK: user_id -> users(id)',
    },
    {
      name: 'events',
      role: 'Community drives, relief camps & workshops',
      fields: 'id, ngo_id, title, description, category, date, time, location, image, required_volunteers, status, created_at',
      keys: 'PK: id | FK: ngo_id -> ngos(id) | Status: pending, approved, rejected, completed',
    },
    {
      name: 'volunteer_applications',
      role: 'Volunteer service enrollment ledger',
      fields: 'id, volunteer_id, event_id, status, applied_at',
      keys: 'PK: id | FK: volunteer_id -> volunteers(id), event_id -> events(id) | Status: pending, accepted, rejected, completed',
    },
    {
      name: 'donations',
      role: 'Direct NGO philanthropic contribution records',
      fields: 'id, user_id, ngo_id, amount, status, donated_at',
      keys: 'PK: id | FK: user_id -> users(id), ngo_id -> ngos(id)',
    },
    {
      name: 'feedback',
      role: 'Citizen & volunteer ratings and testimonials',
      fields: 'id, user_id, ngo_id, event_id, rating, comment, created_at',
      keys: 'PK: id | FK: user_id -> users(id), ngo_id -> ngos(id), event_id -> events(id) | Check: rating 1-5',
    },
    {
      name: 'certificates',
      role: 'Official verifiable community service honors',
      fields: 'id, volunteer_id, event_id, certificate_number, issued_date',
      keys: 'PK: id | FK: volunteer_id -> volunteers(id), event_id -> events(id) | Unique: certificate_number',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* Header Banner */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          About SevaSetu
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
          Bridging the Gap Between Kind Hearts & Real Community Needs
        </h1>
        <p className="text-sm sm:text-base text-slate-500 leading-relaxed">
          SevaSetu was founded with a single mission: to empower India's non-profit sector with trust, technology, and transparent civic participation.
        </p>

        {/* Tab Toggle: Mission vs Technical Architecture */}
        <div className="inline-flex p-1 bg-slate-100 rounded-2xl mt-4">
          <button
            onClick={() => setActiveTab('mission')}
            className={`px-5 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'mission'
                ? 'bg-white text-emerald-800 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Mission & Story
          </button>
          <button
            onClick={() => setActiveTab('architecture')}
            className={`px-5 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'architecture'
                ? 'bg-white text-emerald-800 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            System & MySQL Architecture
          </button>
        </div>
      </div>

      {activeTab === 'mission' ? (
        <div className="space-y-16">
          {/* Vision & Mission Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white rounded-3xl border border-slate-200/80 p-8 shadow-xs space-y-4 relative overflow-hidden">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Target className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900">Our Mission</h2>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                To build an accessible, corruption-resistant digital bridge where verified grassroots NGOs, passionate volunteers, civic donors, and community administrators work in tandem to eliminate poverty, uplift education, and protect our environment.
              </p>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200/80 p-8 shadow-xs space-y-4 relative overflow-hidden">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Eye className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900">Our Vision</h2>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                A nation where every citizen has seamless access to verified volunteer opportunities, where no legitimate non-profit struggles for hands or resources, and where social impact is transparently measured and celebrated.
              </p>
            </div>
          </div>

          {/* 4 Impact Pillars */}
          <div className="space-y-8">
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <span className="text-xs font-bold uppercase tracking-widest text-emerald-600">
                Foundational Principles
              </span>
              <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                The Four Pillars of SevaSetu
              </h2>
              <p className="text-sm text-slate-500">
                How our unified platform brings structure and accountability to social welfare.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {PILLARS.map((p) => {
                const Icon = p.icon;
                return (
                  <div
                    key={p.title}
                    className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-3 flex flex-col justify-between hover:shadow-md transition-shadow"
                  >
                    <div className="space-y-3">
                      <div className={`w-12 h-12 rounded-2xl ${p.color} flex items-center justify-center`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <h3 className="text-base font-bold text-slate-900 leading-snug">{p.title}</h3>
                      <p className="text-xs text-slate-600 leading-relaxed">{p.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Core Values */}
          <div className="bg-slate-50 rounded-3xl border border-slate-200/80 p-8 sm:p-12 space-y-8">
            <div className="max-w-2xl space-y-2">
              <span className="text-xs font-bold uppercase tracking-widest text-emerald-600">
                Our Ethics
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Core Values Guiding Every Feature
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {VALUES.map((v) => (
                <div key={v.title} className="bg-white rounded-2xl p-6 border border-slate-200/80 space-y-2">
                  <h3 className="text-sm font-bold text-slate-900">{v.title}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">{v.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* CTA Row */}
          <div className="text-center py-6 space-y-4">
            <h3 className="text-xl font-bold text-slate-900">Be Part of the Solution</h3>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Link
                to="/ngos"
                className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-sm transition-all"
              >
                Explore NGOs
              </Link>
              <Link
                to="/events"
                className="px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-sm transition-all"
              >
                Find Volunteer Drives
              </Link>
              <Link
                to="/contact"
                className="px-6 py-3 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 font-bold text-xs transition-all"
              >
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      ) : (
        /* Technical Architecture Tab */
        <div className="space-y-12">
          {/* Database Connection Status Card */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
                  <Database className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Database Engine: MySQL 8.0+ / mysql2
                  </h3>
                  <p className="text-xs text-slate-500">
                    Database Name: <code className="font-mono text-emerald-600 font-semibold">sevasetu</code> (8 Normalized Tables)
                  </p>
                </div>
              </div>

              <Badge variant={dbStatus?.isRealMysql ? 'green' : 'blue'} size="md">
                {dbStatus?.isRealMysql ? 'Active MySQL Daemon Connected' : 'Schema & Mock State Synchronized'}
              </Badge>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              {dbStatus?.message ||
                'Configured via environment variables (DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME). All SQL operations strictly use parameterized queries to prevent SQL injection.'}
            </p>

            {/* Workbench Import Commands */}
            <div className="bg-slate-900 text-slate-200 rounded-2xl p-4 text-xs font-mono space-y-2">
              <div className="flex items-center justify-between text-slate-400 pb-2 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-emerald-400" />
                  <span>MySQL Workbench & CLI Import Command</span>
                </div>
                <button
                  onClick={copyWorkbenchSql}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-[11px] text-slate-300 transition-colors"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied!' : 'Copy Command'}</span>
                </button>
              </div>
              <div className="pt-1 text-emerald-300">$ mysql -u root -p &lt; database.sql</div>
              <p className="text-[11px] text-slate-400 font-sans">
                File available at root: <code className="text-amber-300">/database.sql</code> and <code className="text-amber-300">/sevasetu_workbench.sql</code> for direct import in MySQL Workbench.
              </p>
            </div>
          </div>

          {/* The 8 Core Relational Tables */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-900">The 8 Relational Schema Tables</h2>
                <p className="text-xs text-slate-500">
                  Normalized entity relationships with foreign keys, indexes, and timestamps
                </p>
              </div>
              <span className="px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs font-bold border border-emerald-200">
                8 / 8 Tables Implemented
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {dbTables.map((t, idx) => (
                <div
                  key={t.name}
                  className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:border-emerald-300 transition-colors space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-lg bg-slate-100 text-slate-700 text-xs font-mono font-bold flex items-center justify-center">
                        {idx + 1}
                      </span>
                      <h3 className="font-mono text-sm font-bold text-slate-900">{t.name}</h3>
                    </div>
                    <Badge variant="blue" size="sm">
                      Table
                    </Badge>
                  </div>

                  <p className="text-xs text-slate-600">{t.role}</p>

                  <div className="bg-slate-50 p-2.5 rounded-xl text-[11px] font-mono text-slate-700 space-y-1">
                    <div>
                      <span className="text-slate-400">Fields: </span>
                      <span className="text-slate-900">{t.fields}</span>
                    </div>
                    <div className="text-emerald-700 font-semibold">
                      <span className="text-slate-400">Keys: </span>
                      {t.keys}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Security Constraints Card */}
          <div className="bg-emerald-50/50 rounded-3xl p-6 border border-emerald-200 space-y-3">
            <h3 className="text-sm font-bold text-emerald-950 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-700" />
              Security Constraints Enforced
            </h3>
            <ul className="text-xs text-emerald-900 space-y-2 list-disc list-inside leading-relaxed">
              <li>
                <strong>Admin Registration Blocked:</strong> The public registration endpoint returns an HTTP 403 Forbidden error if role <code className="font-mono">admin</code> is requested. Administrators are pre-provisioned via database seeding or elevated access.
              </li>
              <li>
                <strong>SQL Injection Protection:</strong> All database operations strictly use parameterized queries (<code className="font-mono">?</code> placeholders via <code className="font-mono">mysql2/promise</code>). No raw SQL string interpolation is ever performed.
              </li>
              <li>
                <strong>Data Integrity:</strong> Foreign keys use <code className="font-mono">ON DELETE CASCADE</code> for dependent entities (e.g. volunteer applications, event registrations, certificates) and <code className="font-mono">ON DELETE SET NULL</code> for financial donations to preserve accounting ledgers.
              </li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
