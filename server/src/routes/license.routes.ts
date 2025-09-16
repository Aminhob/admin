import { Router } from 'express';
import { LicenseController } from '../controllers/license.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { UserRole } from '../models/User';

const router = Router();

// Apply authentication middleware to all routes
router.use(authenticate);

// License routes
router.post('/', authorize([UserRole.SUPER_ADMIN, UserRole.AGENT]), LicenseController.createLicense);
router.post('/bulk', authorize([UserRole.SUPER_ADMIN, UserRole.AGENT]), LicenseController.bulkGenerateLicenses);
router.post('/activate', LicenseController.activateLicense);
router.get('/validate', LicenseController.validateLicense);
router.get('/stats', authorize([UserRole.SUPER_ADMIN, UserRole.AGENT]), LicenseController.getStats);

// License ID routes
router.get('/:id', LicenseController.getLicense);
router.put('/:id', authorize([UserRole.SUPER_ADMIN, UserRole.AGENT]), LicenseController.updateLicense);
router.delete('/:id/revoke', authorize([UserRole.SUPER_ADMIN, UserRole.AGENT]), LicenseController.revokeLicense);

// List licenses (with filters)
router.get('/', LicenseController.listLicenses);

export default router;
