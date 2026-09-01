import React, { useState, useMemo } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Download, 
  Printer, 
  User, 
  Calendar, 
  Award, 
  Zap, 
  Sparkles, 
  Filter, 
  CheckSquare, 
  ArrowUpRight,
  TrendingDown
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  Legend 
} from 'recharts';
import { useAuth } from '../../context/AuthContext';
import { storage } from '../../services/storage';
import { EmployeeEfficiencyStats } from '../../types';

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#ef4444'];

export const ReportsView: React.FC = () => {
  const { currentUser, isAdmin, usersList } = useAuth();
  const [stats, setStats] = useState<EmployeeEfficiencyStats[]>(storage.getEmployeeEfficiencyStats());
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>(isAdmin ? 'all' : (currentUser?.id || ''));

  React.useEffect(() => {
    const unsub = storage.subscribe(() => {
      setStats(storage.getEmployeeEfficiencyStats());
    });
    return () => unsub();
  }, []);

  const departments = useMemo(() => {
    const set = new Set<string>();
    usersList.forEach(u => {
      if (u.department) set.add(u.department);
    });
    return Array.from(set);
  }, [usersList]);

  // Filtered stats based on permissions & filter dropdowns
  const filteredStats = useMemo(() => {
    return stats.filter(stat => {
      // Regular user restriction: ONLY access own stats
      if (!isAdmin && currentUser) {
        if (stat.userId !== currentUser.id) return false;
      }

      if (selectedDepartment !== 'all' && stat.department !== selectedDepartment) {
        return false;
      }

      if (isAdmin && selectedEmployeeId !== 'all' && stat.userId !== selectedEmployeeId) {
        return false;
      }

      return true;
    });
  }, [stats, selectedDepartment, selectedEmployeeId, isAdmin, currentUser]);

  // Aggregate stats
  const totals = useMemo(() => {
    const totalAssigned = filteredStats.reduce((a, b) => a + b.totalAssignedTasks, 0);
    const totalCompleted = filteredStats.reduce((a, b) => a + b.completedTasks, 0);
    const totalCompletedOnTime = filteredStats.reduce((a, b) => a + b.completedOnTime, 0);
    const totalDelayed = filteredStats.reduce((a, b) => a + b.completedDelayed, 0);
    const avgEfficiency = filteredStats.length > 0 
      ? Math.round(filteredStats.reduce((a, b) => a + b.efficiencyScore, 0) / filteredStats.length) 
      : 100;
    const totalLeaves = filteredStats.reduce((a, b) => a + b.totalLeavesTaken, 0);

    return {
      totalAssigned,
      totalCompleted,
      totalCompletedOnTime,
      totalDelayed,
      avgEfficiency,
      totalLeaves,
    };
  }, [filteredStats]);

  // Chart data for Bar Chart: Tasks comparison per employee
  const barChartData = useMemo(() => {
    return filteredStats.map(s => ({
      name: s.userName.split(' ')[0],
      fullName: s.userName,
      Completed: s.completedTasks,
      'In Progress': s.inProgressTasks,
      'Pending Est': s.pendingAcceptanceTasks,
      Efficiency: s.efficiencyScore,
    }));
  }, [filteredStats]);

  // Chart data for Pie Chart: Status Breakdown
  const pieChartData = useMemo(() => {
    const totalPending = filteredStats.reduce((a, b) => a + b.pendingAcceptanceTasks, 0);
    const totalInProgress = filteredStats.reduce((a, b) => a + b.inProgressTasks, 0);
    const totalCompleted = filteredStats.reduce((a, b) => a + b.completedTasks, 0);
    const totalReassigned = filteredStats.reduce((a, b) => a + b.reassignedTasks, 0);

    return [
      { name: 'Completed', value: totalCompleted || 1, color: '#10b981' },
      { name: 'In Progress', value: totalInProgress, color: '#3b82f6' },
      { name: 'Pending Est.', value: totalPending, color: '#f59e0b' },
      { name: 'Reassigned', value: totalReassigned, color: '#8b5cf6' },
    ].filter(i => i.value > 0);
  }, [filteredStats]);

  const getEfficiencyRatingBadge = (score: number) => {
    if (score >= 90) {
      return (
        <span className="px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-bold uppercase text-[9px] inline-flex items-center gap-1">
          <Sparkles className="w-2.5 h-2.5 text-green-600" />
          {score}% (Exceptional)
        </span>
      );
    }
    if (score >= 75) {
      return (
        <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-bold uppercase text-[9px] inline-flex items-center gap-1">
          <Zap className="w-2.5 h-2.5 text-blue-600" />
          {score}% (Standard)
        </span>
      );
    }
    if (score >= 60) {
      return (
        <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 font-bold uppercase text-[9px] inline-flex items-center gap-1">
          <Clock className="w-2.5 h-2.5 text-amber-600" />
          {score}% (Moderate)
        </span>
      );
    }
    return (
      <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-700 font-bold uppercase text-[9px] inline-flex items-center gap-1">
        <AlertTriangle className="w-2.5 h-2.5 text-red-600" />
        {score}% (Review)
      </span>
    );
  };

  const handleExportCSV = () => {
    const headers = [
      'User ID',
      'Employee Name',
      'Department',
      'Designation',
      'Assigned Tasks',
      'Completed Tasks',
      'On-Time Tasks',
      'Delayed Tasks',
      'Avg Est Hours',
      'Avg Actual Hours',
      'On-Time Rate %',
      'Efficiency Score %',
      'Total Leaves Taken'
    ];

    const rows = filteredStats.map(s => [
      s.userId,
      `"${s.userName}"`,
      `"${s.department}"`,
      `"${s.designation}"`,
      s.totalAssignedTasks,
      s.completedTasks,
      s.completedOnTime,
      s.completedDelayed,
      s.avgEstimatedHours,
      s.avgActualHours,
      s.onTimeCompletionRate,
      s.efficiencyScore,
      s.totalLeavesTaken
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `employee_efficiency_report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      
      {/* High Density Header Toolbar */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-lg font-bold text-slate-900 tracking-tight">
              Reports & Efficiency Analytics
            </h1>
            <span className="text-[10px] font-mono font-bold bg-green-50 text-green-700 px-2 py-0.5 rounded border border-green-200">
              Live Aggregate
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            {isAdmin
              ? 'Employee-wise task volume, on-time delivery rates, estimation accuracy, and calculated efficiency.'
              : `Personal Performance Card: Tracking task velocity and efficiency for ${currentUser?.name}.`}
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 text-xs font-bold rounded shadow-2xs transition-all cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={handlePrint}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded shadow-2xs transition-all cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* Filter Row (Admin only) */}
      {isAdmin && (
        <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                Filter by Employee
              </label>
              <select
                value={selectedEmployeeId}
                onChange={(e) => setSelectedEmployeeId(e.target.value)}
                className="w-full py-1.5 px-2.5 text-xs border border-slate-300 rounded focus:ring-1 focus:ring-blue-500 bg-white outline-none"
              >
                <option value="all">All Employees ({usersList.length})</option>
                {usersList.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.id} - {u.department})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                Filter by Department
              </label>
              <select
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                className="w-full py-1.5 px-2.5 text-xs border border-slate-300 rounded focus:ring-1 focus:ring-blue-500 bg-white outline-none"
              >
                <option value="all">All Departments</option>
                {departments.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* High Density Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Assigned</div>
          <div className="text-2xl font-bold text-slate-900 mt-1">{totals.totalAssigned}</div>
          <div className="text-[10px] text-slate-400 mt-1">Total Workload</div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-green-600 text-[10px] font-bold uppercase tracking-wider">Completed</div>
          <div className="text-2xl font-bold text-green-700 mt-1">{totals.totalCompleted}</div>
          <div className="text-[10px] text-slate-400 mt-1">Finalized tasks</div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-blue-600 text-[10px] font-bold uppercase tracking-wider">On-Time</div>
          <div className="text-2xl font-bold text-blue-700 mt-1">{totals.totalCompletedOnTime}</div>
          <div className="text-[10px] text-slate-400 mt-1">Punctual closures</div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-red-600 text-[10px] font-bold uppercase tracking-wider">Delayed</div>
          <div className="text-2xl font-bold text-red-700 mt-1">{totals.totalDelayed}</div>
          <div className="text-[10px] text-slate-400 mt-1">Past estimate</div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Avg Efficiency</div>
          <div className="text-2xl font-bold text-slate-900 mt-1">{totals.avgEfficiency}%</div>
          <div className="w-full bg-slate-100 h-1 mt-1.5 rounded-full overflow-hidden">
            <div className="bg-green-500 h-full rounded-full" style={{ width: `${totals.avgEfficiency}%` }} />
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-purple-600 text-[10px] font-bold uppercase tracking-wider">Leaves Taken</div>
          <div className="text-2xl font-bold text-purple-700 mt-1">{totals.totalLeaves} <span className="text-xs font-normal opacity-50">d</span></div>
          <div className="text-[10px] text-slate-400 mt-1">Approved time-off</div>
        </div>

      </div>

      {/* Visual Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Bar Chart: Task Distribution per Employee */}
        <div className="lg:col-span-2 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2">
            <div>
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Task Volume & Delivery by Employee</h3>
              <p className="text-[10px] text-slate-400">Completed vs In Progress breakdown</p>
            </div>
            <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded text-slate-600 font-bold">
              Comparative Matrix
            </span>
          </div>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={10} />
                <YAxis stroke="#64748b" fontSize={10} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: '10px' }} />
                <Bar dataKey="Completed" fill="#10b981" radius={[3, 3, 0, 0]} />
                <Bar dataKey="In Progress" fill="#3b82f6" radius={[3, 3, 0, 0]} />
                <Bar dataKey="Pending Est" fill="#f59e0b" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Status Distribution Pie Chart */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="border-b border-slate-100 pb-2 mb-2">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Task Status Share</h3>
            <p className="text-[10px] text-slate-400">Workflow proportion</p>
          </div>

          <div className="h-48 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={70}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {pieChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: '10px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-[10px] text-slate-500 flex justify-between">
            <span>Score: Punctuality (45%) + Completion (35%) + Speed (20%)</span>
          </div>
        </div>

      </div>

      {/* Employee-Wise Detailed Efficiency Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-100 flex justify-between items-center bg-slate-50/70">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Employee Efficiency & Punctuality Ledger</h3>
            <p className="text-[10px] text-slate-400">
              Individual assessment with estimation vs actual completion duration
            </p>
          </div>
          <span className="text-[10px] text-slate-400 font-mono">
            {filteredStats.length} Records
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="sticky top-0 bg-white shadow-2xs">
              <tr className="text-slate-400 uppercase font-bold text-[10px] border-b border-slate-100">
                <th className="py-2.5 px-4">User ID & Employee</th>
                <th className="py-2.5 px-4">Department & Role</th>
                <th className="py-2.5 px-4 text-center">Assigned</th>
                <th className="py-2.5 px-4 text-center">Completed</th>
                <th className="py-2.5 px-4 text-center">On-Time Rate</th>
                <th className="py-2.5 px-4 text-center">Avg Est / Actual</th>
                <th className="py-2.5 px-4 text-center">Efficiency Score</th>
                <th className="py-2.5 px-4 text-center">Leaves Used</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStats.map((emp) => (
                <tr key={emp.userId} className="hover:bg-slate-50/80 transition-colors">
                  
                  {/* Employee & ID */}
                  <td className="py-2.5 px-4">
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-[10px]">
                        {emp.userName.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900">{emp.userName}</p>
                        <span className="font-mono text-[9px] text-slate-500">ID: {emp.userId}</span>
                      </div>
                    </div>
                  </td>

                  {/* Department & Role */}
                  <td className="py-2.5 px-4 text-slate-600">
                    <p className="font-semibold text-slate-800">{emp.department}</p>
                    <p className="text-[10px] text-slate-500">{emp.designation}</p>
                  </td>

                  {/* Tasks Assigned */}
                  <td className="py-2.5 px-4 text-center">
                    <span className="font-mono font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                      {emp.totalAssignedTasks}
                    </span>
                  </td>

                  {/* Completed Breakdown */}
                  <td className="py-2.5 px-4 text-center">
                    <div className="flex items-center justify-center space-x-1 font-mono text-[11px]">
                      <span className="font-bold text-green-700">{emp.completedTasks}</span>
                      <span className="text-slate-400 text-[10px]">({emp.completedOnTime} on-time)</span>
                    </div>
                  </td>

                  {/* On-Time Rate */}
                  <td className="py-2.5 px-4 text-center">
                    <span className={`font-mono font-bold text-[11px] ${
                      emp.onTimeCompletionRate >= 80 ? 'text-green-700' : emp.onTimeCompletionRate >= 50 ? 'text-amber-700' : 'text-red-700'
                    }`}>
                      {emp.onTimeCompletionRate}%
                    </span>
                  </td>

                  {/* Avg Est vs Actual Hours */}
                  <td className="py-2.5 px-4 text-center font-mono text-[11px] text-slate-700">
                    {emp.avgEstimatedHours > 0 ? (
                      <span>{emp.avgEstimatedHours}h / {emp.avgActualHours}h</span>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </td>

                  {/* Efficiency Rating */}
                  <td className="py-2.5 px-4 text-center">
                    {getEfficiencyRatingBadge(emp.efficiencyScore)}
                  </td>

                  {/* Leaves Used */}
                  <td className="py-2.5 px-4 text-center">
                    <span className="bg-purple-50 text-purple-800 font-bold px-2 py-0.5 rounded border border-purple-200 text-[10px] font-mono">
                      {emp.totalLeavesTaken} d
                    </span>
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
