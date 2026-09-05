import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useNavigate } from 'react-router-dom';
import { User, HeartHandshake, Building2, ShieldCheck, Layers } from 'lucide-react';

export default function RoleSwitcherBar() {
  const { user, demoLogin, getRoleDashboardPath } = useAuth();
  const [switching, setSwitching] = useState(false);
  const navigate = useNavigate();

  const handleSwitchRole = async (targetRole) => {
    if (user?.role === targetRole) return;
    setSwitching(true);
    try {
      await demoLogin(targetRole);
      navigate(getRoleDashboardPath(targetRole));
    } catch (err) {
      console.error('Failed to switch role:', err);
    } finally {
      setSwitching(false);
    }
  };

  const roles = [
    { role: 'user', label: 'User / Citizen', path: '/user/dashboard', icon: User, color: 'text-emerald-700' },
    { role: 'volunteer', label: 'Volunteer', path: '/volunteer/dashboard', icon: HeartHandshake, color: 'text-orange-700' },
    { role: 'ngo', label: 'NGO Lead', path: '/ngo/dashboard', icon: Building2, color: 'text-blue-700' },
    { role: 'admin', label: 'System Admin', path: '/admin/dashboard', icon: ShieldCheck, color: 'text-purple-700' },
  ];

  return (
    <div className="bg-white rounded-2xl p-3.5 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
      <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
        <Layers className="w-4 h-4 text-emerald-600" />
        <span>Platform Role Switcher:</span>
        <span className="text-[11px] text-slate-400 font-normal">
          (Seamlessly test all four role-based portals)
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
        {roles.map((item) => {
          const Icon = item.icon;
          const isActive = user?.role === item.role;
          return (
            <button
              key={item.role}
              id={`switch-to-${item.role}-btn`}
              disabled={switching}
              onClick={() => handleSwitchRole(item.role)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                isActive
                  ? 'bg-white text-slate-900 shadow-xs font-bold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? item.color : 'text-slate-400'}`} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
