import React from 'react';
import VolunteerPanel from '../components/panels/VolunteerPanel.jsx';
import RoleSwitcherBar from '../components/common/RoleSwitcherBar.jsx';

export default function VolunteerDashboardPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      <RoleSwitcherBar />
      <VolunteerPanel />
    </div>
  );
}
