import { Request, Response } from 'express';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import { AppDataSource } from '../config/data-source';
import { User, UserRole } from '../models/User';

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '30d';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your_refresh_token_secret';
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '90d';

export class AuthController {
  /**
   * Register a new user
   */
  static async register(req: Request, res: Response) {
    const { email, password, firstName, lastName, phoneNumber, role = UserRole.USER, agentId } = req.body;
    
    try {
      const userRepository = AppDataSource.getRepository(User);
      
      // Check if user already exists
      const existingUser = await userRepository.findOne({ where: { email } });
      if (existingUser) {
        return res.status(400).json({ message: 'Email already in use' });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);
      
      // Create new user
      const user = new User();
      user.email = email;
      user.password = hashedPassword;
      user.firstName = firstName;
      user.lastName = lastName;
      user.phoneNumber = phoneNumber;
      user.role = role;
      
      // Set agent if provided and exists
      if (agentId) {
        const agent = await userRepository.findOne({ where: { id: agentId, role: UserRole.AGENT } });
        if (agent) {
          user.agent = agent;
        }
      }

      await userRepository.save(user);
      
      // Generate tokens
      const { accessToken, refreshToken } = await this.generateTokens(user);
      
      // Return user data (excluding password)
      const userData = { ...user };
      delete userData.password;
      
      res.status(201).json({
        user: userData,
        accessToken,
        refreshToken
      });
      
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ message: 'Error registering user' });
    }
  }

  /**
   * User login
   */
  static async login(req: Request, res: Response) {
    const { email, password } = req.body;
    
    try {
      const userRepository = AppDataSource.getRepository(User);
      const user = await userRepository.findOne({ where: { email } });
      
      // Check if user exists
      if (!user) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }
      
      // Check if account is active
      if (!user.isActive) {
        return res.status(403).json({ message: 'Account is deactivated' });
      }
      
      // Verify password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }
      
      // Generate tokens
      const { accessToken, refreshToken } = await this.generateTokens(user);
      
      // Update last login
      user.lastLogin = new Date();
      await userRepository.save(user);
      
      // Return user data (excluding password)
      const userData = { ...user };
      delete userData.password;
      
      res.json({
        user: userData,
        accessToken,
        refreshToken
      });
      
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ message: 'Error during login' });
    }
  }

  /**
   * Refresh access token
   */
  static async refreshToken(req: Request, res: Response) {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
      return res.status(401).json({ message: 'Refresh token is required' });
    }
    
    try {
      // Verify refresh token
      const decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET) as { id: string };
      
      // Find user
      const userRepository = AppDataSource.getRepository(User);
      const user = await userRepository.findOneBy({ id: decoded.id });
      
      if (!user) {
        return res.status(401).json({ message: 'Invalid refresh token' });
      }
      
      // Generate new tokens
      const tokens = await this.generateTokens(user);
      
      res.json(tokens);
      
    } catch (error) {
      console.error('Token refresh error:', error);
      res.status(401).json({ message: 'Invalid refresh token' });
    }
  }

  /**
   * Get current user profile
   */
  static async getProfile(req: Request, res: Response) {
    try {
      const userRepository = AppDataSource.getRepository(User);
      const user = await userRepository.findOne({
        where: { id: req.user.id },
        relations: ['agent']
      });
      
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      // Return user data (excluding password)
      const userData = { ...user };
      delete userData.password;
      
      res.json(userData);
      
    } catch (error) {
      console.error('Get profile error:', error);
      res.status(500).json({ message: 'Error fetching user profile' });
    }
  }

  /**
   * Update user profile
   */
  static async updateProfile(req: Request, res: Response) {
    const { firstName, lastName, phoneNumber, currentPassword, newPassword } = req.body;
    
    try {
      const userRepository = AppDataSource.getRepository(User);
      const user = await userRepository.findOneBy({ id: req.user.id });
      
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      // Update basic info
      if (firstName) user.firstName = firstName;
      if (lastName) user.lastName = lastName;
      if (phoneNumber) user.phoneNumber = phoneNumber;
      
      // Update password if current password is provided
      if (currentPassword && newPassword) {
        const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
        if (!isPasswordValid) {
          return res.status(400).json({ message: 'Current password is incorrect' });
        }
        user.password = await bcrypt.hash(newPassword, 10);
      }
      
      await userRepository.save(user);
      
      // Return updated user data (excluding password)
      const userData = { ...user };
      delete userData.password;
      
      res.json(userData);
      
    } catch (error) {
      console.error('Update profile error:', error);
      res.status(500).json({ message: 'Error updating profile' });
    }
  }

  /**
   * Helper method to generate JWT tokens
   */
  private static async generateTokens(user: User) {
    const payload = {
      id: user.id,
      email: user.email,
      role: user.role
    };
    
    const accessToken = jwt.sign(payload, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN
    });
    
    const refreshToken = jwt.sign(
      { id: user.id },
      JWT_REFRESH_SECRET,
      { expiresIn: JWT_REFRESH_EXPIRES_IN }
    );
    
    return { accessToken, refreshToken };
  }
}
