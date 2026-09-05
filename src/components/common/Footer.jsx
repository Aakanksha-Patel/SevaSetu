// =======================================================
// Footer Component
// =======================================================

import React from 'react';
import { Link } from 'react-router-dom';
import { HeartHandshake, Database, ShieldCheck, Heart, Users, Sparkles } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800 pt-12 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          {/* Col 1: Brand & Mission */}
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center text-white">
                <HeartHandshake className="w-5 h-5" />
              </div>
              <span className="text-xl font-bold text-white tracking-tight">
                Seva<span className="text-emerald-400">Setu</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Empowering communities by connecting citizens, passionate volunteers, grassroots NGOs, and administrators in a single unified impact ecosystem.
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-400">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Full-Stack Social Impact Platform</span>
            </div>
          </div>

          {/* Col 2: Four Role Portals */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">
              Role-Based Panels
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <Link to="/login" className="hover:text-emerald-400 transition-colors flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-emerald-500" />
                  User Portal (Donations & Help)
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-emerald-400 transition-colors flex items-center gap-1.5">
                  <Heart className="w-3.5 h-3.5 text-orange-500" />
                  Volunteer Portal (Drives & Hours)
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-emerald-400 transition-colors flex items-center gap-1.5">
                  <HeartHandshake className="w-3.5 h-3.5 text-blue-500" />
                  NGO Portal (Campaigns & Drives)
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-emerald-400 transition-colors flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-purple-500" />
                  Admin Portal (Verification & Metrics)
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Quick Navigation */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">
              Platform Links
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <Link to="/" className="hover:text-emerald-400 transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/ngos" className="hover:text-emerald-400 transition-colors">
                  Explore NGOs Directory
                </Link>
              </li>
              <li>
                <Link to="/events" className="hover:text-emerald-400 transition-colors">
                  Upcoming Volunteer Events
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-emerald-400 transition-colors">
                  About SevaSetu
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-emerald-400 transition-colors">
                  Contact & Support
                </Link>
              </li>
              <li>
                <Link to="/help" className="hover:text-emerald-400 transition-colors">
                  Emergency Help Desk
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Technology Stack */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5 text-emerald-400" />
              Technology Stack
            </h4>
            <div className="flex flex-wrap gap-1.5 text-[11px]">
              <span className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700">React.js</span>
              <span className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700">JavaScript / JSX</span>
              <span className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700">Tailwind CSS</span>
              <span className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700">Node.js</span>
              <span className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700">Express.js</span>
              <span className="bg-emerald-950 text-emerald-300 px-2 py-0.5 rounded border border-emerald-800 font-medium">MySQL + mysql2</span>
              <span className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700">JWT + bcryptjs</span>
              <span className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700">Axios</span>
              <span className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700">Recharts</span>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} SevaSetu Social-Impact Platform. Student Project MVP.</p>
          <div className="flex items-center gap-4 text-slate-400">
            <span>MySQL Schema: 9 Relational Tables</span>
            <span>•</span>
            <span>REST API Backend</span>
            <span>•</span>
            <span>Pure JavaScript</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
