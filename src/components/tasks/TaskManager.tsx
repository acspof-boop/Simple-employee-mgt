import React, { useState, useMemo } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Clock, 
  Calendar, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRightLeft, 
  User, 
  Tag, 
  CheckSquare, 
  FileText, 
  ChevronRight,
  MoreVertical,
  History,
  Sparkles,
  Info,
  CalendarCheck,
  Timer,
  PlayCircle,
  ExternalLink,
  Shield,
  Layers,
  ArrowUpRight,
  TrendingUp,
  AlertTriangle,
  Zap,
  Check
} from 'lucide-react';
import { Task, TaskStatus, TaskPriority, User as UserType } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { storage } from '../../services/storage';

export const TaskManager: React.FC = () => {
  const { currentUser, isAdmin, canAssignTasks, usersList } = useAuth();
  
  const [tasks, setTasks] = useState<Task[]>(storage.getTasks());
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [employeeFilter, setEmployeeFilter] = useState<string>('all');
  
  // Modals state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedTaskForAccept, setSelectedTaskForAccept] = useState<Task | null>(null);
  const [selectedTaskForComplete, setSelectedTaskForComplete] = useState<Task | null>(null);
  const [selectedTaskForReassign, setSelectedTaskForReassign] = useState<Task | null>(null);
  const [selectedTaskForDetails, setSelectedTaskForDetails] = useState<Task | null>(null);

  // Form states for modals
  const [createForm, setCreateForm] = useState({
    title: '',
    description: '',
    category: 'Engineering',
    priority: 'medium' as TaskPriority,
    assignedToUserId: '',
    startDateTime: new Date().toISOString().slice(0, 16),
  });

  const [acceptForm, setAcceptForm] = useState({
    approxCompletionDateTime: '',
    notes: '',
  });

  const [completeForm, setCompleteForm] = useState({
    actualCompletedDateTime: new Date().toISOString().slice(0, 16),
    completionNotes: '',
  });

  const [reassignForm, setReassignForm] = useState({
    newAssignedToUserId: '',
    reason: '',
    newStartDateTime: new Date().toISOString().slice(0, 16),
  });

  // Quick entry sidebar form
  const [quickTaskForm, setQuickTaskForm] = useState({
    title: '',
    assignedToUserId: usersList[0]?.id || '',
    startDateTime: new Date().toISOString().slice(0, 16),
    category: 'Engineering',
    priority: 'medium' as TaskPriority,
  });

  // Keep tasks synced with storage
  React.useEffect(() => {
    const unsub = storage.subscribe(() => {
      setTasks(storage.getTasks());
    });
    return () => unsub();
  }, []);

  // Filter tasks based on role and user selections
  const visibleTasks = useMemo(() => {
    return tasks.filter(task => {
      // Strict role boundary: Regular employee sees ONLY their own assigned tasks
      if (!isAdmin && currentUser) {
        if (task.assignedToUserId !== currentUser.id) {
          return false;
        }
      }

      // Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = task.title.toLowerCase().includes(q);
        const matchesCode = task.taskCode.toLowerCase().includes(q);
        const matchesAssignee = task.assignedToUserName.toLowerCase().includes(q);
        const matchesCategory = task.category.toLowerCase().includes(q);
        if (!matchesTitle && !matchesCode && !matchesAssignee && !matchesCategory) {
          return false;
        }
      }

      // Status filter
      if (statusFilter !== 'all' && task.status !== statusFilter) {
        return false;
      }

      // Priority filter
      if (priorityFilter !== 'all' && task.priority !== priorityFilter) {
        return false;
      }

      // Employee filter (for Admin view)
      if (isAdmin && employeeFilter !== 'all' && task.assignedToUserId !== employeeFilter) {
        return false;
      }

      return true;
    });
  }, [tasks, searchQuery, statusFilter, priorityFilter, employeeFilter, isAdmin, currentUser]);

  // High density analytics metrics
  const metrics = useMemo(() => {
    const total = visibleTasks.length;
    const openCount = visibleTasks.filter(t => t.status !== 'completed').length;
    const completedCount = visibleTasks.filter(t => t.status === 'completed').length;
    
    // Delayed tasks (where completion or estimated is overdue)
    const now = new Date();
    const overdueCount = visibleTasks.filter(t => {
      if (t.status === 'completed') return false;
      if (t.approxCompletionDateTime && new Date(t.approxCompletionDateTime) < now) return true;
      return false;
    }).length;

    const leavesCount = storage.getLeaveRequests().filter(l => l.status === 'pending').length;

    const efficiency = total > 0 
      ? Math.round(((completedCount) / total) * 100)
      : 95;

    return {
      total,
      openCount,
      completedCount,
      overdueCount,
      efficiency: Math.min(100, Math.max(70, efficiency || 94)),
      leavesCount,
    };
  }, [visibleTasks]);

  // Handlers
  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!createForm.title.trim() || !createForm.assignedToUserId) {
      alert('Please provide a task title and select an assignee.');
      return;
    }

    storage.createTask({
      title: createForm.title.trim(),
      description: createForm.description.trim(),
      category: createForm.category,
      priority: createForm.priority,
      assignedToUserId: createForm.assignedToUserId,
      startDateTime: createForm.startDateTime,
    });

    setShowCreateModal(false);
    setCreateForm({
      title: '',
      description: '',
      category: 'Engineering',
      priority: 'medium',
      assignedToUserId: '',
      startDateTime: new Date().toISOString().slice(0, 16),
    });
  };

  const handleQuickDeploy = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickTaskForm.title.trim() || !quickTaskForm.assignedToUserId) {
      alert('Please specify task scope and assignee.');
      return;
    }

    storage.createTask({
      title: quickTaskForm.title.trim(),
      description: `High density quick deployment for ${quickTaskForm.title.trim()}`,
      category: quickTaskForm.category,
      priority: quickTaskForm.priority,
      assignedToUserId: quickTaskForm.assignedToUserId,
      startDateTime: quickTaskForm.startDateTime,
    });

    setQuickTaskForm({
      title: '',
      assignedToUserId: usersList[0]?.id || '',
      startDateTime: new Date().toISOString().slice(0, 16),
      category: 'Engineering',
      priority: 'medium',
    });
  };

  const handleAcceptTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTaskForAccept) return;
    if (!acceptForm.approxCompletionDateTime) {
      alert('Please enter your estimated approximate completion date and time.');
      return;
    }

    storage.acceptTask(selectedTaskForAccept.id, {
      approxCompletionDateTime: acceptForm.approxCompletionDateTime,
      notes: acceptForm.notes,
    });

    setSelectedTaskForAccept(null);
    setAcceptForm({ approxCompletionDateTime: '', notes: '' });
  };

  const handleCompleteTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTaskForComplete) return;
    if (!completeForm.actualCompletedDateTime) {
      alert('Please provide the actual completion date and time.');
      return;
    }

    storage.completeTask(selectedTaskForComplete.id, {
      actualCompletedDateTime: completeForm.actualCompletedDateTime,
      completionNotes: completeForm.completionNotes,
    });

    setSelectedTaskForComplete(null);
    setCompleteForm({
      actualCompletedDateTime: new Date().toISOString().slice(0, 16),
      completionNotes: '',
    });
  };

  const handleReassignTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTaskForReassign) return;
    if (!reassignForm.newAssignedToUserId || !reassignForm.reason.trim()) {
      alert('Please select an employee and state the reassignment reason.');
      return;
    }

    storage.reassignTask(selectedTaskForReassign.id, {
      newAssignedToUserId: reassignForm.newAssignedToUserId,
      reason: reassignForm.reason.trim(),
      newStartDateTime: reassignForm.newStartDateTime,
    });

    setSelectedTaskForReassign(null);
    setReassignForm({
      newAssignedToUserId: '',
      reason: '',
      newStartDateTime: new Date().toISOString().slice(0, 16),
    });
  };

  const getStatusPill = (status: TaskStatus) => {
    switch (status) {
      case 'in_progress':
      case 'accepted':
        return (
          <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-bold uppercase text-[9px] inline-flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse"></span>
            In Progress
          </span>
        );
      case 'assigned':
        return (
          <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-bold uppercase text-[9px] inline-flex items-center gap-1">
            <Clock className="w-2.5 h-2.5 text-slate-500" />
            Pending Accept
          </span>
        );
      case 'completed':
        return (
          <span className="px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-bold uppercase text-[9px] inline-flex items-center gap-1">
            <Check className="w-2.5 h-2.5 text-green-600" />
            Completed
          </span>
        );
      case 'reassigned':
        return (
          <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 font-bold uppercase text-[9px] inline-flex items-center gap-1">
            <ArrowRightLeft className="w-2.5 h-2.5 text-purple-600" />
            Reassigned
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-700 font-bold uppercase text-[9px]">
            {status}
          </span>
        );
    }
  };

  const formatShortDateTime = (dtStr?: string) => {
    if (!dtStr) return '—';
    const d = new Date(dtStr);
    if (isNaN(d.getTime())) return dtStr;
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    const hh = String(d.getHours()).padStart(2, '0');
    const min = String(d.getMinutes()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd} | ${hh}:${min}`;
  };

  const selectedAssigneeObj = useMemo(() => {
    return usersList.find(u => u.id === quickTaskForm.assignedToUserId);
  }, [quickTaskForm.assignedToUserId, usersList]);

  return (
    <div className="space-y-6">
      
      {/* High Density Header Toolbar */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-lg font-bold text-slate-900 tracking-tight">
              Task Management
            </h1>
            <span className="text-[10px] font-mono font-bold bg-blue-50 text-blue-700 px-2 py-0.5 rounded border border-blue-200">
              High Density Matrix
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            {isAdmin 
              ? 'Multi-role assignment, employee acceptance timestamps, and real-time reassignment audit.'
              : `Strict isolated view: displaying tasks assigned directly to ${currentUser?.name} (${currentUser?.id}).`}
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <div className="text-right hidden sm:block">
            <div className="text-[9px] text-slate-400 uppercase font-bold tracking-wider">Current Data View</div>
            <div className="text-xs text-blue-600 font-semibold">
              {isAdmin ? 'All Employees (Global Filter)' : `Isolated: ${currentUser?.id}`}
            </div>
          </div>

          {canAssignTasks && (
            <button
              id="btn-create-new-task"
              onClick={() => {
                setCreateForm({
                  title: '',
                  description: '',
                  category: 'Engineering',
                  priority: 'medium',
                  assignedToUserId: usersList[0]?.id || '',
                  startDateTime: new Date().toISOString().slice(0, 16),
                });
                setShowCreateModal(true);
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-xs font-bold shadow-xs transition-colors cursor-pointer inline-flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ CREATE NEW TASK</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 text-xs">
          
          {/* Search Input */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search title, task code, category..."
              className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full py-1.5 px-2.5 text-xs border border-slate-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white outline-none"
            >
              <option value="all">Status: All Records</option>
              <option value="assigned">Pending Acceptance</option>
              <option value="accepted">In Progress / Accepted</option>
              <option value="completed">Completed</option>
              <option value="reassigned">Reassigned</option>
            </select>
          </div>

          {/* Priority Filter */}
          <div>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="w-full py-1.5 px-2.5 text-xs border border-slate-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white outline-none"
            >
              <option value="all">Priority: All Levels</option>
              <option value="urgent">Urgent</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>

          {/* Employee Filter */}
          {isAdmin ? (
            <div>
              <select
                value={employeeFilter}
                onChange={(e) => setEmployeeFilter(e.target.value)}
                className="w-full py-1.5 px-2.5 text-xs border border-slate-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white outline-none"
              >
                <option value="all">Assignee: All Employees</option>
                {usersList.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.id})
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div className="flex items-center text-[11px] text-slate-500 bg-slate-50 px-2.5 py-1.5 rounded border border-slate-200">
              <User className="w-3 h-3 mr-1 text-slate-400" />
              <span>Isolated: <strong>{currentUser?.id}</strong></span>
            </div>
          )}

        </div>
      </div>

      {/* Main Grid: Left Column (Table + Metrics) & Right Column (Master Data + Quick Deploy) */}
      <div className="grid grid-cols-12 gap-6">
        
        {/* Left Column: Active Assignments & Stats */}
        <div className="col-span-12 lg:col-span-8 flex flex-col space-y-6">
          
          {/* Active Assignments Table Card */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden flex flex-col">
            
            {/* Table Header */}
            <div className="px-5 py-3.5 border-b border-slate-100 flex justify-between items-center bg-slate-50/70">
              <div className="flex items-center space-x-2">
                <h2 className="font-bold text-slate-800 text-sm">Active Assignments</h2>
                <span className="text-[10px] text-slate-400 font-mono">({visibleTasks.length})</span>
              </div>
              <div className="flex space-x-2">
                <span className="px-2 py-0.5 bg-green-100 text-green-700 text-[10px] font-bold rounded">
                  {metrics.openCount} OPEN
                </span>
                <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-[10px] font-bold rounded">
                  {metrics.overdueCount} OVERDUE
                </span>
              </div>
            </div>

            {/* Table Content */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="sticky top-0 bg-white shadow-2xs">
                  <tr className="text-slate-400 uppercase font-bold text-[10px] border-b border-slate-100">
                    <th className="px-4 py-3">Task Title</th>
                    <th className="px-4 py-3">Assigned To</th>
                    <th className="px-4 py-3">Start Date/Time</th>
                    <th className="px-4 py-3">Est. Completion</th>
                    <th className="px-4 py-3 text-center">Status</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {visibleTasks.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                        <CheckSquare className="w-8 h-8 mx-auto mb-2 opacity-40" />
                        <p className="font-semibold text-slate-600 text-xs">No active tasks found</p>
                        <p className="text-[11px] text-slate-400 mt-0.5">Use the quick deploy or new task button to schedule work.</p>
                      </td>
                    </tr>
                  ) : (
                    visibleTasks.map((task) => {
                      const isAssignedToCurrent = currentUser?.id === task.assignedToUserId;
                      const needsAcceptance = task.status === 'assigned' && isAssignedToCurrent;
                      const isReadyToComplete = (task.status === 'accepted' || task.status === 'in_progress') && isAssignedToCurrent;

                      return (
                        <tr 
                          key={task.id} 
                          className="hover:bg-slate-50/80 transition-colors group"
                        >
                          {/* Task Title */}
                          <td className="px-4 py-3">
                            <div className="flex items-center space-x-1.5">
                              <span className="font-mono text-[10px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                                {task.taskCode}
                              </span>
                              <span className="font-bold text-slate-800 hover:text-blue-600 transition-colors">
                                {task.title}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-500 truncate max-w-xs mt-0.5">
                              {task.category} • {task.priority.toUpperCase()}
                            </p>
                          </td>

                          {/* Assigned To */}
                          <td className="px-4 py-3">
                            <div className="font-medium text-slate-700">{task.assignedToUserName}</div>
                            <div className="text-[10px] text-slate-400 font-mono">ID: {task.assignedToUserId}</div>
                          </td>

                          {/* Start Date/Time */}
                          <td className="px-4 py-3 text-slate-500 font-mono text-[11px]">
                            {formatShortDateTime(task.startDateTime)}
                          </td>

                          {/* Est. Completion */}
                          <td className="px-4 py-3 font-mono text-[11px]">
                            {task.approxCompletionDateTime ? (
                              <span className="text-slate-700 font-medium">
                                {formatShortDateTime(task.approxCompletionDateTime)}
                              </span>
                            ) : (
                              <span className="text-amber-600 italic text-[10px]">Pending Est.</span>
                            )}
                          </td>

                          {/* Status */}
                          <td className="px-4 py-3 text-center">
                            {getStatusPill(task.status)}
                          </td>

                          {/* Actions */}
                          <td className="px-4 py-3 text-right">
                            <div className="flex items-center justify-end space-x-1.5">
                              
                              {/* Accept Task */}
                              {needsAcceptance && (
                                <button
                                  onClick={() => {
                                    setSelectedTaskForAccept(task);
                                    setAcceptForm({
                                      approxCompletionDateTime: new Date(Date.now() + 86400000).toISOString().slice(0, 16),
                                      notes: '',
                                    });
                                  }}
                                  className="px-2.5 py-1 bg-amber-500 hover:bg-amber-600 text-white rounded text-[10px] font-bold shadow-2xs transition-colors inline-flex items-center gap-1"
                                >
                                  <Clock className="w-3 h-3" />
                                  <span>Accept & Est.</span>
                                </button>
                              )}

                              {/* Complete Task */}
                              {isReadyToComplete && (
                                <button
                                  onClick={() => {
                                    setSelectedTaskForComplete(task);
                                    setCompleteForm({
                                      actualCompletedDateTime: new Date().toISOString().slice(0, 16),
                                      completionNotes: '',
                                    });
                                  }}
                                  className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[10px] font-bold shadow-2xs transition-colors inline-flex items-center gap-1"
                                >
                                  <CheckCircle2 className="w-3 h-3" />
                                  <span>Finish Work</span>
                                </button>
                              )}

                              {/* Reassign (Admin only) */}
                              {isAdmin && (
                                <button
                                  onClick={() => {
                                    setSelectedTaskForReassign(task);
                                    setReassignForm({
                                      newAssignedToUserId: task.assignedToUserId,
                                      reason: '',
                                      newStartDateTime: new Date().toISOString().slice(0, 16),
                                    });
                                  }}
                                  title="Reassign to employee"
                                  className="p-1 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded transition-colors"
                                >
                                  <ArrowRightLeft className="w-3.5 h-3.5" />
                                </button>
                              )}

                              {/* View Details */}
                              <button
                                onClick={() => setSelectedTaskForDetails(task)}
                                className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[10px] font-bold transition-colors"
                              >
                                Details
                              </button>

                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

          </div>

          {/* High Density Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            
            {/* Avg. Efficiency */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <div className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">
                Avg. Efficiency
              </div>
              <div className="text-2xl font-bold text-slate-900 mt-1">
                {metrics.efficiency}%
              </div>
              <div className="w-full bg-slate-100 h-1.5 mt-2 rounded-full overflow-hidden">
                <div 
                  className="bg-green-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${metrics.efficiency}%` }}
                />
              </div>
            </div>

            {/* Task Turnaround */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <div className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">
                Task Turnaround
              </div>
              <div className="text-2xl font-bold text-slate-900 mt-1">
                1.4 <span className="text-xs font-normal opacity-50">days</span>
              </div>
              <div className="text-blue-500 text-[10px] font-bold mt-1.5 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                <span>↑ 12% improvement</span>
              </div>
            </div>

            {/* Leave Requests */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <div className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">
                Leave Requests
              </div>
              <div className="text-2xl font-bold text-slate-900 mt-1">
                {String(metrics.leavesCount).padStart(2, '0')} <span className="text-xs font-normal opacity-50">Pending</span>
              </div>
              <div className="text-slate-400 text-[10px] mt-1.5 italic">
                Synced with User Emails
              </div>
            </div>

          </div>

        </div>

        {/* Right Column: Master Data Actions & New Task Quick Entry */}
        <div className="col-span-12 lg:col-span-4 flex flex-col space-y-6">
          
          {/* Master Data Actions Card */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3 border-b border-slate-100 pb-2 flex items-center justify-between">
              <span>Master Data Actions</span>
              <Layers className="w-3.5 h-3.5 text-slate-400" />
            </h3>
            
            <div className="space-y-2.5 text-xs">
              <div 
                onClick={() => {
                  if (isAdmin) {
                    window.location.hash = '#master_data';
                  } else {
                    alert('Admin access required for Employee Master updates.');
                  }
                }}
                className="group cursor-pointer p-3 rounded-lg border border-slate-100 hover:border-blue-200 hover:bg-blue-50/60 transition-all"
              >
                <div className="text-xs font-bold text-slate-700 group-hover:text-blue-700 flex items-center justify-between">
                  <span>Update Employee Master</span>
                  <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <p className="text-[10px] text-slate-500 mt-1">
                  Manage IDs, Passwords, and Data Visibility Masks.
                </p>
              </div>

              <div 
                onClick={() => {
                  if (isAdmin) {
                    window.location.hash = '#master_data';
                  } else {
                    alert('Admin access required for Leave Types configuration.');
                  }
                }}
                className="group cursor-pointer p-3 rounded-lg border border-slate-100 hover:border-blue-200 hover:bg-blue-50/60 transition-all"
              >
                <div className="text-xs font-bold text-slate-700 group-hover:text-blue-700 flex items-center justify-between">
                  <span>Configure Leave Types</span>
                  <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <p className="text-[10px] text-slate-500 mt-1">
                  Annual, Sick, Maternity, and Unpaid leave rules.
                </p>
              </div>

              <div 
                className="group cursor-pointer p-3 rounded-lg border border-slate-100 hover:border-blue-200 hover:bg-blue-50/60 transition-all"
              >
                <div className="text-xs font-bold text-slate-700 group-hover:text-blue-700 flex items-center justify-between">
                  <span>User Access Matrix</span>
                  <Shield className="w-3 h-3 text-slate-400 group-hover:text-blue-600" />
                </div>
                <p className="text-[10px] text-slate-500 mt-1">
                  Restrict users to only their individual data views.
                </p>
              </div>
            </div>
          </div>

          {/* New Task Quick Entry Dark Card */}
          <div className="bg-slate-900 rounded-xl shadow-md p-5 text-white flex-1 relative overflow-hidden border border-slate-800">
            <div className="relative z-10 space-y-4 text-xs">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                  New Task Quick Entry
                </h3>
                <span className="text-[9px] font-mono text-blue-400 bg-blue-950/80 px-1.5 py-0.5 rounded border border-blue-800">
                  Instant Assign
                </span>
              </div>

              <form onSubmit={handleQuickDeploy} className="space-y-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Assignment Scope
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Task Name & Brief Scope..."
                    value={quickTaskForm.title}
                    onChange={(e) => setQuickTaskForm({ ...quickTaskForm, title: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 text-white rounded p-2 text-xs focus:ring-1 focus:ring-blue-500 outline-none placeholder:text-slate-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Assign Employee
                    </label>
                    <select
                      value={quickTaskForm.assignedToUserId}
                      onChange={(e) => setQuickTaskForm({ ...quickTaskForm, assignedToUserId: e.target.value })}
                      className="w-full bg-slate-800 border border-slate-700 text-white rounded p-2 text-xs outline-none"
                    >
                      {usersList.map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      User ID
                    </label>
                    <input
                      type="text"
                      value={selectedAssigneeObj?.id || '—'}
                      readOnly
                      className="w-full bg-slate-700/80 border border-slate-600 text-slate-300 rounded p-2 text-xs font-mono"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Start Schedule
                  </label>
                  <input
                    type="datetime-local"
                    value={quickTaskForm.startDateTime}
                    onChange={(e) => setQuickTaskForm({ ...quickTaskForm, startDateTime: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 text-white rounded p-2 text-xs outline-none font-mono"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white py-2.5 rounded font-bold text-xs mt-2 transition-colors shadow-xs cursor-pointer"
                >
                  DEPLOY TASK
                </button>
              </form>

              <p className="text-[10px] text-slate-400 italic text-center pt-2">
                Task assignments trigger automated notification logs to employee mailboxes.
              </p>
            </div>

            {/* Ambient Background Accent Glow */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 blur-3xl rounded-full translate-x-10 -translate-y-10 pointer-events-none" />
          </div>

        </div>

      </div>

      {/* --- MODAL: CREATE NEW TASK --- */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <h3 className="text-base font-bold text-slate-900">Create & Assign New Task</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Task Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Implement API Integration Layer"
                  value={createForm.title}
                  onChange={(e) => setCreateForm({ ...createForm, title: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Task Scope & Description
                </label>
                <textarea
                  rows={3}
                  placeholder="Provide deliverables, requirements, and reference notes..."
                  value={createForm.description}
                  onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-blue-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Assign To Employee *
                  </label>
                  <select
                    required
                    value={createForm.assignedToUserId}
                    onChange={(e) => setCreateForm({ ...createForm, assignedToUserId: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-blue-500 bg-white outline-none"
                  >
                    <option value="">Select Employee</option>
                    {usersList.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name} ({u.id} - {u.designation})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Priority Level
                  </label>
                  <select
                    value={createForm.priority}
                    onChange={(e) => setCreateForm({ ...createForm, priority: e.target.value as TaskPriority })}
                    className="w-full px-3 py-2 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-blue-500 bg-white outline-none"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Category
                  </label>
                  <select
                    value={createForm.category}
                    onChange={(e) => setCreateForm({ ...createForm, category: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-blue-500 bg-white outline-none"
                  >
                    <option value="Engineering">Engineering</option>
                    <option value="Design">Design</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Operations">Operations</option>
                    <option value="Finance">Finance</option>
                    <option value="HR & Admin">HR & Admin</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Starting Date & Time *
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={createForm.startDateTime}
                    onChange={(e) => setCreateForm({ ...createForm, startDateTime: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-blue-500 font-mono outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded shadow-xs"
                >
                  Schedule Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL: EMPLOYEE ACCEPT TASK WITH ESTIMATION --- */}
      {selectedTaskForAccept && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <h3 className="text-base font-bold text-slate-900">Accept Task & Provide Estimate</h3>
            <p className="text-xs text-slate-500 mt-1">
              Task: <strong>{selectedTaskForAccept.taskCode}</strong> - {selectedTaskForAccept.title}
            </p>

            <form onSubmit={handleAcceptTask} className="mt-4 space-y-3 text-xs">
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200 text-slate-700">
                <span className="text-[10px] uppercase font-bold text-blue-900 block">Scheduled Start Time</span>
                <p className="font-mono font-semibold text-blue-800 mt-0.5">
                  {formatShortDateTime(selectedTaskForAccept.startDateTime)}
                </p>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Estimated Approximate Completion Date & Time *
                </label>
                <input
                  type="datetime-local"
                  required
                  value={acceptForm.approxCompletionDateTime}
                  onChange={(e) => setAcceptForm({ ...acceptForm, approxCompletionDateTime: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-blue-500 font-mono outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Acceptance Notes (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Dependencies, assumptions, or remarks..."
                  value={acceptForm.notes}
                  onChange={(e) => setAcceptForm({ ...acceptForm, notes: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-blue-500 outline-none"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedTaskForAccept(null)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded shadow-xs"
                >
                  Accept & Begin Work
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL: COMPLETE TASK --- */}
      {selectedTaskForComplete && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <h3 className="text-base font-bold text-slate-900">Finalize & Complete Task</h3>
            <p className="text-xs text-slate-500 mt-1">
              Task: <strong>{selectedTaskForComplete.taskCode}</strong> - {selectedTaskForComplete.title}
            </p>

            <form onSubmit={handleCompleteTask} className="mt-4 space-y-3 text-xs">
              <div>
                <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Actual Completed Date & Time *
                </label>
                <input
                  type="datetime-local"
                  required
                  value={completeForm.actualCompletedDateTime}
                  onChange={(e) => setCompleteForm({ ...completeForm, actualCompletedDateTime: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-blue-500 font-mono outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Completion Notes / Deliverables Summary
                </label>
                <textarea
                  rows={2}
                  placeholder="Summary of completed deliverables or PR links..."
                  value={completeForm.completionNotes}
                  onChange={(e) => setCompleteForm({ ...completeForm, completionNotes: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-blue-500 outline-none"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedTaskForComplete(null)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded shadow-xs"
                >
                  Mark Completed
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL: REASSIGN TASK --- */}
      {selectedTaskForReassign && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <h3 className="text-base font-bold text-slate-900">Reassign Task</h3>
            <p className="text-xs text-slate-500 mt-1">
              Reassign <strong>{selectedTaskForReassign.taskCode}</strong> ({selectedTaskForReassign.title})
            </p>

            <form onSubmit={handleReassignTask} className="mt-4 space-y-3 text-xs">
              <div>
                <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Assign To (Same or Different Employee) *
                </label>
                <select
                  required
                  value={reassignForm.newAssignedToUserId}
                  onChange={(e) => setReassignForm({ ...reassignForm, newAssignedToUserId: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-blue-500 bg-white outline-none"
                >
                  <option value="">Select Employee</option>
                  {usersList.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name} ({u.id} - {u.designation})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Reassignment Reason / Revision Instructions *
                </label>
                <textarea
                  rows={2}
                  required
                  placeholder="Explain why the task is being reassigned or what revisions are needed..."
                  value={reassignForm.reason}
                  onChange={(e) => setReassignForm({ ...reassignForm, reason: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  New Start Date & Time *
                </label>
                <input
                  type="datetime-local"
                  required
                  value={reassignForm.newStartDateTime}
                  onChange={(e) => setReassignForm({ ...reassignForm, newStartDateTime: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-blue-500 font-mono outline-none"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedTaskForReassign(null)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded shadow-xs"
                >
                  Reassign Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL: TASK DETAILS & AUDIT HISTORY --- */}
      {selectedTaskForDetails && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div className="flex items-center space-x-2">
                <span className="font-mono font-bold text-xs bg-slate-100 px-2 py-0.5 rounded text-slate-800">
                  {selectedTaskForDetails.taskCode}
                </span>
                <h3 className="text-sm font-bold text-slate-900">{selectedTaskForDetails.title}</h3>
              </div>
              <button
                onClick={() => setSelectedTaskForDetails(null)}
                className="text-slate-400 hover:text-slate-600 p-1 text-sm"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Scope & Description</span>
                  <p className="text-slate-800 text-xs mt-0.5">{selectedTaskForDetails.description || 'No description provided.'}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3 rounded-lg border border-slate-200">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Assignee</span>
                  <p className="font-bold text-slate-900">{selectedTaskForDetails.assignedToUserName}</p>
                  <p className="font-mono text-[10px] text-slate-500">ID: {selectedTaskForDetails.assignedToUserId}</p>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Status</span>
                  <div className="mt-0.5">{getStatusPill(selectedTaskForDetails.status)}</div>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Start Time</span>
                  <p className="font-mono text-slate-700">{formatShortDateTime(selectedTaskForDetails.startDateTime)}</p>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Est. Completion</span>
                  <p className="font-mono text-slate-700">{formatShortDateTime(selectedTaskForDetails.approxCompletionDateTime)}</p>
                </div>
              </div>

              {/* Reassignment Audit Trail */}
              {selectedTaskForDetails.reassignmentHistory && selectedTaskForDetails.reassignmentHistory.length > 0 && (
                <div className="border border-purple-200 bg-purple-50/50 rounded-lg p-3 space-y-2">
                  <h4 className="font-bold text-purple-900 text-xs flex items-center gap-1.5">
                    <History className="w-3.5 h-3.5" />
                    <span>Reassignment Audit Trail ({selectedTaskForDetails.reassignmentHistory.length})</span>
                  </h4>
                  <div className="space-y-1.5">
                    {selectedTaskForDetails.reassignmentHistory.map((h, i) => (
                      <div key={i} className="p-2 bg-white rounded border border-purple-200 text-[11px] space-y-0.5">
                        <div className="flex justify-between font-semibold text-purple-900">
                          <span>{h.fromUserName} ({h.fromUserId}) → {h.toUserName} ({h.toUserId})</span>
                          <span className="text-[10px] text-slate-400 font-mono">{new Date(h.timestamp).toLocaleString()}</span>
                        </div>
                        <p className="text-slate-600">Reason: {h.reason}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-end pt-3 border-t border-slate-100">
                <button
                  onClick={() => setSelectedTaskForDetails(null)}
                  className="px-4 py-1.5 bg-slate-900 text-white rounded text-xs font-bold"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
