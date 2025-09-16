export interface User {
  id: string;
  name: string;
  email: string;
  subscriptionStatus: 'active' | 'expired' | 'suspended';
  expiryDate: Date;
  role: 'user' | 'admin';
  createdAt: Date;
  lastLoginAt?: Date;
  phoneNumber?: string;
  country?: string;
}

export interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  expiredUsers: number;
  suspendedUsers: number;
  totalRevenue: number;
  monthlyRevenue: number;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  targetUsers: string[] | 'all';
  createdAt: Date;
  sentAt?: Date;
  language: 'en' | 'so';
}

export interface Language {
  code: 'en' | 'so';
  name: string;
  flag: string;
}
