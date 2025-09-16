import { AppDataSource } from '../config/data-source';
import { License, LicenseStatus } from '../models/License';
import { LicensePlan } from '../models/LicensePlan';
import { User } from '../models/User';
import crypto from 'crypto';

export class LicenseService {
  private static readonly LICENSE_SECRET = process.env.LICENSE_SECRET_KEY || 'your_license_secret_key';
  private static readonly LICENSE_ISSUER = process.env.LICENSE_ISSUER || 'YourCompany';

  /**
   * Generate a new license key
   */
  private static generateLicenseKey(): string {
    const random = crypto.randomBytes(16).toString('hex');
    const timestamp = Date.now().toString(36);
    const data = `${random}:${timestamp}`;
    
    const hmac = crypto.createHmac('sha256', this.LICENSE_SECRET);
    hmac.update(data);
    const signature = hmac.digest('hex').substring(0, 16);
    
    // Format: XXXX-XXXX-XXXX-XXXX
    const parts = [
      random.substring(0, 4),
      random.substring(4, 8),
      random.substring(8, 12),
      random.substring(12, 16)
    ];
    
    return `${parts.join('-')}-${signature}`.toUpperCase();
  }

  /**
   * Validate a license key format and signature
   */
  static validateLicenseKey(licenseKey: string): boolean {
    try {
      const [keyPart, signature] = licenseKey.split('-').slice(0, 5);
      if (!keyPart || !signature) return false;
      
      const data = keyPart.replace(/-/g, '');
      const hmac = crypto.createHmac('sha256', this.LICENSE_SECRET);
      hmac.update(data);
      const computedSignature = hmac.digest('hex').substring(0, 16);
      
      return computedSignature === signature.toLowerCase();
    } catch (error) {
      return false;
    }
  }

  /**
   * Create a new license
   */
  static async createLicense(planId: string, createdBy: User, userId?: string): Promise<License> {
    const licenseRepository = AppDataSource.getRepository(License);
    const planRepository = AppDataSource.getRepository(LicensePlan);
    const userRepository = AppDataSource.getRepository(User);

    const plan = await planRepository.findOneBy({ id: planId });
    if (!plan) {
      throw new Error('License plan not found');
    }

    const license = new License();
    license.licenseKey = this.generateLicenseKey();
    license.plan = plan;
    license.assignedBy = createdBy;
    license.status = LicenseStatus.PENDING;

    if (userId) {
      const user = await userRepository.findOneBy({ id: userId });
      if (user) {
        license.user = user;
        license.status = LicenseStatus.ACTIVE;
        license.activationDate = new Date();
        
        if (plan.durationMonths > 0) {
          const expiration = new Date();
          expiration.setMonth(expiration.getMonth() + plan.durationMonths);
          license.expirationDate = expiration;
        }
      }
    }

    return await licenseRepository.save(license);
  }

  /**
   * Generate multiple licenses at once
   */
  static async bulkGenerateLicenses(planId: string, count: number, createdBy: User): Promise<License[]> {
    const licenses: License[] = [];
    
    for (let i = 0; i < count; i++) {
      const license = await this.createLicense(planId, createdBy);
      licenses.push(license);
    }
    
    return licenses;
  }

  /**
   * Activate a license for a user
   */
  static async activateLicense(licenseKey: string, userId: string, deviceId?: string): Promise<License> {
    const licenseRepository = AppDataSource.getRepository(License);
    const userRepository = AppDataSource.getRepository(User);
    
    const license = await licenseRepository.findOne({
      where: { licenseKey },
      relations: ['plan']
    });

    if (!license) {
      throw new Error('License not found');
    }

    if (license.status === LicenseStatus.REVOKED) {
      throw new Error('This license has been revoked');
    }

    if (license.status === LicenseStatus.EXPIRED) {
      throw new Error('This license has expired');
    }

    const user = await userRepository.findOneBy({ id: userId });
    if (!user) {
      throw new Error('User not found');
    }

    // Check if user already has an active license of this type
    const existingLicense = await licenseRepository.findOne({
      where: {
        userId: user.id,
        planId: license.planId,
        status: LicenseStatus.ACTIVE
      }
    });

    if (existingLicense) {
      throw new Error('User already has an active license of this type');
    }

    // Update license
    license.user = user;
    license.status = LicenseStatus.ACTIVE;
    license.activationDate = new Date();
    
    if (license.plan.durationMonths > 0) {
      const expiration = new Date();
      expiration.setMonth(expiration.getMonth() + license.plan.durationMonths);
      license.expirationDate = expiration;
    }

    // Create transaction record
    const transactionRepository = AppDataSource.getRepository(Transaction);
    const transaction = new Transaction();
    transaction.type = 'license_purchase';
    transaction.status = 'completed';
    transaction.amount = license.plan.price;
    transaction.user = user;
    transaction.license = license;
    
    // Calculate commission if assigned to an agent
    if (user.agentId) {
      const agent = await userRepository.findOneBy({ id: user.agentId });
      if (agent) {
        transaction.agent = agent;
        transaction.commissionRate = license.plan.agentCommissionRate || agent.commissionRate || 0;
        transaction.commissionAmount = (license.plan.price * transaction.commissionRate) / 100;
        
        // Update agent's total commission
        agent.totalCommission = (agent.totalCommission || 0) + (transaction.commissionAmount || 0);
        await userRepository.save(agent);
      }
    }

    await transactionRepository.save(transaction);
    
    return await licenseRepository.save(license);
  }

  /**
   * Revoke a license
   */
  static async revokeLicense(licenseId: string, reason?: string): Promise<License> {
    const licenseRepository = AppDataSource.getRepository(License);
    
    const license = await licenseRepository.findOneBy({ id: licenseId });
    if (!license) {
      throw new Error('License not found');
    }

    license.status = LicenseStatus.REVOKED;
    if (reason) {
      license.notes = license.notes ? `${license.notes}\nRevoked: ${reason}` : `Revoked: ${reason}`;
    }

    return await licenseRepository.save(license);
  }

  /**
   * Check if a license is valid
   */
  static async validateLicense(licenseKey: string, deviceId?: string): Promise<{
    isValid: boolean;
    license?: License;
    message?: string;
  }> {
    const licenseRepository = AppDataSource.getRepository(License);
    
    const license = await licenseRepository.findOne({
      where: { licenseKey },
      relations: ['user', 'plan']
    });

    if (!license) {
      return { isValid: false, message: 'License not found' };
    }

    if (license.status !== LicenseStatus.ACTIVE) {
      return { 
        isValid: false, 
        license,
        message: `License is ${license.status}` 
      };
    }

    if (license.expirationDate && new Date() > license.expirationDate) {
      license.status = LicenseStatus.EXPIRED;
      await licenseRepository.save(license);
      return { 
        isValid: false, 
        license,
        message: 'License has expired' 
      };
    }

    // Check device limit if deviceId is provided
    if (deviceId && license.plan.maxDevices > 0) {
      const deviceCount = await AppDataSource.getRepository(Device)
        .createQueryBuilder('device')
        .where('device.licenseId = :licenseId', { licenseId: license.id })
        .andWhere('device.id != :deviceId', { deviceId })
        .getCount();

      if (deviceCount >= license.plan.maxDevices) {
        return { 
          isValid: false, 
          license,
          message: 'Maximum number of devices reached for this license' 
        };
      }
    }

    return { isValid: true, license };
  }
}
