import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { notificationService } from '../services/notificationService';
import { userService } from '../services/userService';
import { Notification, User } from '../types';
import { 
  Send, 
  Bell, 
  Users as UsersIcon, 
  MessageSquare,
  Globe,
  Calendar
} from 'lucide-react';
import toast from 'react-hot-toast';

const Notifications: React.FC = () => {
  const { t, currentLanguage } = useLanguage();
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [targetType, setTargetType] = useState<'all' | 'specific'>('all');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [showUserSelector, setShowUserSelector] = useState(false);

  useEffect(() => {
    fetchUsers();
    fetchNotifications();
  }, []);

  const fetchUsers = async () => {
    try {
      const allUsers = await userService.getAllUsers();
      setUsers(allUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchNotifications = async () => {
    try {
      const allNotifications = await notificationService.getAllNotifications();
      setNotifications(allNotifications);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const handleSendNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !message.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      if (targetType === 'all') {
        await notificationService.sendBroadcast(title, message, currentLanguage.code);
      } else {
        if (selectedUsers.length === 0) {
          toast.error('Please select at least one user');
          return;
        }
        await notificationService.sendCustomAlert(selectedUsers, title, message, currentLanguage.code);
      }
      
      setTitle('');
      setMessage('');
      setSelectedUsers([]);
      await fetchNotifications();
      toast.success(t('notifications.success'));
    } catch (error) {
      console.error('Error sending notification:', error);
      toast.error('Failed to send notification');
    } finally {
      setLoading(false);
    }
  };

  const toggleUserSelection = (userId: string) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const getNotificationTypeColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'bg-green-100 text-green-800';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800';
      case 'error':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">{t('notifications.title')}</h1>
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <Globe className="h-4 w-4" />
          <span>Language: {currentLanguage.name}</span>
        </div>
      </div>

      {/* Send Notification Form */}
      <div className="bg-white shadow rounded-lg p-6">
        <form onSubmit={handleSendNotification} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('notifications.messageTitle')}
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="Enter notification title..."
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('notifications.message')}
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="Enter your message..."
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Target Audience
            </label>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="targetType"
                  value="all"
                  checked={targetType === 'all'}
                  onChange={(e) => setTargetType(e.target.value as 'all' | 'specific')}
                  className="mr-2"
                />
                <UsersIcon className="h-4 w-4 mr-2" />
                All Users
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="targetType"
                  value="specific"
                  checked={targetType === 'specific'}
                  onChange={(e) => setTargetType(e.target.value as 'all' | 'specific')}
                  className="mr-2"
                />
                <MessageSquare className="h-4 w-4 mr-2" />
                Specific Users ({selectedUsers.length} selected)
              </label>
            </div>
          </div>

          {targetType === 'specific' && (
            <div>
              <button
                type="button"
                onClick={() => setShowUserSelector(!showUserSelector)}
                className="mb-3 px-4 py-2 text-sm font-medium text-primary-600 bg-primary-50 rounded-md hover:bg-primary-100"
              >
                {showUserSelector ? 'Hide' : 'Show'} User Selection
              </button>
              
              {showUserSelector && (
                <div className="max-h-60 overflow-y-auto border border-gray-200 rounded-md p-3">
                  <div className="space-y-2">
                    {users.map((user) => (
                      <label key={user.id} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={selectedUsers.includes(user.id)}
                          onChange={() => toggleUserSelection(user.id)}
                          className="mr-3"
                        />
                        <div className="flex-1">
                          <div className="text-sm font-medium text-gray-900">{user.name}</div>
                          <div className="text-xs text-gray-500">{user.email}</div>
                        </div>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          user.subscriptionStatus === 'active' 
                            ? 'bg-green-100 text-green-800'
                            : user.subscriptionStatus === 'expired'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {user.subscriptionStatus}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="flex items-center space-x-2 px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <Send className="h-4 w-4" />
              )}
              <span>{loading ? 'Sending...' : t('notifications.send')}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Notification History */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Notification History</h3>
        </div>
        <div className="divide-y divide-gray-200">
          {notifications.length === 0 ? (
            <div className="px-6 py-8 text-center text-gray-500">
              <Bell className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-2">No notifications sent yet</p>
            </div>
          ) : (
            notifications.map((notification) => (
              <div key={notification.id} className="px-6 py-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h4 className="text-sm font-medium text-gray-900">
                        {notification.title}
                      </h4>
                      <span className={`px-2 py-1 text-xs rounded-full ${getNotificationTypeColor(notification.type)}`}>
                        {notification.type}
                      </span>
                      <span className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded-full">
                        {notification.language === 'en' ? '🇺🇸 EN' : '🇸🇴 SO'}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-gray-600">{notification.message}</p>
                    <div className="mt-2 flex items-center space-x-4 text-xs text-gray-500">
                      <div className="flex items-center">
                        <Calendar className="h-3 w-3 mr-1" />
                        {formatDate(notification.createdAt)}
                      </div>
                      <div className="flex items-center">
                        <UsersIcon className="h-3 w-3 mr-1" />
                        {notification.targetUsers === 'all' 
                          ? 'All users' 
                          : `${Array.isArray(notification.targetUsers) ? notification.targetUsers.length : 0} users`
                        }
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Notifications;
