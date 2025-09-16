import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  orderBy,
  Timestamp
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { Notification } from '../types';

export const notificationService = {
  // Send notification to users
  async sendNotification(
    title: string, 
    message: string, 
    targetUsers: string[] | 'all',
    type: 'info' | 'warning' | 'success' | 'error' = 'info',
    language: 'en' | 'so' = 'en'
  ): Promise<void> {
    try {
      const notificationData = {
        title,
        message,
        type,
        targetUsers,
        language,
        createdAt: Timestamp.now(),
        sentAt: Timestamp.now()
      };

      await addDoc(collection(db, 'notifications'), notificationData);
      
      // In a real implementation, you would also send push notifications
      // or update user documents with the notification
    } catch (error) {
      console.error('Error sending notification:', error);
      throw error;
    }
  },

  // Get all notifications
  async getAllNotifications(): Promise<Notification[]> {
    try {
      const notificationsRef = collection(db, 'notifications');
      const q = query(notificationsRef, orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        sentAt: doc.data().sentAt?.toDate(),
      })) as Notification[];
    } catch (error) {
      console.error('Error fetching notifications:', error);
      throw error;
    }
  },

  // Send custom alert to specific users
  async sendCustomAlert(
    userIds: string[],
    title: string,
    message: string,
    language: 'en' | 'so' = 'en'
  ): Promise<void> {
    try {
      await this.sendNotification(title, message, userIds, 'info', language);
    } catch (error) {
      console.error('Error sending custom alert:', error);
      throw error;
    }
  },

  // Send broadcast message to all users
  async sendBroadcast(
    title: string,
    message: string,
    language: 'en' | 'so' = 'en'
  ): Promise<void> {
    try {
      await this.sendNotification(title, message, 'all', 'info', language);
    } catch (error) {
      console.error('Error sending broadcast:', error);
      throw error;
    }
  }
};
