// =======================================================
// Admin User Management Page (/admin/users)
// Features:
// - View users with role, contact, location & status badges
// - Search users by name, email, phone, location
// - Filter by role (user, volunteer, ngo, admin) & status (active, inactive)
// - View user details modal with full linked profile & activity
// - Activate/Deactivate users with confirmation modal
// - Delete user with confirmation modal
// =======================================================

import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api.js';
import LoadingSpinner from '../../components/common/LoadingSpinner.jsx';
import Modal from '../../components/common/Modal.jsx';
import ConfirmationModal from '../../components/common/ConfirmationModal.jsx';
import {
  Users,
  Search,
  Filter,
  Eye,
  Power,
  Trash2,
  Shield,
  HandHeart,
  Building2,
  User,
  CheckCircle2,
  XCircle,
  Calendar,
  Mail,
  Phone,
  MapPin,
  Heart,
  Award,
} from 'lucide-react';

export default function AdminUsersPage() {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');

  // Details Modal State
  const [selectedUser, setSelectedUser] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);

  // Confirmation Modal State
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    confirmText: 'Confirm',
    type: 'danger',
    onConfirm: () => {},
  });
  const [actionLoading, setActionLoading] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await adminAPI.getUsers({
        search: searchTerm || undefined,
        role: selectedRole !== 'All' ? selectedRole : undefined,
        status: selectedStatus !== 'All' ? selectedStatus : undefined,
      });
      if (res.data?.success) {
        setUsers(res.data.data || []);
      }
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [selectedRole, selectedStatus]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchUsers();
  };

  const handleViewDetails = async (userId) => {
    setDetailsLoading(true);
    setDetailsModalOpen(true);
    try {
      const res = await adminAPI.getUserById(userId);
      if (res.data?.success) {
        setSelectedUser(res.data.data);
      }
    } catch (err) {
      alert(err.message || 'Failed to load user details');
      setDetailsModalOpen(false);
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleToggleStatus = (user) => {
    const nextStatus = user.status === 'inactive' ? 'active' : 'inactive';
    const isDeactivating = nextStatus === 'inactive';

    setConfirmModal({
      isOpen: true,
      title: isDeactivating ? 'Deactivate User Account' : 'Activate User Account',
      message: isDeactivating
        ? `Are you sure you want to deactivate the account for "${user.name}" (${user.email})? The user will be restricted from accessing features.`
        : `Are you sure you want to activate the account for "${user.name}"? Full system permissions will be restored.`,
      confirmText: isDeactivating ? 'Deactivate Account' : 'Activate Account',
      type: isDeactivating ? 'warning' : 'primary',
      onConfirm: async () => {
        setActionLoading(true);
        try {
          await adminAPI.updateUserStatus(user.id, nextStatus);
          setConfirmModal((prev) => ({ ...prev, isOpen: false }));
          await fetchUsers();
          if (selectedUser && selectedUser.id === user.id) {
            setSelectedUser((prev) => ({ ...prev, status: nextStatus }));
          }
        } catch (err) {
          alert(err.message || 'Failed to update user status');
        } finally {
          setActionLoading(false);
        }
      },
    });
  };

  const handleDeleteUser = (user) => {
    setConfirmModal({
      isOpen: true,
      title: 'Delete User Account',
      message: `Are you sure you want to permanently delete user "${user.name}" (${user.email})? All associated records in MySQL will be affected. This action cannot be undone.`,
      confirmText: 'Delete Permanently',
      type: 'danger',
      onConfirm: async () => {
        setActionLoading(true);
        try {
          await adminAPI.deleteUser(user.id);
          setConfirmModal((prev) => ({ ...prev, isOpen: false }));
          await fetchUsers();
          if (detailsModalOpen) setDetailsModalOpen(false);
        } catch (err) {
          alert(err.message || 'Failed to delete user');
        } finally {
          setActionLoading(false);
        }
      },
    });
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case 'admin':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200">
            <Shield className="w-3 h-3" /> Admin
          </span>
        );
      case 'ngo':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
            <Building2 className="w-3 h-3" /> NGO
          </span>
        );
      case 'volunteer':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <HandHeart className="w-3 h-3" /> Volunteer
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            <User className="w-3 h-3" /> Citizen
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header / Filter Toolbar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Users className="w-5 h-5 text-emerald-600" />
              User Directory & Account Controls
            </h2>
            <p className="text-xs text-slate-500">
              Manage all registered citizens, volunteers, NGO organizers, and administrators.
            </p>
          </div>
          <span className="text-xs font-semibold px-3 py-1 bg-slate-100 text-slate-700 rounded-lg self-start sm:self-auto">
            {users.length} Users Listed
          </span>
        </div>

        {/* Search & Filter Controls */}
        <div className="flex flex-col md:flex-row gap-3">
          <form onSubmit={handleSearchSubmit} className="flex-1 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by name, email, phone, or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-24 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-slate-50/50"
            />
            <button
              type="submit"
              className="absolute right-1.5 top-1/2 -translate-y-1/2 px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-medium cursor-pointer"
            >
              Search
            </button>
          </form>

          <div className="flex items-center gap-2.5">
            {/* Role Filter */}
            <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 text-xs text-slate-600">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <span>Role:</span>
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="bg-transparent font-medium text-slate-800 focus:outline-none cursor-pointer"
              >
                <option value="All">All Roles</option>
                <option value="user">Citizen (User)</option>
                <option value="volunteer">Volunteer</option>
                <option value="ngo">NGO Organizer</option>
                <option value="admin">Administrator</option>
              </select>
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 text-xs text-slate-600">
              <span>Status:</span>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="bg-transparent font-medium text-slate-800 focus:outline-none cursor-pointer"
              >
                <option value="All">All Statuses</option>
                <option value="active">Active Only</option>
                <option value="inactive">Inactive Only</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-20 flex justify-center">
            <LoadingSpinner />
          </div>
        ) : users.length === 0 ? (
          <div className="py-16 text-center text-slate-500">
            <Users className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-700">No users found</p>
            <p className="text-xs text-slate-400 mt-1">Try adjusting your search criteria or role filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/75 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-4 sm:px-6">User / Contact</th>
                  <th className="py-3.5 px-4">Role</th>
                  <th className="py-3.5 px-4">Location</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Joined Date</th>
                  <th className="py-3.5 px-4 sm:px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {users.map((u) => {
                  const isActive = (u.status || 'active') === 'active';
                  return (
                    <tr key={u.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4 sm:px-6">
                        <div className="flex items-center gap-3">
                          <img
                            src={u.profile_image || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'}
                            alt={u.name}
                            className="w-9 h-9 rounded-full object-cover border border-slate-200"
                          />
                          <div>
                            <p className="font-semibold text-slate-900">{u.name}</p>
                            <p className="text-[11px] text-slate-500">{u.email}</p>
                            {u.phone && <p className="text-[11px] text-slate-400">{u.phone}</p>}
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">{getRoleBadge(u.role)}</td>
                      <td className="py-3.5 px-4 text-slate-600">{u.location || 'India'}</td>
                      <td className="py-3.5 px-4">
                        {isActive ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3" /> Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                            <XCircle className="w-3 h-3" /> Inactive
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-slate-500">
                        {u.created_at ? new Date(u.created_at).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="py-3.5 px-4 sm:px-6 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* View Details */}
                          <button
                            onClick={() => handleViewDetails(u.id)}
                            title="View Full Profile Details"
                            className="p-1.5 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* Activate / Deactivate */}
                          <button
                            onClick={() => handleToggleStatus(u)}
                            title={isActive ? 'Deactivate User' : 'Activate User'}
                            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                              isActive
                                ? 'text-amber-600 hover:bg-amber-50'
                                : 'text-emerald-600 hover:bg-emerald-50'
                            }`}
                          >
                            <Power className="w-4 h-4" />
                          </button>

                          {/* Delete (Cannot delete self if admin) */}
                          <button
                            onClick={() => handleDeleteUser(u)}
                            title="Delete User"
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* User Details Modal */}
      <Modal
        isOpen={detailsModalOpen}
        onClose={() => setDetailsModalOpen(false)}
        title={selectedUser ? `User Profile: ${selectedUser.name}` : 'User Details'}
        maxWidth="max-w-2xl"
      >
        {detailsLoading || !selectedUser ? (
          <div className="py-12 flex justify-center">
            <LoadingSpinner />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Header info */}
            <div className="flex items-start gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100">
              <img
                src={selectedUser.profile_image || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'}
                alt={selectedUser.name}
                className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-xs"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-base font-bold text-slate-900">{selectedUser.name}</h3>
                  <div className="flex items-center gap-2">
                    {getRoleBadge(selectedUser.role)}
                    <span
                      className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${
                        selectedUser.status === 'active'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-rose-50 text-rose-700 border-rose-200'
                      }`}
                    >
                      {selectedUser.status === 'active' ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3 text-xs text-slate-600">
                  <div className="flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span>{selectedUser.email}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>{selectedUser.phone || 'Phone not provided'}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>{selectedUser.location || 'India'}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>Joined: {new Date(selectedUser.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Role Specific Records */}
            {selectedUser.volunteer && (
              <div className="p-4 rounded-xl border border-emerald-100 bg-emerald-50/40 space-y-2">
                <h4 className="text-xs font-bold text-emerald-900 uppercase tracking-wider flex items-center gap-1.5">
                  <HandHeart className="w-4 h-4 text-emerald-600" /> Volunteer Credentials
                </h4>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-slate-500 font-medium">Skills:</span>
                    <p className="text-slate-900 font-semibold">{selectedUser.volunteer.skills || 'General Outreach'}</p>
                  </div>
                  <div>
                    <span className="text-slate-500 font-medium">Availability:</span>
                    <p className="text-slate-900 font-semibold">{selectedUser.volunteer.availability || 'Flexible'}</p>
                  </div>
                </div>
              </div>
            )}

            {selectedUser.ngo && (
              <div className="p-4 rounded-xl border border-indigo-100 bg-indigo-50/40 space-y-2">
                <h4 className="text-xs font-bold text-indigo-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-indigo-600" /> Associated NGO Organization
                </h4>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-slate-500 font-medium">NGO Name:</span>
                    <p className="text-slate-900 font-semibold">{selectedUser.ngo.name}</p>
                  </div>
                  <div>
                    <span className="text-slate-500 font-medium">Registration No:</span>
                    <p className="text-slate-900 font-semibold">{selectedUser.ngo.registration_number}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Donation Contributions */}
            <div>
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Heart className="w-4 h-4 text-rose-500" />
                Donations Made ({selectedUser.donations?.length || 0})
              </h4>
              {selectedUser.donations && selectedUser.donations.length > 0 ? (
                <div className="space-y-1.5 max-h-36 overflow-y-auto">
                  {selectedUser.donations.map((d) => (
                    <div
                      key={d.id}
                      className="p-2.5 rounded-lg border border-slate-100 bg-slate-50 text-xs flex items-center justify-between"
                    >
                      <span className="font-semibold text-slate-800">₹{parseFloat(d.amount).toLocaleString()}</span>
                      <span className="text-slate-500">{new Date(d.donated_at).toLocaleDateString()}</span>
                      <span className="text-emerald-600 font-medium capitalize">{d.status}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic">No donations registered under this account.</p>
              )}
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => handleToggleStatus(selectedUser)}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold cursor-pointer ${
                  selectedUser.status === 'active'
                    ? 'bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200'
                    : 'bg-emerald-600 text-white hover:bg-emerald-700'
                }`}
              >
                {selectedUser.status === 'active' ? 'Deactivate Account' : 'Activate Account'}
              </button>

              <button
                type="button"
                onClick={() => setDetailsModalOpen(false)}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmText={confirmModal.confirmText}
        type={confirmModal.type}
        isLoading={actionLoading}
      />
    </div>
  );
}
