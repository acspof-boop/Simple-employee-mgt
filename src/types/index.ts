export type UserRole = 'admin' | 'manager' | 'employee';

export type UserStatus = 'active' | 'restricted';

export interface User {
  id: string; // User ID (e.g. EMP001, john_doe) - changeable by Admin
  name: string;
  email: string;
  password: string; // Plain/hashed simulation for client-side storage
  role: UserRole;
  designation: string;
  department: string;
  phone?: string;
  status: UserStatus;
  avatarUrl?: string;
  createdAt: string;
  updatedAt?: string;
}

export type TaskStatus = 
  | 'assigned'        // Created by Admin/Manager, waiting for employee acceptance
  | 'accepted'        // Employee accepted & entered approximate completion date/time
  | 'in_progress'     // Currently worked on
  | 'completed'       // Completed with actual completion date/time
  | 'reassigned'      // Reassigned to another/same employee
  | 'on_hold'
  | 'cancelled';

export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface TaskReassignmentRecord {
  id: string;
  fromUserId: string;
  fromUserName: string;
  toUserId: string;
  toUserName: string;
  reassignedAt: string;
  reassignedByUserId: string;
  reassignedByUserName: string;
  reason: string;
  previousApproxCompletionDate?: string;
}

export interface Task {
  id: string;
  taskCode: string; // e.g. TSK-101
  title: string;
  description: string;
  category: string;
  priority: TaskPriority;
  status: TaskStatus;
  
  // Assignment details
  assignedToUserId: string;
  assignedToUserName: string;
  assignedByUserId: string;
  assignedByUserName: string;
  
  // Timeline dates
  startDateTime: string; // Required when task created
  
  // Employee input on acceptance
  approxCompletionDateTime?: string; // Input by employee BEFORE accepting
  employeeAcceptanceNotes?: string;
  acceptedAt?: string;
  
  // Completion details
  actualCompletedDateTime?: string; // Input when work is done
  completionNotes?: string;
  completedByUserId?: string;
  
  // Reassignment history
  reassignmentHistory: TaskReassignmentRecord[];
  
  createdAt: string;
  updatedAt: string;
}

export interface LeaveType {
  id: string;
  code: string; // e.g. CL, SL, AL, ML
  name: string; // e.g. Casual Leave, Sick Leave, Annual Leave
  description: string;
  quotaDays: number;
  isPaid: boolean;
  color: string; // HEX / Tailwind badge color
  isActive: boolean;
}

export type LeaveStatus = 'pending' | 'approved' | 'rejected' | 'cancelled';

export interface LeaveRequest {
  id: string;
  requestNumber: string; // e.g. LV-2026-001
  userId: string;
  userName: string;
  userEmail: string;
  department: string;
  leaveTypeId: string;
  leaveTypeName: string;
  startDate: string;
  endDate: string;
  totalDays: number;
  reason: string;
  status: LeaveStatus;
  appliedAt: string;
  reviewedByUserId?: string;
  reviewedByUserName?: string;
  reviewedAt?: string;
  reviewerRemarks?: string;
  emailSentTo?: string[];
  emailSentAt?: string;
}

export interface EmployeeEfficiencyStats {
  userId: string;
  userName: string;
  userRole: string;
  department: string;
  designation: string;
  status: UserStatus;
  
  totalAssignedTasks: number;
  pendingAcceptanceTasks: number;
  inProgressTasks: number;
  completedTasks: number;
  reassignedTasks: number;
  
  // Turnaround and punctuality
  completedOnTime: number;
  completedDelayed: number;
  avgEstimatedHours: number;
  avgActualHours: number;
  
  // Calculated Efficiency Score (0 - 100%)
  efficiencyScore: number;
  onTimeCompletionRate: number; // percentage
  
  // Leave statistics
  totalLeavesTaken: number;
}

export interface ActivityLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  action: string;
  details: string;
  type: 'task' | 'user' | 'leave' | 'system';
}

export type ActiveTab = 'tasks' | 'reports' | 'master_data' | 'leaves';
