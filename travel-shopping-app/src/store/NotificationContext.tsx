import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useAuth, API_BASE } from './AuthContext';

export type NotificationType = 'info' | 'alert' | 'promo';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  timestamp: Date;
  isRead: boolean;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'isRead'>) => void;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  clearAll: () => Promise<void>;
  refreshNotifications: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const { token, isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const fetchNotifications = async () => {
    if (!token) return;
    try {
      const response = await fetch(`${API_BASE}/notifications`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.status === 401) {
        logout();
        return;
      }

      const data = await response.json();
      if (data.success) {
        // Convert API format to frontend format
        const formatted = data.notifications.map((n: any) => ({
          id: n._id,
          title: n.title,
          message: n.message,
          type: n.type,
          timestamp: new Date(n.timestamp),
          isRead: n.isRead
        }));
        setNotifications(formatted);
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchNotifications();
    } else {
      setNotifications([]);
    }
  }, [isAuthenticated, token]);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const addNotification = async (item: Omit<Notification, 'id' | 'timestamp' | 'isRead'>) => {
    // In a real app, this would be pushed by the server, but for testing:
    try {
      const response = await fetch(`${API_BASE}/notifications`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(item)
      });
      const data = await response.json();
      if (data.success) {
        const newNotif = {
          id: data.notification._id,
          ...item,
          timestamp: new Date(data.notification.timestamp),
          isRead: false
        };
        setNotifications(prev => [newNotif, ...prev]);
      }
    } catch (error) {
      console.error('Failed to add notification:', error);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      setNotifications(prev =>
        prev.map(n => (n.id === id ? { ...n, isRead: true } : n))
      );
      await fetch(`${API_BASE}/notifications/${id}/read`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      await fetch(`${API_BASE}/notifications/read-all`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  const clearAll = async () => {
    try {
      setNotifications([]);
      await fetch(`${API_BASE}/notifications`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
    } catch (error) {
      console.error('Failed to clear notifications:', error);
    }
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        addNotification,
        markAsRead,
        markAllAsRead,
        clearAll,
        refreshNotifications: fetchNotifications
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

