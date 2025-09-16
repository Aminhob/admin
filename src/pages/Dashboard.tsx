import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { userService } from '../services/userService';
import { AdminStats } from '../types';
import { 
  Users, 
  UserCheck, 
  UserX, 
  DollarSign,
  TrendingUp,
  Activity
} from 'lucide-react';
import toast from 'react-hot-toast';

const Dashboard: React.FC = () => {
  const { t } = useLanguage();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
    // Check expired subscriptions on dashboard load
    checkExpiredSubscriptions();
  }, []);

  const fetchStats = async () => {
    try {
      const adminStats = await userService.getAdminStats();
      setStats(adminStats);
    } catch (error) {
      console.error('Error fetching stats:', error);
      toast.error('Failed to load dashboard statistics');
    } finally {
      setLoading(false);
    }
  };

  const checkExpiredSubscriptions = async () => {
    try {
      await userService.checkExpiredSubscriptions();
    } catch (error) {
      console.error('Error checking expired subscriptions:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  const statCards = [
    {
      title: t('dashboard.totalUsers'),
      value: stats?.totalUsers || 0,
      icon: Users,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600',
    },
    {
      title: t('dashboard.activeUsers'),
      value: stats?.activeUsers || 0,
      icon: UserCheck,
      color: 'bg-green-500',
      bgColor: 'bg-green-50',
      textColor: 'text-green-600',
    },
    {
      title: t('dashboard.expiredUsers'),
      value: stats?.expiredUsers || 0,
      icon: UserX,
      color: 'bg-red-500',
      bgColor: 'bg-red-50',
      textColor: 'text-red-600',
    },
    {
      title: t('dashboard.revenue'),
      value: `$${stats?.totalRevenue || 0}`,
      icon: DollarSign,
      color: 'bg-yellow-500',
      bgColor: 'bg-yellow-50',
      textColor: 'text-yellow-600',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">{t('dashboard.title')}</h1>
        <button
          onClick={fetchStats}
          className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <Activity className="h-4 w-4" />
          <span>Refresh</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card, index) => (
          <div key={index} className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className={`${card.bgColor} p-3 rounded-md`}>
                    <card.icon className={`h-6 w-6 ${card.textColor}`} />
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      {card.title}
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {card.value}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts and Additional Info */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Status Distribution */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">User Status Distribution</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Active Users</span>
              <div className="flex items-center space-x-2">
                <div className="w-32 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full" 
                    style={{ 
                      width: `${stats ? (stats.activeUsers / stats.totalUsers) * 100 : 0}%` 
                    }}
                  ></div>
                </div>
                <span className="text-sm font-medium text-gray-900">
                  {stats ? Math.round((stats.activeUsers / stats.totalUsers) * 100) : 0}%
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Expired Users</span>
              <div className="flex items-center space-x-2">
                <div className="w-32 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-red-500 h-2 rounded-full" 
                    style={{ 
                      width: `${stats ? (stats.expiredUsers / stats.totalUsers) * 100 : 0}%` 
                    }}
                  ></div>
                </div>
                <span className="text-sm font-medium text-gray-900">
                  {stats ? Math.round((stats.expiredUsers / stats.totalUsers) * 100) : 0}%
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Suspended Users</span>
              <div className="flex items-center space-x-2">
                <div className="w-32 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-yellow-500 h-2 rounded-full" 
                    style={{ 
                      width: `${stats ? (stats.suspendedUsers / stats.totalUsers) * 100 : 0}%` 
                    }}
                  ></div>
                </div>
                <span className="text-sm font-medium text-gray-900">
                  {stats ? Math.round((stats.suspendedUsers / stats.totalUsers) * 100) : 0}%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Revenue Info */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Revenue Overview</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Total Revenue</span>
              <span className="text-2xl font-bold text-green-600">
                ${stats?.totalRevenue || 0}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Monthly Revenue</span>
              <span className="text-lg font-medium text-gray-900">
                ${stats?.monthlyRevenue || 0}
              </span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-green-600">
              <TrendingUp className="h-4 w-4" />
              <span>Revenue based on active subscriptions</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <button
            onClick={checkExpiredSubscriptions}
            className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <UserX className="h-4 w-4 mr-2" />
            Check Expired Subscriptions
          </button>
          <button
            onClick={fetchStats}
            className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <Activity className="h-4 w-4 mr-2" />
            Refresh Statistics
          </button>
          <button
            onClick={() => window.location.href = '/users'}
            className="flex items-center justify-center px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <Users className="h-4 w-4 mr-2" />
            Manage Users
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
