import React from 'react';
import AdminPanel from '../components/panels/AdminPanel.jsx';
import RoleSwitcherBar from '../components/common/RoleSwitcherBar.jsx';

export default function AdminDashboardPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      <RoleSwitcherBar />
      <AdminPanel />
    </div>
  );
}
