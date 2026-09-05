// =======================================================
// VolunteersPage Component
// =======================================================

import React, { useState, useEffect } from 'react';
import { volunteersAPI } from '../services/api.js';
import OpportunityCard from '../components/volunteers/OpportunityCard.jsx';
import LoadingSpinner from '../components/common/LoadingSpinner.jsx';
import { Search, HeartHandshake, MapPin } from 'lucide-react';

export default function VolunteersPage() {
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedMode, setSelectedMode] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const categories = ['All', 'Education', 'Healthcare', 'Hunger Relief', 'Awareness', 'Disaster Support'];
  const modes = ['All', 'on-site', 'remote', 'hybrid'];

  const fetchOpportunities = async () => {
    setLoading(true);
    try {
      const res = await volunteersAPI.getOpportunities({
        category: selectedCategory !== 'All' ? selectedCategory : undefined,
        mode: selectedMode !== 'All' ? selectedMode : undefined,
        search: searchQuery || undefined,
      });
      setOpportunities(res.data?.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOpportunities();
  }, [selectedCategory, selectedMode]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchOpportunities();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <span className="text-xs font-bold text-orange-600 uppercase tracking-widest">
          Community Engagement
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Find Volunteer Opportunities & Drives
        </h1>
        <p className="text-sm text-slate-500 leading-relaxed">
          Lend your time, mentor a student, support healthcare camps, or help remotely with social media storytelling. Earn certified volunteer service hours.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            {/* Category selection */}
            <div className="flex flex-wrap gap-1.5">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                    selectedCategory === cat
                      ? 'bg-orange-500 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Mode selection */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs">
              {modes.map((m) => (
                <button
                  key={m}
                  onClick={() => setSelectedMode(m)}
                  className={`px-2.5 py-1 rounded-lg capitalize font-medium transition-all ${
                    selectedMode === m ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'text-slate-500'
                  }`}
                >
                  {m === 'on-site' ? 'On-Site' : m}
                </button>
              ))}
            </div>
          </div>

          {/* Search Input */}
          <form onSubmit={handleSearchSubmit} className="relative w-full lg:w-72">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title or skills..."
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          </form>
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <LoadingSpinner text="Fetching opportunities from MySQL..." />
      ) : opportunities.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 text-slate-500 space-y-3">
          <HeartHandshake className="w-12 h-12 text-slate-300 mx-auto" />
          <p className="text-base font-bold text-slate-800">No volunteer opportunities found</p>
          <p className="text-xs text-slate-500">
            Try resetting your filters or switching from on-site to remote.
          </p>
          <button
            onClick={() => {
              setSelectedCategory('All');
              setSelectedMode('All');
              setSearchQuery('');
            }}
            className="px-4 py-2 bg-orange-500 text-white text-xs font-semibold rounded-xl"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {opportunities.map((opp) => (
            <OpportunityCard key={opp.id} opportunity={opp} onUpdated={fetchOpportunities} />
          ))}
        </div>
      )}
    </div>
  );
}
