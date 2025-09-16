import { Request, Response } from 'express';
import { AppDataSource } from '../config/data-source';
import { License, LicenseStatus } from '../models/License';
import { LicensePlan } from '../models/LicensePlan';
import { User } from '../models/User';
import { LicenseService } from '../services/license.service';
import { validate } from 'class-validator';

export class LicenseController {
  /**
   * Create a new license
   */
  static async createLicense(req: Request, res: Response) {
    const { planId, userId, notes } = req.body;
    
    try {
      const license = await LicenseService.createLicense(planId, req.user, userId);
      
      if (notes) {
        license.notes = notes;
        await AppDataSource.getRepository(License).save(license);
      }
      
      res.status(201).json(license);
      
    } catch (error) {
      console.error('Create license error:', error);
      res.status(400).json({ message: error.message });
    }
  }

  /**
   * Generate multiple licenses
   */
  static async bulkGenerateLicenses(req: Request, res: Response) {
    const { planId, count } = req.body;
    
    if (!count || count < 1 || count > 100) {
      return res.status(400).json({ message: 'Count must be between 1 and 100' });
    }
    
    try {
      const licenses = await LicenseService.bulkGenerateLicenses(planId, count, req.user);
      res.status(201).json({ count: licenses.length, licenses });
      
    } catch (error) {
      console.error('Bulk generate licenses error:', error);
      res.status(400).json({ message: error.message });
    }
  }

  /**
   * Activate a license
   */
  static async activateLicense(req: Request, res: Response) {
    const { licenseKey, deviceId } = req.body;
    
    try {
      const license = await LicenseService.activateLicense(licenseKey, req.user.id, deviceId);
      res.json(license);
      
    } catch (error) {
      console.error('Activate license error:', error);
      res.status(400).json({ message: error.message });
    }
  }

  /**
   * Validate a license
   */
  static async validateLicense(req: Request, res: Response) {
    const { licenseKey, deviceId } = req.query;
    
    if (!licenseKey) {
      return res.status(400).json({ message: 'License key is required' });
    }
    
    try {
      const result = await LicenseService.validateLicense(
        licenseKey as string, 
        deviceId as string
      );
      
      res.json(result);
      
    } catch (error) {
      console.error('Validate license error:', error);
      res.status(400).json({ message: error.message });
    }
  }

  /**
   * Get license by ID
   */
  static async getLicense(req: Request, res: Response) {
    const { id } = req.params;
    
    try {
      const licenseRepository = AppDataSource.getRepository(License);
      const license = await licenseRepository.findOne({
        where: { id },
        relations: ['user', 'plan', 'assignedBy']
      });
      
      if (!license) {
        return res.status(404).json({ message: 'License not found' });
      }
      
      // Only allow access to the license owner, assigned agent, or admin
      if (
        license.userId !== req.user.id && 
        license.assignedById !== req.user.id &&
        req.user.role !== 'super_admin'
      ) {
        return res.status(403).json({ message: 'Not authorized to access this license' });
      }
      
      res.json(license);
      
    } catch (error) {
      console.error('Get license error:', error);
      res.status(500).json({ message: 'Error fetching license' });
    }
  }

  /**
   * List licenses with filters
   */
  static async listLicenses(req: Request, res: Response) {
    const { 
      status, 
      userId, 
      planId, 
      agentId, 
      page = 1, 
      limit = 20 
    } = req.query;
    
    try {
      const licenseRepository = AppDataSource.getRepository(License);
      const query = licenseRepository
        .createQueryBuilder('license')
        .leftJoinAndSelect('license.user', 'user')
        .leftJoinAndSelect('license.plan', 'plan')
        .leftJoinAndSelect('license.assignedBy', 'assignedBy')
        .orderBy('license.createdAt', 'DESC')
        .skip((Number(page) - 1) * Number(limit))
        .take(Number(limit));
      
      // Apply filters
      if (status) {
        query.andWhere('license.status = :status', { status });
      }
      
      if (userId) {
        query.andWhere('license.userId = :userId', { userId });
      } else if (req.user.role === 'agent') {
        // Agents can only see their own licenses and those of their users
        query.andWhere('(license.assignedById = :agentId OR user.agentId = :agentId)', { 
          agentId: req.user.id 
        });
      } else if (req.user.role === 'user') {
        // Users can only see their own licenses
        query.andWhere('license.userId = :userId', { userId: req.user.id });
      }
      
      if (planId) {
        query.andWhere('license.planId = :planId', { planId });
      }
      
      if (agentId) {
        query.andWhere('user.agentId = :agentId', { agentId });
      }
      
      const [licenses, total] = await query.getManyAndCount();
      
      res.json({
        data: licenses,
        meta: {
          total,
          page: Number(page),
          limit: Number(limit),
          totalPages: Math.ceil(total / Number(limit))
        }
      });
      
    } catch (error) {
      console.error('List licenses error:', error);
      res.status(500).json({ message: 'Error fetching licenses' });
    }
  }

  /**
   * Update license
   */
  static async updateLicense(req: Request, res: Response) {
    const { id } = req.params;
    const { status, notes, expirationDate } = req.body;
    
    try {
      const licenseRepository = AppDataSource.getRepository(License);
      const license = await licenseRepository.findOne({
        where: { id },
        relations: ['user']
      });
      
      if (!license) {
        return res.status(404).json({ message: 'License not found' });
      }
      
      // Only allow updates by admins or the user who assigned the license
      if (
        license.assignedById !== req.user.id && 
        req.user.role !== 'super_admin'
      ) {
        return res.status(403).json({ message: 'Not authorized to update this license' });
      }
      
      // Update fields if provided
      if (status && Object.values(LicenseStatus).includes(status)) {
        license.status = status as LicenseStatus;
      }
      
      if (notes !== undefined) {
        license.notes = notes;
      }
      
      if (expirationDate) {
        license.expirationDate = new Date(expirationDate);
      }
      
      await licenseRepository.save(license);
      
      res.json(license);
      
    } catch (error) {
      console.error('Update license error:', error);
      res.status(500).json({ message: 'Error updating license' });
    }
  }

  /**
   * Revoke a license
   */
  static async revokeLicense(req: Request, res: Response) {
    const { id } = req.params;
    const { reason } = req.body;
    
    try {
      const license = await LicenseService.revokeLicense(id, reason);
      res.json(license);
      
    } catch (error) {
      console.error('Revoke license error:', error);
      res.status(400).json({ message: error.message });
    }
  }

  /**
   * Get license statistics
   */
  static async getStats(req: Request, res: Response) {
    try {
      const licenseRepository = AppDataSource.getRepository(License);
      
      // Get total licenses by status
      const statusStats = await licenseRepository
        .createQueryBuilder('license')
        .select('license.status', 'status')
        .addSelect('COUNT(license.id)', 'count')
        .groupBy('license.status')
        .getRawMany();
      
      // Get licenses by plan
      const planStats = await licenseRepository
        .createQueryBuilder('license')
        .leftJoin('license.plan', 'plan')
        .select('plan.name', 'planName')
        .addSelect('COUNT(license.id)', 'count')
        .groupBy('plan.name')
        .getRawMany();
      
      // Get monthly activation stats
      const activationStats = await licenseRepository
        .createQueryBuilder('license')
        .select(`TO_CHAR(license.activationDate, 'YYYY-MM')`, 'month')
        .addSelect('COUNT(license.id)', 'count')
        .where('license.activationDate IS NOT NULL')
        .groupBy(`TO_CHAR(license.activationDate, 'YYYY-MM')`)
        .orderBy('month')
        .getRawMany();
      
      res.json({
        byStatus: statusStats,
        byPlan: planStats,
        monthlyActivations: activationStats
      });
      
    } catch (error) {
      console.error('Get license stats error:', error);
      res.status(500).json({ message: 'Error fetching license statistics' });
    }
  }
}
