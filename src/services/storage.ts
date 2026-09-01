import { 
  User, 
  Task, 
  LeaveType, 
  LeaveRequest, 
  ActivityLog, 
  EmployeeEfficiencyStats 
} from '../types';

const STORAGE_KEYS = {
  USERS: 'emp_mgmt_users_v1',
  TASKS: 'emp_mgmt_tasks_v1',
  LEAVE_TYPES: 'emp_mgmt_leave_types_v1',
  LEAVE_REQUESTS: 'emp_mgmt_leave_requests_v1',
  LOGS: 'emp_mgmt_logs_v1',
  CURRENT_USER_ID: 'emp_mgmt_current_user_id_v1',
  INITIALIZED: 'emp_mgmt_initialized_v1',
};

// Initial default leave types
export const DEFAULT_LEAVE_TYPES: LeaveType[] = [
  {
    id: 'lt_1',
    code: 'CL',
    name: 'Casual Leave',
    description: 'For unforeseen personal matters and brief casual leaves.',
    quotaDays: 12,
    isPaid: true,
    color: '#3b82f6', // blue
    isActive: true,
  },
  {
    id: 'lt_2',
    code: 'SL',
    name: 'Sick Leave',
    description: 'For medical recovery, doctors visits, or health emergencies.',
    quotaDays: 10,
    isPaid: true,
    color: '#ef4444', // red
    isActive: true,
  },
  {
    id: 'lt_3',
    code: 'AL',
    name: 'Annual Paid Leave',
    description: 'Planned vacation and annual recreational leave.',
    quotaDays: 18,
    isPaid: true,
    color: '#10b981', // emerald
    isActive: true,
  },
  {
    id: 'lt_4',
    code: 'EL',
    name: 'Emergency Leave',
    description: 'Critical family or domestic urgent situations.',
    quotaDays: 5,
    isPaid: true,
    color: '#f59e0b', // amber
    isActive: true,
  },
  {
    id: 'lt_5',
    code: 'LWP',
    name: 'Leave Without Pay',
    description: 'Extended leave beyond standard allocated paid allowances.',
    quotaDays: 30,
    isPaid: false,
    color: '#6b7280', // gray
    isActive: true,
  },
];

// Initial default users (1 Admin + 3 Employees for seamless multi-user testing)
export const DEFAULT_USERS: User[] = [
  {
    id: 'ADMIN01',
    name: 'Sarah Jenkins (Admin)',
    email: 'admin@company.com',
    password: 'password123',
    role: 'admin',
    designation: 'Operations Director & Admin',
    department: 'Management',
    phone: '+1 (555) 019-2831',
    status: 'active',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
  },
  {
    id: 'EMP101',
    name: 'David Chen',
    email: 'david.chen@company.com',
    password: 'password123',
    role: 'employee',
    designation: 'Senior Software Engineer',
    department: 'Engineering',
    phone: '+1 (555) 014-9921',
    status: 'active',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    createdAt: new Date(Date.now() - 25 * 86400000).toISOString(),
  },
  {
    id: 'EMP102',
    name: 'Elena Rostova',
    email: 'elena.rostova@company.com',
    password: 'password123',
    role: 'employee',
    designation: 'UI/UX Product Designer',
    department: 'Design',
    phone: '+1 (555) 018-3342',
    status: 'active',
    avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    createdAt: new Date(Date.now() - 20 * 86400000).toISOString(),
  },
  {
    id: 'EMP103',
    name: 'Marcus Vance',
    email: 'marcus.vance@company.com',
    password: 'password123',
    role: 'employee',
    designation: 'QA & Automation Specialist',
    department: 'Engineering',
    phone: '+1 (555) 012-7788',
    status: 'active',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    createdAt: new Date(Date.now() - 15 * 86400000).toISOString(),
  },
];

// Initial default sample tasks illustrating full lifecycle
export const DEFAULT_TASKS: Task[] = [
  {
    id: 'tsk_1',
    taskCode: 'TSK-101',
    title: 'Design Mobile Responsive Layout for Checkout',
    description: 'Create high-fidelity responsive mockups and micro-interactions for the mobile payment funnel.',
    category: 'Design',
    priority: 'high',
    status: 'completed',
    assignedToUserId: 'EMP102',
    assignedToUserName: 'Elena Rostova',
    assignedByUserId: 'ADMIN01',
    assignedByUserName: 'Sarah Jenkins (Admin)',
    startDateTime: new Date(Date.now() - 5 * 86400000).toISOString().slice(0, 16),
    approxCompletionDateTime: new Date(Date.now() - 3 * 86400000).toISOString().slice(0, 16),
    employeeAcceptanceNotes: 'Reviewed Figma assets, starting layout prototypes today.',
    acceptedAt: new Date(Date.now() - 5 * 86400000 + 3600000).toISOString(),
    actualCompletedDateTime: new Date(Date.now() - 3 * 86400000 - 1800000).toISOString().slice(0, 16),
    completionNotes: 'Delivered all prototypes with responsive breakpoints tested and approved by engineering team.',
    completedByUserId: 'EMP102',
    reassignmentHistory: [],
    createdAt: new Date(Date.now() - 6 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 3 * 86400000).toISOString(),
  },
  {
    id: 'tsk_2',
    taskCode: 'TSK-102',
    title: 'Migrate PostgreSQL Database Connection Pooler',
    description: 'Upgrade PgBouncer config to optimize client concurrency and prevent connection saturation.',
    category: 'Infrastructure',
    priority: 'urgent',
    status: 'accepted',
    assignedToUserId: 'EMP101',
    assignedToUserName: 'David Chen',
    assignedByUserId: 'ADMIN01',
    assignedByUserName: 'Sarah Jenkins (Admin)',
    startDateTime: new Date(Date.now() - 2 * 86400000).toISOString().slice(0, 16),
    approxCompletionDateTime: new Date(Date.now() + 1 * 86400000).toISOString().slice(0, 16),
    employeeAcceptanceNotes: 'Scheduled maintenance window for tonight; preparing rollback scripts beforehand.',
    acceptedAt: new Date(Date.now() - 2 * 86400000 + 7200000).toISOString(),
    reassignmentHistory: [],
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
  {
    id: 'tsk_3',
    taskCode: 'TSK-103',
    title: 'Perform End-to-End Regression Testing on v2.4 Release',
    description: 'Execute automated Playwright suites across edge browser matrix and verify OAuth flows.',
    category: 'QA',
    priority: 'medium',
    status: 'assigned', // Pending employee acceptance
    assignedToUserId: 'EMP103',
    assignedToUserName: 'Marcus Vance',
    assignedByUserId: 'ADMIN01',
    assignedByUserName: 'Sarah Jenkins (Admin)',
    startDateTime: new Date(Date.now() - 1 * 86400000).toISOString().slice(0, 16),
    reassignmentHistory: [],
    createdAt: new Date(Date.now() - 1 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 86400000).toISOString(),
  },
  {
    id: 'tsk_4',
    taskCode: 'TSK-104',
    title: 'Optimize API Response Caching for Search Index',
    description: 'Implement Redis TTL caching layer for full-text queries to reduce database read pressure.',
    category: 'Backend',
    priority: 'high',
    status: 'reassigned',
    assignedToUserId: 'EMP101',
    assignedToUserName: 'David Chen',
    assignedByUserId: 'ADMIN01',
    assignedByUserName: 'Sarah Jenkins (Admin)',
    startDateTime: new Date(Date.now() - 3 * 86400000).toISOString().slice(0, 16),
    approxCompletionDateTime: new Date(Date.now() + 2 * 86400000).toISOString().slice(0, 16),
    employeeAcceptanceNotes: 'Took over from Marcus due to backend scope changes.',
    acceptedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    reassignmentHistory: [
      {
        id: 're_1',
        fromUserId: 'EMP103',
        fromUserName: 'Marcus Vance',
        toUserId: 'EMP101',
        toUserName: 'David Chen',
        reassignedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
        reassignedByUserId: 'ADMIN01',
        reassignedByUserName: 'Sarah Jenkins (Admin)',
        reason: 'Shifted focus to senior backend specialist for Redis cluster configuration.',
        previousApproxCompletionDate: new Date(Date.now() + 3 * 86400000).toISOString().slice(0, 16),
      }
    ],
    createdAt: new Date(Date.now() - 4 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
  }
];

export const DEFAULT_LEAVE_REQUESTS: LeaveRequest[] = [
  {
    id: 'lv_1',
    requestNumber: 'LV-2026-001',
    userId: 'EMP102',
    userName: 'Elena Rostova',
    userEmail: 'elena.rostova@company.com',
    department: 'Design',
    leaveTypeId: 'lt_1',
    leaveTypeName: 'Casual Leave',
    startDate: new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10),
    endDate: new Date(Date.now() + 8 * 86400000).toISOString().slice(0, 10),
    totalDays: 2,
    reason: 'Attending family wedding ceremony and personal travel.',
    status: 'approved',
    appliedAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    reviewedByUserId: 'ADMIN01',
    reviewedByUserName: 'Sarah Jenkins (Admin)',
    reviewedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    reviewerRemarks: 'Approved. Handover is documented.',
    emailSentTo: ['admin@company.com', 'elena.rostova@company.com'],
    emailSentAt: new Date(Date.now() - 3 * 86400000).toISOString(),
  },
  {
    id: 'lv_2',
    requestNumber: 'LV-2026-002',
    userId: 'EMP101',
    userName: 'David Chen',
    userEmail: 'david.chen@company.com',
    department: 'Engineering',
    leaveTypeId: 'lt_2',
    leaveTypeName: 'Sick Leave',
    startDate: new Date(Date.now() + 3 * 86400000).toISOString().slice(0, 10),
    endDate: new Date(Date.now() + 3 * 86400000).toISOString().slice(0, 10),
    totalDays: 1,
    reason: 'Scheduled dental procedure recovery.',
    status: 'pending',
    appliedAt: new Date(Date.now() - 1 * 86400000).toISOString(),
    emailSentTo: ['admin@company.com', 'david.chen@company.com'],
    emailSentAt: new Date(Date.now() - 1 * 86400000).toISOString(),
  }
];

class StorageService {
  private listeners: Set<() => void> = new Set();

  constructor() {
    this.initStorage();
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    this.listeners.forEach(fn => fn());
  }

  public initStorage(forceBlank: boolean = false) {
    if (forceBlank) {
      // Clean blank data with just the initial Admin account
      const cleanAdmin: User = {
        id: 'ADMIN01',
        name: 'Administrator',
        email: 'admin@company.com',
        password: 'password123',
        role: 'admin',
        designation: 'Master Admin',
        department: 'Administration',
        status: 'active',
        createdAt: new Date().toISOString(),
      };
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify([cleanAdmin]));
      localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify([]));
      localStorage.setItem(STORAGE_KEYS.LEAVE_TYPES, JSON.stringify(DEFAULT_LEAVE_TYPES));
      localStorage.setItem(STORAGE_KEYS.LEAVE_REQUESTS, JSON.stringify([]));
      localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify([
        {
          id: 'log_0',
          timestamp: new Date().toISOString(),
          userId: 'ADMIN01',
          userName: 'Administrator',
          action: 'SYSTEM_INITIALIZED',
          details: 'Initialized fresh blank database with Master Admin account.',
          type: 'system'
        }
      ]));
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, 'ADMIN01');
      localStorage.setItem(STORAGE_KEYS.INITIALIZED, 'true');
      this.notify();
      return;
    }

    const isInitialized = localStorage.getItem(STORAGE_KEYS.INITIALIZED);
    if (!isInitialized) {
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(DEFAULT_USERS));
      localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(DEFAULT_TASKS));
      localStorage.setItem(STORAGE_KEYS.LEAVE_TYPES, JSON.stringify(DEFAULT_LEAVE_TYPES));
      localStorage.setItem(STORAGE_KEYS.LEAVE_REQUESTS, JSON.stringify(DEFAULT_LEAVE_REQUESTS));
      localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify([
        {
          id: 'log_init',
          timestamp: new Date().toISOString(),
          userId: 'ADMIN01',
          userName: 'Sarah Jenkins (Admin)',
          action: 'SYSTEM_STARTUP',
          details: 'Initialized Employee Management System with standard seed records.',
          type: 'system'
        }
      ]));
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, 'ADMIN01');
      localStorage.setItem(STORAGE_KEYS.INITIALIZED, 'true');
    }
  }

  // Reset database with demo samples
  public resetWithDemoData() {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(DEFAULT_USERS));
    localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(DEFAULT_TASKS));
    localStorage.setItem(STORAGE_KEYS.LEAVE_TYPES, JSON.stringify(DEFAULT_LEAVE_TYPES));
    localStorage.setItem(STORAGE_KEYS.LEAVE_REQUESTS, JSON.stringify(DEFAULT_LEAVE_REQUESTS));
    localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify([
      {
        id: 'log_reset_' + Date.now(),
        timestamp: new Date().toISOString(),
        userId: 'ADMIN01',
        userName: 'Sarah Jenkins (Admin)',
        action: 'DEMO_DATA_LOADED',
        details: 'Reloaded complete demo dataset with users, tasks, and leave logs.',
        type: 'system'
      }
    ]));
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, 'ADMIN01');
    this.notify();
  }

  // --- USERS MANAGEMENT ---
  public getUsers(): User[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.USERS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  public getUserById(id: string): User | undefined {
    return this.getUsers().find(u => u.id === id);
  }

  public getCurrentUserId(): string | null {
    return localStorage.getItem(STORAGE_KEYS.CURRENT_USER_ID) || null;
  }

  public setCurrentUserId(id: string | null) {
    if (id) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, id);
    } else {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER_ID);
    }
    this.notify();
  }

  public createUser(user: Omit<User, 'createdAt'>): { success: boolean; message: string; user?: User } {
    const users = this.getUsers();
    const cleanId = user.id.trim();

    if (!cleanId) {
      return { success: false, message: 'User ID cannot be empty.' };
    }

    if (users.some(u => u.id.toLowerCase() === cleanId.toLowerCase())) {
      return { success: false, message: `User ID "${cleanId}" already exists! Please pick a unique User ID.` };
    }

    const newUser: User = {
      ...user,
      id: cleanId,
      createdAt: new Date().toISOString(),
    };

    users.push(newUser);
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));

    this.addLog({
      userId: this.getCurrentUserId() || 'ADMIN01',
      userName: this.getUserById(this.getCurrentUserId() || '')?.name || 'Admin',
      action: 'USER_CREATED',
      details: `Created new employee profile: ${newUser.name} (User ID: ${newUser.id}, Role: ${newUser.role})`,
      type: 'user',
    });

    this.notify();
    return { success: true, message: 'User successfully created.', user: newUser };
  }

  public updateUser(oldUserId: string, updatedData: Partial<User>): { success: boolean; message: string } {
    const users = this.getUsers();
    const userIndex = users.findIndex(u => u.id === oldUserId);

    if (userIndex === -1) {
      return { success: false, message: 'User not found.' };
    }

    const newUserId = updatedData.id ? updatedData.id.trim() : oldUserId;

    // If User ID is changing, check uniqueness across other users
    if (newUserId.toLowerCase() !== oldUserId.toLowerCase()) {
      if (users.some(u => u.id.toLowerCase() === newUserId.toLowerCase() && u.id !== oldUserId)) {
        return { success: false, message: `New User ID "${newUserId}" is already in use by another account.` };
      }
    }

    const updatedUser: User = {
      ...users[userIndex],
      ...updatedData,
      id: newUserId,
      updatedAt: new Date().toISOString(),
    };

    users[userIndex] = updatedUser;
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));

    // CRITICAL: If User ID changed, propagate to all Tasks, Leaves, Logs, and Session
    if (newUserId !== oldUserId) {
      this.cascadeUserIdChange(oldUserId, newUserId, updatedUser.name);
    }

    this.addLog({
      userId: this.getCurrentUserId() || 'ADMIN01',
      userName: this.getUserById(this.getCurrentUserId() || '')?.name || 'Admin',
      action: 'USER_UPDATED',
      details: `Updated details for ${updatedUser.name} ${oldUserId !== newUserId ? `(ID changed from ${oldUserId} to ${newUserId})` : ''}`,
      type: 'user',
    });

    this.notify();
    return { success: true, message: 'User updated successfully.' };
  }

  // Cascade User ID changes throughout the entire system for data consistency
  private cascadeUserIdChange(oldUserId: string, newUserId: string, newUserName: string) {
    // 1. Update current session if the active user was renamed
    if (this.getCurrentUserId() === oldUserId) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, newUserId);
    }

    // 2. Cascade in Tasks
    const tasks = this.getTasks();
    let tasksModified = false;
    const updatedTasks = tasks.map(t => {
      let modified = false;
      const copy = { ...t };

      if (copy.assignedToUserId === oldUserId) {
        copy.assignedToUserId = newUserId;
        copy.assignedToUserName = newUserName;
        modified = true;
      }
      if (copy.assignedByUserId === oldUserId) {
        copy.assignedByUserId = newUserId;
        copy.assignedByUserName = newUserName;
        modified = true;
      }
      if (copy.completedByUserId === oldUserId) {
        copy.completedByUserId = newUserId;
        modified = true;
      }

      if (copy.reassignmentHistory && copy.reassignmentHistory.length > 0) {
        copy.reassignmentHistory = copy.reassignmentHistory.map(r => {
          const rCopy = { ...r };
          if (rCopy.fromUserId === oldUserId) {
            rCopy.fromUserId = newUserId;
            rCopy.fromUserName = newUserName;
          }
          if (rCopy.toUserId === oldUserId) {
            rCopy.toUserId = newUserId;
            rCopy.toUserName = newUserName;
          }
          if (rCopy.reassignedByUserId === oldUserId) {
            rCopy.reassignedByUserId = newUserId;
            rCopy.reassignedByUserName = newUserName;
          }
          return rCopy;
        });
        modified = true;
      }

      if (modified) {
        tasksModified = true;
      }
      return copy;
    });

    if (tasksModified) {
      localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(updatedTasks));
    }

    // 3. Cascade in Leave Requests
    const leaves = this.getLeaveRequests();
    let leavesModified = false;
    const updatedLeaves = leaves.map(l => {
      let modified = false;
      const copy = { ...l };
      if (copy.userId === oldUserId) {
        copy.userId = newUserId;
        copy.userName = newUserName;
        modified = true;
      }
      if (copy.reviewedByUserId === oldUserId) {
        copy.reviewedByUserId = newUserId;
        copy.reviewedByUserName = newUserName;
        modified = true;
      }
      if (modified) {
        leavesModified = true;
      }
      return copy;
    });

    if (leavesModified) {
      localStorage.setItem(STORAGE_KEYS.LEAVE_REQUESTS, JSON.stringify(updatedLeaves));
    }
  }

  public toggleUserStatus(userId: string): { success: boolean; newStatus: 'active' | 'restricted' } {
    const users = this.getUsers();
    const user = users.find(u => u.id === userId);
    if (!user) return { success: false, newStatus: 'active' };

    const newStatus = user.status === 'active' ? 'restricted' : 'active';
    user.status = newStatus;
    user.updatedAt = new Date().toISOString();

    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));

    this.addLog({
      userId: this.getCurrentUserId() || 'ADMIN01',
      userName: this.getUserById(this.getCurrentUserId() || '')?.name || 'Admin',
      action: 'USER_ACCESS_RESTRICTION',
      details: `${newStatus === 'restricted' ? 'Restricted' : 'Restored'} access permissions for ${user.name} (${user.id})`,
      type: 'user',
    });

    this.notify();
    return { success: true, newStatus };
  }

  public deleteUser(userId: string): { success: boolean; message: string } {
    const users = this.getUsers();
    const user = users.find(u => u.id === userId);
    if (!user) return { success: false, message: 'User not found' };

    if (user.role === 'admin' && users.filter(u => u.role === 'admin').length <= 1) {
      return { success: false, message: 'Cannot delete the only administrative account in the system.' };
    }

    const filtered = users.filter(u => u.id !== userId);
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(filtered));

    if (this.getCurrentUserId() === userId) {
      this.setCurrentUserId(null);
    }

    this.addLog({
      userId: this.getCurrentUserId() || 'ADMIN01',
      userName: this.getUserById(this.getCurrentUserId() || '')?.name || 'Admin',
      action: 'USER_DELETED',
      details: `Removed employee account: ${user.name} (${user.id})`,
      type: 'user',
    });

    this.notify();
    return { success: true, message: 'User deleted successfully.' };
  }

  // --- TASKS MANAGEMENT ---
  public getTasks(): Task[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.TASKS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  public getTaskById(id: string): Task | undefined {
    return this.getTasks().find(t => t.id === id);
  }

  public createTask(taskData: {
    title: string;
    description: string;
    category: string;
    priority: Task['priority'];
    assignedToUserId: string;
    startDateTime: string;
  }): { success: boolean; task: Task } {
    const tasks = this.getTasks();
    const assignedUser = this.getUserById(taskData.assignedToUserId);
    const currentUser = this.getUserById(this.getCurrentUserId() || '') || {
      id: 'ADMIN01',
      name: 'System Admin',
    };

    const taskCode = `TSK-${100 + tasks.length + 1}`;
    const newTask: Task = {
      id: 'tsk_' + Date.now(),
      taskCode,
      title: taskData.title,
      description: taskData.description,
      category: taskData.category || 'General',
      priority: taskData.priority,
      status: 'assigned', // Requires employee acceptance
      assignedToUserId: taskData.assignedToUserId,
      assignedToUserName: assignedUser ? assignedUser.name : taskData.assignedToUserId,
      assignedByUserId: currentUser.id,
      assignedByUserName: currentUser.name,
      startDateTime: taskData.startDateTime,
      reassignmentHistory: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    tasks.unshift(newTask);
    localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));

    this.addLog({
      userId: currentUser.id,
      userName: currentUser.name,
      action: 'TASK_CREATED',
      details: `Created task ${taskCode}: "${newTask.title}" assigned to ${newTask.assignedToUserName} (Start: ${newTask.startDateTime})`,
      type: 'task',
    });

    this.notify();
    return { success: true, task: newTask };
  }

  // Employee accepts task & inputs Approximate Completion Date/Time
  public acceptTask(taskId: string, inputData: {
    approxCompletionDateTime: string;
    notes?: string;
  }): { success: boolean; message: string } {
    const tasks = this.getTasks();
    const index = tasks.findIndex(t => t.id === taskId);
    if (index === -1) return { success: false, message: 'Task not found' };

    const currentUserId = this.getCurrentUserId();
    const currentUser = this.getUserById(currentUserId || '');

    tasks[index] = {
      ...tasks[index],
      status: 'accepted',
      approxCompletionDateTime: inputData.approxCompletionDateTime,
      employeeAcceptanceNotes: inputData.notes || '',
      acceptedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));

    this.addLog({
      userId: currentUserId || 'UNKNOWN',
      userName: currentUser?.name || 'Employee',
      action: 'TASK_ACCEPTED',
      details: `Accepted task ${tasks[index].taskCode} with estimated completion at: ${inputData.approxCompletionDateTime}`,
      type: 'task',
    });

    this.notify();
    return { success: true, message: 'Task accepted with estimated completion time.' };
  }

  // Start progress on accepted task
  public setTaskInProgress(taskId: string): { success: boolean } {
    const tasks = this.getTasks();
    const index = tasks.findIndex(t => t.id === taskId);
    if (index === -1) return { success: false };

    tasks[index].status = 'in_progress';
    tasks[index].updatedAt = new Date().toISOString();
    localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
    this.notify();
    return { success: true };
  }

  // Complete task with Actual Completion Date/Time
  public completeTask(taskId: string, inputData: {
    actualCompletedDateTime: string;
    completionNotes?: string;
  }): { success: boolean; message: string } {
    const tasks = this.getTasks();
    const index = tasks.findIndex(t => t.id === taskId);
    if (index === -1) return { success: false, message: 'Task not found' };

    const currentUserId = this.getCurrentUserId();
    const currentUser = this.getUserById(currentUserId || '');

    tasks[index] = {
      ...tasks[index],
      status: 'completed',
      actualCompletedDateTime: inputData.actualCompletedDateTime,
      completionNotes: inputData.completionNotes || '',
      completedByUserId: currentUserId || tasks[index].assignedToUserId,
      updatedAt: new Date().toISOString(),
    };

    localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));

    this.addLog({
      userId: currentUserId || 'UNKNOWN',
      userName: currentUser?.name || 'Employee',
      action: 'TASK_COMPLETED',
      details: `Completed task ${tasks[index].taskCode} on ${inputData.actualCompletedDateTime}`,
      type: 'task',
    });

    this.notify();
    return { success: true, message: 'Task marked as completed.' };
  }

  // Reassign task to same employee or another employee
  public reassignTask(taskId: string, inputData: {
    newAssignedToUserId: string;
    reason: string;
    newStartDateTime?: string;
  }): { success: boolean; message: string } {
    const tasks = this.getTasks();
    const index = tasks.findIndex(t => t.id === taskId);
    if (index === -1) return { success: false, message: 'Task not found' };

    const targetTask = tasks[index];
    const newAssignee = this.getUserById(inputData.newAssignedToUserId);
    const currentUser = this.getUserById(this.getCurrentUserId() || '') || {
      id: 'ADMIN01',
      name: 'Administrator',
    };

    if (!newAssignee) {
      return { success: false, message: 'Target employee not found.' };
    }

    const record = {
      id: 're_' + Date.now(),
      fromUserId: targetTask.assignedToUserId,
      fromUserName: targetTask.assignedToUserName,
      toUserId: newAssignee.id,
      toUserName: newAssignee.name,
      reassignedAt: new Date().toISOString(),
      reassignedByUserId: currentUser.id,
      reassignedByUserName: currentUser.name,
      reason: inputData.reason,
      previousApproxCompletionDate: targetTask.approxCompletionDateTime,
    };

    tasks[index] = {
      ...targetTask,
      assignedToUserId: newAssignee.id,
      assignedToUserName: newAssignee.name,
      status: 'assigned', // Reset to assigned so new employee provides acceptance and estimation
      startDateTime: inputData.newStartDateTime || new Date().toISOString().slice(0, 16),
      approxCompletionDateTime: undefined,
      employeeAcceptanceNotes: undefined,
      acceptedAt: undefined,
      reassignmentHistory: [...(targetTask.reassignmentHistory || []), record],
      updatedAt: new Date().toISOString(),
    };

    localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));

    this.addLog({
      userId: currentUser.id,
      userName: currentUser.name,
      action: 'TASK_REASSIGNED',
      details: `Reassigned task ${targetTask.taskCode} from ${record.fromUserName} to ${record.toUserName}. Reason: ${inputData.reason}`,
      type: 'task',
    });

    this.notify();
    return { success: true, message: `Task successfully reassigned to ${newAssignee.name}.` };
  }

  public deleteTask(taskId: string): { success: boolean } {
    const tasks = this.getTasks().filter(t => t.id !== taskId);
    localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
    this.notify();
    return { success: true };
  }

  // --- LEAVE TYPES MASTER ---
  public getLeaveTypes(): LeaveType[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.LEAVE_TYPES);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  public createLeaveType(data: Omit<LeaveType, 'id'>): { success: boolean; message: string; leaveType?: LeaveType } {
    const types = this.getLeaveTypes();
    if (types.some(t => t.code.toUpperCase() === data.code.toUpperCase())) {
      return { success: false, message: `Leave Type Code "${data.code}" already exists.` };
    }

    const newType: LeaveType = {
      ...data,
      id: 'lt_' + Date.now(),
      code: data.code.toUpperCase().trim(),
    };

    types.push(newType);
    localStorage.setItem(STORAGE_KEYS.LEAVE_TYPES, JSON.stringify(types));

    this.addLog({
      userId: this.getCurrentUserId() || 'ADMIN01',
      userName: 'Administrator',
      action: 'LEAVE_TYPE_CREATED',
      details: `Created new leave category: ${newType.name} (${newType.code}, Quota: ${newType.quotaDays} days)`,
      type: 'leave',
    });

    this.notify();
    return { success: true, message: 'Leave type created successfully.', leaveType: newType };
  }

  public updateLeaveType(id: string, data: Partial<LeaveType>): { success: boolean; message: string } {
    const types = this.getLeaveTypes();
    const idx = types.findIndex(t => t.id === id);
    if (idx === -1) return { success: false, message: 'Leave type not found.' };

    types[idx] = {
      ...types[idx],
      ...data,
      code: data.code ? data.code.toUpperCase().trim() : types[idx].code,
    };

    localStorage.setItem(STORAGE_KEYS.LEAVE_TYPES, JSON.stringify(types));
    this.notify();
    return { success: true, message: 'Leave type updated successfully.' };
  }

  public deleteLeaveType(id: string): { success: boolean; message: string } {
    const types = this.getLeaveTypes().filter(t => t.id !== id);
    localStorage.setItem(STORAGE_KEYS.LEAVE_TYPES, JSON.stringify(types));
    this.notify();
    return { success: true, message: 'Leave type deleted.' };
  }

  // --- LEAVE REQUESTS & EMAIL SHARING ---
  public getLeaveRequests(): LeaveRequest[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.LEAVE_REQUESTS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  public createLeaveRequest(data: {
    userId: string;
    leaveTypeId: string;
    startDate: string;
    endDate: string;
    reason: string;
    shareEmailAddresses?: string[];
  }): { success: boolean; message: string; leaveRequest?: LeaveRequest } {
    const user = this.getUserById(data.userId);
    const leaveType = this.getLeaveTypes().find(lt => lt.id === data.leaveTypeId);
    const leaves = this.getLeaveRequests();

    if (!user || !leaveType) {
      return { success: false, message: 'Invalid employee or leave type.' };
    }

    const start = new Date(data.startDate);
    const end = new Date(data.endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    const requestNumber = `LV-${new Date().getFullYear()}-${String(leaves.length + 1).padStart(3, '0')}`;
    
    // Find admin emails to automatically share leave request
    const adminEmails = this.getUsers()
      .filter(u => u.role === 'admin' && u.email)
      .map(u => u.email);
    
    const emailRecipients = Array.from(new Set([
      user.email,
      ...adminEmails,
      ...(data.shareEmailAddresses || [])
    ].filter(Boolean)));

    const newRequest: LeaveRequest = {
      id: 'lv_' + Date.now(),
      requestNumber,
      userId: user.id,
      userName: user.name,
      userEmail: user.email,
      department: user.department,
      leaveTypeId: leaveType.id,
      leaveTypeName: leaveType.name,
      startDate: data.startDate,
      endDate: data.endDate,
      totalDays: diffDays > 0 ? diffDays : 1,
      reason: data.reason,
      status: 'pending',
      appliedAt: new Date().toISOString(),
      emailSentTo: emailRecipients,
      emailSentAt: new Date().toISOString(),
    };

    leaves.unshift(newRequest);
    localStorage.setItem(STORAGE_KEYS.LEAVE_REQUESTS, JSON.stringify(leaves));

    this.addLog({
      userId: user.id,
      userName: user.name,
      action: 'LEAVE_APPLIED',
      details: `Applied for ${diffDays} day(s) ${leaveType.name} (${data.startDate} to ${data.endDate}). Shared to emails: ${emailRecipients.join(', ')}`,
      type: 'leave',
    });

    this.notify();
    return { success: true, message: `Leave request submitted and notification shared to ${emailRecipients.length} email recipient(s).`, leaveRequest: newRequest };
  }

  public updateLeaveStatus(requestId: string, status: 'approved' | 'rejected', remarks?: string): { success: boolean; message: string } {
    const leaves = this.getLeaveRequests();
    const idx = leaves.findIndex(l => l.id === requestId);
    if (idx === -1) return { success: false, message: 'Leave request not found.' };

    const reviewer = this.getUserById(this.getCurrentUserId() || '') || {
      id: 'ADMIN01',
      name: 'System Admin',
    };

    leaves[idx] = {
      ...leaves[idx],
      status,
      reviewedByUserId: reviewer.id,
      reviewedByUserName: reviewer.name,
      reviewedAt: new Date().toISOString(),
      reviewerRemarks: remarks || '',
    };

    localStorage.setItem(STORAGE_KEYS.LEAVE_REQUESTS, JSON.stringify(leaves));

    this.addLog({
      userId: reviewer.id,
      userName: reviewer.name,
      action: status === 'approved' ? 'LEAVE_APPROVED' : 'LEAVE_REJECTED',
      details: `${status === 'approved' ? 'Approved' : 'Rejected'} leave request ${leaves[idx].requestNumber} for ${leaves[idx].userName}. Remarks: ${remarks || 'None'}`,
      type: 'leave',
    });

    this.notify();
    return { success: true, message: `Leave request marked as ${status}.` };
  }

  // --- LOGS & EFFICIENCY CALCULATIONS ---
  public getLogs(): ActivityLog[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.LOGS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  public addLog(logData: Omit<ActivityLog, 'id' | 'timestamp'>) {
    const logs = this.getLogs();
    const newLog: ActivityLog = {
      ...logData,
      id: 'log_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      timestamp: new Date().toISOString(),
    };
    logs.unshift(newLog);
    // Keep max 200 logs
    if (logs.length > 200) logs.pop();
    localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(logs));
  }

  // Compute Employee-Wise Reports and Efficiency
  public getEmployeeEfficiencyStats(employeeId?: string): EmployeeEfficiencyStats[] {
    const users = this.getUsers().filter(u => employeeId ? u.id === employeeId : true);
    const tasks = this.getTasks();
    const leaves = this.getLeaveRequests();

    return users.map(user => {
      const userTasks = tasks.filter(t => t.assignedToUserId === user.id);
      const totalAssigned = userTasks.length;
      const pendingAcceptance = userTasks.filter(t => t.status === 'assigned').length;
      const inProgress = userTasks.filter(t => t.status === 'in_progress' || t.status === 'accepted').length;
      const completed = userTasks.filter(t => t.status === 'completed').length;
      const reassigned = userTasks.filter(t => (t.reassignmentHistory && t.reassignmentHistory.length > 0)).length;

      // Completed time analysis
      let completedOnTime = 0;
      let completedDelayed = 0;
      let totalEstHours = 0;
      let totalActualHours = 0;
      let measuredTasksCount = 0;

      userTasks.filter(t => t.status === 'completed').forEach(task => {
        if (task.startDateTime && task.actualCompletedDateTime) {
          const start = new Date(task.startDateTime).getTime();
          const actualEnd = new Date(task.actualCompletedDateTime).getTime();
          const actualHours = Math.max(0.5, (actualEnd - start) / (1000 * 60 * 60));
          totalActualHours += actualHours;
          measuredTasksCount++;

          if (task.approxCompletionDateTime) {
            const approxEnd = new Date(task.approxCompletionDateTime).getTime();
            const estHours = Math.max(0.5, (approxEnd - start) / (1000 * 60 * 60));
            totalEstHours += estHours;

            if (actualEnd <= approxEnd + (15 * 60 * 1000)) { // 15-minute grace threshold
              completedOnTime++;
            } else {
              completedDelayed++;
            }
          } else {
            completedOnTime++;
          }
        }
      });

      const avgEstimatedHours = measuredTasksCount > 0 ? +(totalEstHours / measuredTasksCount).toFixed(1) : 0;
      const avgActualHours = measuredTasksCount > 0 ? +(totalActualHours / measuredTasksCount).toFixed(1) : 0;
      const onTimeRate = completed > 0 ? Math.round((completedOnTime / completed) * 100) : (totalAssigned === 0 ? 100 : 0);

      // Efficiency calculation formula:
      // Weighting: 45% on-time rate + 35% completion ratio + 20% estimation turnaround ratio
      let turnaroundRatio = 1.0;
      if (avgEstimatedHours > 0 && avgActualHours > 0) {
        turnaroundRatio = Math.min(1.2, avgEstimatedHours / avgActualHours);
      }
      
      const completionRatio = totalAssigned > 0 ? completed / totalAssigned : 1.0;
      
      let rawEfficiency = (onTimeRate * 0.45) + ((completionRatio * 100) * 0.35) + ((Math.min(turnaroundRatio, 1) * 100) * 0.20);
      if (totalAssigned === 0) rawEfficiency = 100;

      const efficiencyScore = Math.min(100, Math.max(0, Math.round(rawEfficiency)));

      const userLeaves = leaves.filter(l => l.userId === user.id && l.status === 'approved');
      const totalLeavesTaken = userLeaves.reduce((acc, curr) => acc + curr.totalDays, 0);

      return {
        userId: user.id,
        userName: user.name,
        userRole: user.role,
        department: user.department,
        designation: user.designation,
        status: user.status,
        totalAssignedTasks: totalAssigned,
        pendingAcceptanceTasks: pendingAcceptance,
        inProgressTasks: inProgress,
        completedTasks: completed,
        reassignedTasks: reassigned,
        completedOnTime,
        completedDelayed,
        avgEstimatedHours,
        avgActualHours,
        efficiencyScore,
        onTimeCompletionRate: onTimeRate,
        totalLeavesTaken,
      };
    });
  }

  // Export full system backup JSON
  public exportData(): string {
    const backup = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      users: this.getUsers(),
      tasks: this.getTasks(),
      leaveTypes: this.getLeaveTypes(),
      leaveRequests: this.getLeaveRequests(),
      logs: this.getLogs(),
    };
    return JSON.stringify(backup, null, 2);
  }

  public exportDatabaseJSON(): string {
    return this.exportData();
  }

  public resetToBlankState() {
    const cleanAdmin: User = {
      id: 'ADMIN01',
      name: 'System Administrator',
      email: 'admin@company.com',
      password: 'admin',
      role: 'admin',
      designation: 'Managing Director',
      department: 'Executive Administration',
      status: 'active',
      createdAt: new Date().toISOString(),
    };
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify([cleanAdmin]));
    localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.LEAVE_TYPES, JSON.stringify(DEFAULT_LEAVE_TYPES));
    localStorage.setItem(STORAGE_KEYS.LEAVE_REQUESTS, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify([
      {
        id: 'log_blank_' + Date.now(),
        timestamp: new Date().toISOString(),
        userId: 'ADMIN01',
        userName: 'Administrator',
        action: 'SYSTEM_CLEARED',
        details: 'Reset system to blank dataset with Master Admin account.',
        type: 'system'
      }
    ]));
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, 'ADMIN01');
    this.notify();
  }

  public resetToInitialSample() {
    this.resetWithDemoData();
  }

  // Import and restore system backup JSON
  public importData(jsonString: string): { success: boolean; message: string } {
    try {
      const data = JSON.parse(jsonString);
      if (!Array.isArray(data.users)) {
        return { success: false, message: 'Invalid backup file structure: users array missing.' };
      }

      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(data.users || []));
      localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(data.tasks || []));
      localStorage.setItem(STORAGE_KEYS.LEAVE_TYPES, JSON.stringify(data.leaveTypes || DEFAULT_LEAVE_TYPES));
      localStorage.setItem(STORAGE_KEYS.LEAVE_REQUESTS, JSON.stringify(data.leaveRequests || []));
      localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(data.logs || []));
      
      this.addLog({
        userId: 'ADMIN01',
        userName: 'Administrator',
        action: 'BACKUP_RESTORED',
        details: 'Imported and restored database snapshot from JSON backup.',
        type: 'system'
      });

      this.notify();
      return { success: true, message: 'Data backup successfully restored!' };
    } catch {
      return { success: false, message: 'Failed to parse backup JSON file.' };
    }
  }
}

export const storage = new StorageService();
