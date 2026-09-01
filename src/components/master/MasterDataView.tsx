import React, { useState } from 'react';
import { 
  Users, 
  Plus, 
  Edit3, 
  Trash2, 
  Lock, 
  Unlock, 
  Key, 
  CalendarDays, 
  ShieldCheck, 
  Database, 
  AlertCircle, 
  CheckCircle2, 
  RefreshCw, 
  Download, 
  Upload, 
  Info,
  Layers,
  Sparkles,
  Shield,
  ArrowRight
} from 'lucide-react';
import { User, LeaveType, UserRole } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { storage } from '../../services/storage';

export const MasterDataView: React.FC = () => {
  const { currentUser, isAdmin, usersList } = useAuth();
  
  const [activeSubTab, setActiveSubTab] = useState<'employees' | 'leave_types' | 'system_database'>('employees');
  
  const [employees, setEmployees] = useState<User[]>(storage.getUsers());
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>(storage.getLeaveTypes());
  
  // Modal states for Employees
  const [showEmployeeModal, setShowEmployeeModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<User | null>(null);
  const [employeeForm, setEmployeeForm] = useState({
    id: '', // User ID (Changeable!)
    name: '',
    email: '',
    password: '',
    role: 'employee' as UserRole,
    designation: '',
    department: 'Engineering',
    phone: '',
  });

  // Modal state for Password Reset
  const [showPasswordModal, setShowPasswordModal] = useState<User | null>(null);
  const [newPasswordInput, setNewPasswordInput] = useState('');

  // Modal states for Leave Types
  const [showLeaveTypeModal, setShowLeaveTypeModal] = useState(false);
  const [editingLeaveType, setEditingLeaveType] = useState<LeaveType | null>(null);
  const [leaveTypeForm, setLeaveTypeForm] = useState({
    code: '',
    name: '',
    description: '',
    quotaDays: 10,
    isPaid: true,
    color: '#3b82f6',
  });

  // Notification message banner
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  React.useEffect(() => {
    const unsub = storage.subscribe(() => {
      setEmployees(storage.getUsers());
      setLeaveTypes(storage.getLeaveTypes());
    });
    return () => unsub();
  }, []);

  const showNotification = (type: 'success' | 'error', text: string) => {
    setFeedback({ type, text });
    setTimeout(() => setFeedback(null), 5000);
  };

  // --- EMPLOYEE HANDLERS ---
  const handleOpenCreateEmployee = () => {
    setEditingEmployee(null);
    setEmployeeForm({
      id: `EMP${100 + employees.length + 1}`,
      name: '',
      email: '',
      password: 'password123',
      role: 'employee',
      designation: '',
      department: 'Engineering',
      phone: '',
    });
    setShowEmployeeModal(true);
  };

  const handleOpenEditEmployee = (emp: User) => {
    setEditingEmployee(emp);
    setEmployeeForm({
      id: emp.id,
      name: emp.name,
      email: emp.email,
      password: emp.password,
      role: emp.role,
      designation: emp.designation,
      department: emp.department,
      phone: emp.phone || '',
    });
    setShowEmployeeModal(true);
  };

  const handleSaveEmployee = (e: React.FormEvent) => {
    e.preventDefault();

    if (!employeeForm.id.trim() || !employeeForm.name.trim() || !employeeForm.email.trim()) {
      showNotification('error', 'User ID, Name, and Email are required.');
      return;
    }

    if (editingEmployee) {
      // Update employee (with support for changing User ID)
      const res = storage.updateUser(editingEmployee.id, {
        id: employeeForm.id.trim(),
        name: employeeForm.name.trim(),
        email: employeeForm.email.trim(),
        password: employeeForm.password,
        role: employeeForm.role,
        designation: employeeForm.designation.trim(),
        department: employeeForm.department.trim(),
        phone: employeeForm.phone.trim(),
      });

      if (res.success) {
        showNotification('success', `Employee updated. ${editingEmployee.id !== employeeForm.id ? `User ID changed to ${employeeForm.id}.` : ''}`);
        setShowEmployeeModal(false);
      } else {
        showNotification('error', res.message);
      }
    } else {
      // Create new employee
      const res = storage.createUser({
        id: employeeForm.id.trim(),
        name: employeeForm.name.trim(),
        email: employeeForm.email.trim(),
        password: employeeForm.password || 'password123',
        role: employeeForm.role,
        designation: employeeForm.designation.trim() || 'Staff Member',
        department: employeeForm.department.trim() || 'General',
        phone: employeeForm.phone.trim(),
        status: 'active',
      });

      if (res.success) {
        showNotification('success', `Employee ${employeeForm.name} created with ID: ${employeeForm.id}.`);
        setShowEmployeeModal(false);
      } else {
        showNotification('error', res.message);
      }
    }
  };

  const handleToggleStatus = (userId: string) => {
    if (userId === currentUser?.id) {
      showNotification('error', 'You cannot deactivate your own active admin account.');
      return;
    }
    const res = storage.toggleUserStatus(userId);
    if (res.success) {
      showNotification('success', 'User access status updated.');
    }
  };

  const handleDeleteEmployee = (userId: string, name: string) => {
    if (userId === currentUser?.id) {
      showNotification('error', 'You cannot delete your own session account.');
      return;
    }
    if (confirm(`Are you sure you want to remove employee "${name}" (${userId})?`)) {
      const res = storage.deleteUser(userId);
      if (res.success) {
        showNotification('success', `Employee ${name} deleted.`);
      } else {
        showNotification('error', res.message);
      }
    }
  };

  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!showPasswordModal || !newPasswordInput.trim()) return;

    storage.updateUser(showPasswordModal.id, {
      password: newPasswordInput.trim(),
    });

    showNotification('success', `Password updated for ${showPasswordModal.name}.`);
    setShowPasswordModal(null);
    setNewPasswordInput('');
  };

  // --- LEAVE TYPE HANDLERS ---
  const handleOpenCreateLeaveType = () => {
    setEditingLeaveType(null);
    setLeaveTypeForm({
      code: `LT-${leaveTypes.length + 1}`,
      name: '',
      description: '',
      quotaDays: 12,
      isPaid: true,
      color: '#3b82f6',
    });
    setShowLeaveTypeModal(true);
  };

  const handleOpenEditLeaveType = (lt: LeaveType) => {
    setEditingLeaveType(lt);
    setLeaveTypeForm({
      code: lt.code,
      name: lt.name,
      description: lt.description || '',
      quotaDays: lt.quotaDays,
      isPaid: lt.isPaid,
      color: lt.color || '#3b82f6',
    });
    setShowLeaveTypeModal(true);
  };

  const handleSaveLeaveType = (e: React.FormEvent) => {
    e.preventDefault();
    if (!leaveTypeForm.code.trim() || !leaveTypeForm.name.trim()) {
      showNotification('error', 'Leave Code and Leave Type Name are required.');
      return;
    }

    if (editingLeaveType) {
      const res = storage.updateLeaveType(editingLeaveType.id, {
        code: leaveTypeForm.code.trim().toUpperCase(),
        name: leaveTypeForm.name.trim(),
        description: leaveTypeForm.description.trim(),
        quotaDays: Number(leaveTypeForm.quotaDays),
        isPaid: leaveTypeForm.isPaid,
        color: leaveTypeForm.color,
      });
      if (res.success) {
        showNotification('success', 'Leave type settings saved.');
        setShowLeaveTypeModal(false);
      } else {
        showNotification('error', res.message);
      }
    } else {
      const res = storage.createLeaveType({
        code: leaveTypeForm.code.trim().toUpperCase(),
        name: leaveTypeForm.name.trim(),
        description: leaveTypeForm.description.trim(),
        quotaDays: Number(leaveTypeForm.quotaDays),
        isPaid: leaveTypeForm.isPaid,
        color: leaveTypeForm.color,
        isActive: true,
      });
      if (res.success) {
        showNotification('success', 'New leave category created.');
        setShowLeaveTypeModal(false);
      } else {
        showNotification('error', res.message);
      }
    }
  };

  const handleDeleteLeaveType = (id: string, name: string) => {
    if (confirm(`Delete leave category "${name}"?`)) {
      storage.deleteLeaveType(id);
      showNotification('success', 'Leave category removed.');
    }
  };

  // If non-admin somehow accesses this view, display restriction gate
  if (!isAdmin) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-12 text-center max-w-lg mx-auto shadow-xs">
        <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 mx-auto flex items-center justify-center mb-3">
          <Lock className="w-6 h-6" />
        </div>
        <h2 className="text-base font-bold text-slate-900">Access Restricted</h2>
        <p className="text-xs text-slate-600 mt-1">
          Master Data management is restricted to authorized Administrators only. Regular employees can access only their own user-wise task and profile data.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* High Density Header */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-lg font-bold text-slate-900 tracking-tight">
              Master Data & Multi-Level Management
            </h1>
            <span className="text-[10px] font-mono font-bold bg-amber-50 text-amber-800 px-2 py-0.5 rounded border border-amber-200">
              Admin Matrix
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure employee accounts, change user IDs, toggle access restrictions, and manage leave categories.
          </p>
        </div>
      </div>

      {/* Feedback Banner */}
      {feedback && (
        <div className={`p-3.5 rounded-xl border flex items-center space-x-2.5 text-xs animate-in fade-in ${
          feedback.type === 'success' 
            ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
            : 'bg-rose-50 border-rose-200 text-rose-800'
        }`}>
          {feedback.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          )}
          <p className="font-semibold">{feedback.text}</p>
        </div>
      )}

      {/* Sub Tabs */}
      <div className="flex border-b border-slate-200 space-x-2 bg-white px-4 rounded-xl border shadow-2xs">
        <button
          onClick={() => setActiveSubTab('employees')}
          className={`py-3 px-3 text-xs font-bold border-b-2 flex items-center space-x-2 transition-colors ${
            activeSubTab === 'employees'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>A. Employees & User ID Management ({employees.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('leave_types')}
          className={`py-3 px-3 text-xs font-bold border-b-2 flex items-center space-x-2 transition-colors ${
            activeSubTab === 'leave_types'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <CalendarDays className="w-3.5 h-3.5" />
          <span>C. Leave Types Master ({leaveTypes.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('system_database')}
          className={`py-3 px-3 text-xs font-bold border-b-2 flex items-center space-x-2 transition-colors ${
            activeSubTab === 'system_database'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <Database className="w-3.5 h-3.5" />
          <span>Blank Data & Backup Snapshot</span>
        </button>
      </div>

      {/* --- SUBTAB A: EMPLOYEES & USER ID MANAGEMENT --- */}
      {activeSubTab === 'employees' && (
        <div className="space-y-4">
          
          <div className="flex justify-between items-center bg-slate-50 px-5 py-3 rounded-xl border border-slate-200">
            <div>
              <h3 className="font-bold text-slate-900 text-xs">Employee Directory & Multi-Level Credentials</h3>
              <p className="text-[10px] text-slate-500">
                User IDs can be edited/changed anytime. The system automatically preserves all historical records.
              </p>
            </div>
            <button
              id="btn-create-employee"
              onClick={handleOpenCreateEmployee}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded shadow-xs transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Create Employee</span>
            </button>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead className="sticky top-0 bg-white shadow-2xs">
                  <tr className="text-slate-400 uppercase font-bold text-[10px] border-b border-slate-100">
                    <th className="py-2.5 px-4">User ID (Changeable)</th>
                    <th className="py-2.5 px-4">Employee Name</th>
                    <th className="py-2.5 px-4">Email & Phone</th>
                    <th className="py-2.5 px-4">Department & Role</th>
                    <th className="py-2.5 px-4">Password</th>
                    <th className="py-2.5 px-4 text-center">Access Status</th>
                    <th className="py-2.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {employees.map((emp) => (
                    <tr key={emp.id} className="hover:bg-slate-50/80 transition-colors">
                      
                      {/* User ID */}
                      <td className="py-2.5 px-4">
                        <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 text-[11px]">
                          {emp.id}
                        </span>
                      </td>

                      {/* Employee Name */}
                      <td className="py-2.5 px-4 font-bold text-slate-900">
                        {emp.name}
                      </td>

                      {/* Contact */}
                      <td className="py-2.5 px-4 text-slate-600">
                        <p className="font-medium text-slate-800">{emp.email}</p>
                        {emp.phone && <p className="text-[10px] text-slate-400">{emp.phone}</p>}
                      </td>

                      {/* Department & Role */}
                      <td className="py-2.5 px-4">
                        <span className={`inline-block text-[9px] font-bold uppercase px-2 py-0.5 rounded-full mb-0.5 ${
                          emp.role === 'admin'
                            ? 'bg-amber-100 text-amber-800'
                            : emp.role === 'manager'
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {emp.role}
                        </span>
                        <p className="text-[10px] text-slate-500">{emp.department} • {emp.designation}</p>
                      </td>

                      {/* Password */}
                      <td className="py-2.5 px-4 font-mono text-slate-600">
                        <span className="bg-slate-100 px-1.5 py-0.5 rounded text-[10px]">
                          {emp.password}
                        </span>
                      </td>

                      {/* Access Status */}
                      <td className="py-2.5 px-4 text-center">
                        <button
                          onClick={() => handleToggleStatus(emp.id)}
                          className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold transition-all ${
                            emp.status === 'active'
                              ? 'bg-green-100 text-green-800 hover:bg-green-200'
                              : 'bg-red-100 text-red-800 hover:bg-red-200'
                          }`}
                          title={emp.status === 'active' ? 'Click to Restrict User Access' : 'Click to Restore User Access'}
                        >
                          {emp.status === 'active' ? (
                            <>
                              <Unlock className="w-2.5 h-2.5 text-green-600" />
                              <span>Active</span>
                            </>
                          ) : (
                            <>
                              <Lock className="w-2.5 h-2.5 text-red-600" />
                              <span>Restricted</span>
                            </>
                          )}
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="py-2.5 px-4 text-right">
                        <div className="flex items-center justify-end space-x-1">
                          <button
                            onClick={() => handleOpenEditEmployee(emp)}
                            className="p-1 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded"
                            title="Edit User Details / Change User ID"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              setShowPasswordModal(emp);
                              setNewPasswordInput(emp.password);
                            }}
                            className="p-1 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded"
                            title="Change Password"
                          >
                            <Key className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteEmployee(emp.id, emp.name)}
                            className="p-1 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded"
                            title="Delete User"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>

                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* --- SUBTAB C: LEAVE TYPES MASTER --- */}
      {activeSubTab === 'leave_types' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center bg-slate-50 px-5 py-3 rounded-xl border border-slate-200">
            <div>
              <h3 className="font-bold text-slate-900 text-xs">C. Leave Types Policy Master</h3>
              <p className="text-[10px] text-slate-500">
                Define organizational leave categories, yearly quotas, and compensation flags.
              </p>
            </div>
            <button
              onClick={handleOpenCreateLeaveType}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded shadow-xs transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Add Leave Category</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {leaveTypes.map((lt) => (
              <div
                key={lt.id}
                className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span 
                      className="font-mono text-[10px] font-bold px-2 py-0.5 rounded text-white"
                      style={{ backgroundColor: lt.color || '#3b82f6' }}
                    >
                      {lt.code}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      lt.isPaid ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-700'
                    }`}>
                      {lt.isPaid ? 'Paid Leave' : 'Unpaid'}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 mt-2">{lt.name}</h4>
                  <p className="text-xs text-slate-500 mt-0.5">{lt.description || 'No description'}</p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Annual Quota</span>
                    <span className="font-bold text-slate-900">{lt.quotaDays} Days / Year</span>
                  </div>
                  <div className="flex space-x-1">
                    <button
                      onClick={() => handleOpenEditLeaveType(lt)}
                      className="p-1 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteLeaveType(lt.id, lt.name)}
                      className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* --- SUBTAB SYSTEM DATABASE & BACKUP --- */}
      {activeSubTab === 'system_database' && (
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Database className="w-4 h-4 text-blue-600" />
              <span>System Storage, Unlimited Free Local Hosting & Blank Data Initialization</span>
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              This system is fully self-contained with persistent local storage. You can back up your entire system snapshot to a single portable JSON file, initialize blank data for a clean deployment, or reload demo datasets at any time.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                <h4 className="font-bold text-xs text-slate-900">1. Export JSON Snapshot</h4>
                <p className="text-[11px] text-slate-500">Download complete employees, tasks, leave types, and access logs.</p>
                <button
                  onClick={() => {
                    const json = storage.exportDatabaseJSON();
                    const blob = new Blob([json], { type: 'application/json' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `employee_mgmt_backup_${new Date().toISOString().slice(0, 10)}.json`;
                    a.click();
                    URL.revokeObjectURL(url);
                    showNotification('success', 'Backup downloaded.');
                  }}
                  className="w-full py-1.5 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-bold transition-colors inline-flex items-center justify-center gap-1"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Backup JSON</span>
                </button>
              </div>

              <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/50 space-y-2">
                <h4 className="font-bold text-xs text-amber-900">2. Initialize Blank Data</h4>
                <p className="text-[11px] text-amber-800">Clear all sample tasks and leave records, leaving only clean Admin master credentials.</p>
                <button
                  onClick={() => {
                    if (confirm('Initialize clean database with blank task and leave data?')) {
                      storage.resetToBlankState();
                      showNotification('success', 'System initialized with blank dataset.');
                    }
                  }}
                  className="w-full py-1.5 px-3 bg-amber-600 hover:bg-amber-700 text-white rounded text-xs font-bold transition-colors"
                >
                  Clear to Blank State
                </button>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                <h4 className="font-bold text-xs text-slate-900">3. Reload Sample Dataset</h4>
                <p className="text-[11px] text-slate-500">Repopulate standard sample employees, multi-department tasks, and leave logs.</p>
                <button
                  onClick={() => {
                    if (confirm('Reload sample multi-department dataset?')) {
                      storage.resetToInitialSample();
                      showNotification('success', 'Sample dataset loaded.');
                    }
                  }}
                  className="w-full py-1.5 px-3 bg-slate-900 hover:bg-slate-800 text-white rounded text-xs font-bold transition-colors"
                >
                  Reload Sample Data
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL: CREATE / EDIT EMPLOYEE --- */}
      {showEmployeeModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <h3 className="text-sm font-bold text-slate-900">
                {editingEmployee ? `Edit Employee (${editingEmployee.name})` : 'Create New Employee'}
              </h3>
              <button
                onClick={() => setShowEmployeeModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEmployee} className="space-y-3 text-xs">
              <div className="p-3 bg-blue-50/70 rounded-lg border border-blue-200">
                <label className="block text-[10px] font-bold text-blue-900 uppercase tracking-wider mb-1">
                  User ID (Changeable & Unique) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. EMP005 or JDOE"
                  value={employeeForm.id}
                  onChange={(e) => setEmployeeForm({ ...employeeForm, id: e.target.value.toUpperCase() })}
                  className="w-full px-3 py-1.5 border border-blue-300 rounded font-mono font-bold text-xs bg-white focus:ring-1 focus:ring-blue-500 outline-none"
                />
                <span className="text-[10px] text-blue-700 mt-1 block">
                  Employees use this User ID to log in to their isolated private view.
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sarah Connor"
                    value={employeeForm.name}
                    onChange={(e) => setEmployeeForm({ ...employeeForm, name: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Official Email *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="user@company.com"
                    value={employeeForm.email}
                    onChange={(e) => setEmployeeForm({ ...employeeForm, email: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    System Password *
                  </label>
                  <input
                    type="text"
                    required
                    value={employeeForm.password}
                    onChange={(e) => setEmployeeForm({ ...employeeForm, password: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs font-mono focus:ring-1 focus:ring-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Access Role Level *
                  </label>
                  <select
                    value={employeeForm.role}
                    onChange={(e) => setEmployeeForm({ ...employeeForm, role: e.target.value as UserRole })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-blue-500 bg-white outline-none"
                  >
                    <option value="employee">Employee (User-Wise Restricted)</option>
                    <option value="manager">Manager (Delegated View)</option>
                    <option value="admin">Admin (All Access & Control)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Department
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Engineering"
                    value={employeeForm.department}
                    onChange={(e) => setEmployeeForm({ ...employeeForm, department: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Designation
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Senior Architect"
                    value={employeeForm.designation}
                    onChange={(e) => setEmployeeForm({ ...employeeForm, designation: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowEmployeeModal(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded shadow-xs"
                >
                  Save Employee Master
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL: PASSWORD RESET --- */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <h3 className="text-sm font-bold text-slate-900">Change Password</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Set new credentials for <strong>{showPasswordModal.name}</strong> ({showPasswordModal.id})
            </p>

            <form onSubmit={handleResetPassword} className="mt-4 space-y-3 text-xs">
              <div>
                <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  New Password *
                </label>
                <input
                  type="text"
                  required
                  value={newPasswordInput}
                  onChange={(e) => setNewPasswordInput(e.target.value)}
                  placeholder="Enter new password..."
                  className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs font-mono focus:ring-1 focus:ring-blue-500 outline-none"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(null)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded shadow-xs"
                >
                  Update Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL: CREATE / EDIT LEAVE TYPE --- */}
      {showLeaveTypeModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <h3 className="text-sm font-bold text-slate-900">
              {editingLeaveType ? `Edit Leave Type (${editingLeaveType.name})` : 'Create Leave Category'}
            </h3>

            <form onSubmit={handleSaveLeaveType} className="mt-4 space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Code *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. AL"
                    value={leaveTypeForm.code}
                    onChange={(e) => setLeaveTypeForm({ ...leaveTypeForm, code: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded font-mono text-xs focus:ring-1 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Annual Quota (Days) *
                  </label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={leaveTypeForm.quotaDays}
                    onChange={(e) => setLeaveTypeForm({ ...leaveTypeForm, quotaDays: Number(e.target.value) })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Leave Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Annual Vacation"
                  value={leaveTypeForm.name}
                  onChange={(e) => setLeaveTypeForm({ ...leaveTypeForm, name: e.target.value })}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-blue-500 outline-none"
                />
              </div>

              <div className="flex items-center space-x-2 pt-1">
                <input
                  type="checkbox"
                  id="isPaid"
                  checked={leaveTypeForm.isPaid}
                  onChange={(e) => setLeaveTypeForm({ ...leaveTypeForm, isPaid: e.target.checked })}
                  className="w-4 h-4 rounded text-blue-600"
                />
                <label htmlFor="isPaid" className="text-xs font-semibold text-slate-700">
                  Paid Time-Off (Salary Retained)
                </label>
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowLeaveTypeModal(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded shadow-xs"
                >
                  Save Leave Type
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
