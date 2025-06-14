import { User } from '../types/types';

export const hasAdminAccess = (user: User | null): boolean => {
  return user?.role === 'admin';
};

export const hasTechnicianAccess = (user: User | null): boolean => {
  return user?.role === 'technician' || hasAdminAccess(user);
};

export const isAuthenticated = (): boolean => {
  return !!localStorage.getItem('token');
};

export const getUserRole = (): string | null => {
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  return user?.role || null;
};