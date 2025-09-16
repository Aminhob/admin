import { 
  collection, 
  query, 
  getDocs, 
  doc, 
  updateDoc, 
  where, 
  orderBy,
  Timestamp,
  getCountFromServer
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { User, AdminStats } from '../types';

export const userService = {
  // Get all users
  async getAllUsers(): Promise<User[]> {
    try {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        expiryDate: doc.data().expiryDate?.toDate(),
        createdAt: doc.data().createdAt?.toDate(),
        lastLoginAt: doc.data().lastLoginAt?.toDate(),
      })) as User[];
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  },

  // Search users
  async searchUsers(searchTerm: string): Promise<User[]> {
    try {
      const users = await this.getAllUsers();
      return users.filter(user => 
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    } catch (error) {
      console.error('Error searching users:', error);
      throw error;
    }
  },

  // Filter users by status
  async getUsersByStatus(status: string): Promise<User[]> {
    try {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('subscriptionStatus', '==', status));
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        expiryDate: doc.data().expiryDate?.toDate(),
        createdAt: doc.data().createdAt?.toDate(),
        lastLoginAt: doc.data().lastLoginAt?.toDate(),
      })) as User[];
    } catch (error) {
      console.error('Error filtering users:', error);
      throw error;
    }
  },

  // Update user subscription status
  async updateUserStatus(userId: string, status: 'active' | 'expired' | 'suspended'): Promise<void> {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        subscriptionStatus: status,
        updatedAt: Timestamp.now()
      });
    } catch (error) {
      console.error('Error updating user status:', error);
      throw error;
    }
  },

  // Extend user subscription
  async extendSubscription(userId: string, days: number): Promise<void> {
    try {
      const userRef = doc(db, 'users', userId);
      const newExpiryDate = new Date();
      newExpiryDate.setDate(newExpiryDate.getDate() + days);
      
      await updateDoc(userRef, {
        expiryDate: Timestamp.fromDate(newExpiryDate),
        subscriptionStatus: 'active',
        updatedAt: Timestamp.now()
      });
    } catch (error) {
      console.error('Error extending subscription:', error);
      throw error;
    }
  },

  // Get admin statistics
  async getAdminStats(): Promise<AdminStats> {
    try {
      const usersRef = collection(db, 'users');
      
      // Get total users count
      const totalUsersSnapshot = await getCountFromServer(usersRef);
      const totalUsers = totalUsersSnapshot.data().count;

      // Get active users count
      const activeUsersQuery = query(usersRef, where('subscriptionStatus', '==', 'active'));
      const activeUsersSnapshot = await getCountFromServer(activeUsersQuery);
      const activeUsers = activeUsersSnapshot.data().count;

      // Get expired users count
      const expiredUsersQuery = query(usersRef, where('subscriptionStatus', '==', 'expired'));
      const expiredUsersSnapshot = await getCountFromServer(expiredUsersQuery);
      const expiredUsers = expiredUsersSnapshot.data().count;

      // Get suspended users count
      const suspendedUsersQuery = query(usersRef, where('subscriptionStatus', '==', 'suspended'));
      const suspendedUsersSnapshot = await getCountFromServer(suspendedUsersQuery);
      const suspendedUsers = suspendedUsersSnapshot.data().count;

      // Mock revenue data (you can implement actual revenue tracking)
      const totalRevenue = activeUsers * 10; // Assuming $10 per active user
      const monthlyRevenue = totalRevenue * 0.1; // Mock monthly revenue

      return {
        totalUsers,
        activeUsers,
        expiredUsers,
        suspendedUsers,
        totalRevenue,
        monthlyRevenue
      };
    } catch (error) {
      console.error('Error fetching admin stats:', error);
      throw error;
    }
  },

  // Check and update expired subscriptions
  async checkExpiredSubscriptions(): Promise<void> {
    try {
      const usersRef = collection(db, 'users');
      const now = Timestamp.now();
      
      // Get users with active status but expired dates
      const expiredQuery = query(
        usersRef, 
        where('subscriptionStatus', '==', 'active'),
        where('expiryDate', '<', now)
      );
      
      const expiredSnapshot = await getDocs(expiredQuery);
      
      // Update expired users
      const updatePromises = expiredSnapshot.docs.map(doc => 
        updateDoc(doc.ref, {
          subscriptionStatus: 'expired',
          updatedAt: now
        })
      );
      
      await Promise.all(updatePromises);
    } catch (error) {
      console.error('Error checking expired subscriptions:', error);
      throw error;
    }
  }
};
