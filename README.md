<<<<<<< HEAD
# eMaamul Admin Panel

A comprehensive admin web application for managing users and subscriptions in the eMaamul platform.

## Features

- **Admin Authentication**: Secure login system with Firebase Auth
- **Dashboard**: Key statistics and metrics overview
- **User Management**: 
  - List, search, and filter users
  - View subscription status
  - Suspend/activate users
  - Extend subscriptions
- **Notifications**: Send custom alerts to users
- **Multi-language Support**: English and Somali
- **Responsive Design**: Works on all devices

## Tech Stack

- **Frontend**: React 18 with TypeScript
- **Styling**: TailwindCSS
- **Backend**: Firebase (Firestore + Auth)
- **Icons**: Lucide React
- **Notifications**: React Hot Toast
- **Routing**: React Router DOM

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Firebase Configuration

1. Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Enable Authentication and Firestore
3. Copy your Firebase config and update `src/firebase/config.ts`
4. Create a `.env` file based on `.env.example`

### 3. Firestore Setup

1. Deploy Firestore rules:
```bash
firebase deploy --only firestore:rules
```

2. Deploy Firestore indexes:
```bash
firebase deploy --only firestore:indexes
```

### 4. Create Admin User

In your Firebase Console, create a user with email `admin@emaamul.com` and add a document in the `users` collection:

```json
{
  "name": "Admin User",
  "email": "admin@emaamul.com",
  "role": "admin",
  "subscriptionStatus": "active",
  "expiryDate": "2025-12-31T00:00:00Z",
  "createdAt": "2024-01-01T00:00:00Z"
}
```

### 5. Run Development Server

```bash
npm start
```

The app will be available at `http://localhost:3000`

## Deployment

### Firebase Hosting

1. Install Firebase CLI:
```bash
npm install -g firebase-tools
```

2. Login to Firebase:
```bash
firebase login
```

3. Initialize Firebase in your project:
```bash
firebase init
```

4. Build the project:
```bash
npm run build
```

5. Deploy to Firebase:
```bash
firebase deploy
```

### Other Hosting Providers

The built files in the `build/` directory can be deployed to any static hosting provider like:
- Netlify
- Vercel
- AWS S3
- GitHub Pages

## Environment Variables

Create a `.env` file in the root directory:

```env
REACT_APP_FIREBASE_API_KEY=your-api-key
REACT_APP_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your-project-id
REACT_APP_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=123456789
REACT_APP_FIREBASE_APP_ID=your-app-id
```

## Database Structure

### Users Collection

```typescript
{
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
```

### Notifications Collection

```typescript
{
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  targetUsers: string[] | 'all';
  createdAt: Date;
  sentAt?: Date;
  language: 'en' | 'so';
}
```

## Default Login Credentials

- **Email**: admin@emaamul.com
- **Password**: admin123

## Features Overview

### Dashboard
- Total users count
- Active/expired/suspended users
- Revenue tracking
- User status distribution charts
- Quick actions

### User Management
- Search users by name or email
- Filter by subscription status
- View user details
- Suspend/activate users
- Extend subscriptions
- Bulk operations

### Notifications
- Send to all users or specific users
- Multi-language support
- Notification history
- Different notification types

### Multi-language
- English and Somali support
- Easy language switching
- Localized UI elements

## Security

- Role-based access control
- Firebase security rules
- Admin-only access to sensitive operations
- Secure authentication flow

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions, please contact the development team.
=======
# admin
>>>>>>> 5d34c19280ecd3f1a7cec38fee50079f7bb8d02e
