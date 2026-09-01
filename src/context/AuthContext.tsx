import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { storage } from '../services/storage';

interface AuthContextType {
  currentUser: User | null;
  currentUserId: string | null;
  isAdmin: boolean;
  isManager: boolean;
  isEmployee: boolean;
  isRestricted: boolean;
  login: (userId: string, password: string) => { success: boolean; message: string };
  logout: () => void;
  switchUser: (userId: string) => void;
  updateCurrentUserProfile: (data: Partial<User>) => { success: boolean; message: string };
  usersList: User[];
  canAccessMasterData: boolean;
  canViewAllData: boolean;
  canAssignTasks: boolean;
  canReassignTasks: boolean;
  canChangeUserId: boolean;
  canRestrictUsers: boolean;
  canReviewLeaves: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUserId, setCurrentUserIdState] = useState<string | null>(storage.getCurrentUserId());
  const [usersList, setUsersList] = useState<User[]>(storage.getUsers());

  useEffect(() => {
    const unsubscribe = storage.subscribe(() => {
      setUsersList(storage.getUsers());
      setCurrentUserIdState(storage.getCurrentUserId());
    });
    return () => unsubscribe();
  }, []);

  const currentUser: User | null = usersList.find(u => u.id === currentUserId) || null;

  const isAdmin = currentUser?.role === 'admin';
  const isManager = currentUser?.role === 'manager';
  const isEmployee = currentUser?.role === 'employee';
  const isRestricted = currentUser?.status === 'restricted';

  // Permission policies
  const canAccessMasterData = isAdmin;
  const canViewAllData = isAdmin; // Admin can access all employees data, User can access only user-wise data
  const canAssignTasks = isAdmin || isManager;
  const canReassignTasks = isAdmin || isManager;
  const canChangeUserId = isAdmin;
  const canRestrictUsers = isAdmin;
  const canReviewLeaves = isAdmin || isManager;

  const login = (userId: string, password: string) => {
    const users = storage.getUsers();
    const user = users.find(u => u.id.toLowerCase() === userId.trim().toLowerCase());

    if (!user) {
      return { success: false, message: 'Invalid User ID. Please check and try again.' };
    }

    if (user.password !== password) {
      return { success: false, message: 'Incorrect password entered.' };
    }

    if (user.status === 'restricted') {
      return { 
        success: false, 
        message: 'Your account access has been restricted by the Administrator. Please contact HR/Admin.' 
      };
    }

    storage.setCurrentUserId(user.id);
    setCurrentUserIdState(user.id);

    storage.addLog({
      userId: user.id,
      userName: user.name,
      action: 'USER_LOGIN',
      details: `User ${user.name} logged into the system.`,
      type: 'user',
    });

    return { success: true, message: 'Logged in successfully.' };
  };

  const logout = () => {
    if (currentUser) {
      storage.addLog({
        userId: currentUser.id,
        userName: currentUser.name,
        action: 'USER_LOGOUT',
        details: `User ${currentUser.name} signed out.`,
        type: 'user',
      });
    }
    storage.setCurrentUserId(null);
    setCurrentUserIdState(null);
  };

  const switchUser = (userId: string) => {
    const user = storage.getUserById(userId);
    if (!user) return;
    storage.setCurrentUserId(user.id);
    setCurrentUserIdState(user.id);
  };

  const updateCurrentUserProfile = (data: Partial<User>) => {
    if (!currentUser) return { success: false, message: 'No active session.' };
    return storage.updateUser(currentUser.id, data);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        currentUserId,
        isAdmin,
        isManager,
        isEmployee,
        isRestricted,
        login,
        logout,
        switchUser,
        updateCurrentUserProfile,
        usersList,
        canAccessMasterData,
        canViewAllData,
        canAssignTasks,
        canReassignTasks,
        canChangeUserId,
        canRestrictUsers,
        canReviewLeaves,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
