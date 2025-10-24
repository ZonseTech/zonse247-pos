import { Router } from 'express'
import CategoriesRoutes from './categories.routes'
import CustomersRoutes from './customers.routes'
import DashboardRoutes from './dashboard.routes'
import DatabaseExportRoutes from './database-export.routes'
import HoldOrdersRoutes from './hold-orders.routes'
import InventoryRoutes from './inventory.routes'
import MigrationRoutes from './migration.routes'
import PaymentMethodRoutes from './payment-method.routes'
import PrinterRoutes from './printer.routes'
import SettingsRoutes from './settings.routes'
import SyncRoutes from './sync.routes'
import TransactionsRoutes from './transaction.routes'
import UsersRoutes from './users.routes'
import TenantsRoutes from './tenant.routes'
import SubscriptionsRoutes from './subscription.routes'
import ShopsRoutes from './shop.routes'
import WorkStationRoutes from './workstations.routes'
import RoleRoutes from './role.routes'
import MailingRoutes from './email.routes'
import AuthRoutes from './auth.routes'
import PermissionRoutes from './permission.routes'
import RolePermissionRoutes from './role-permission.routes'
import { AuthMiddleware } from '../middlewares/auth.middleware'
import { preventSQLInjection, preventXSS, sanitizeInput } from '../middlewares/security.middleware'
import { authLimiter } from '../middlewares/rate-limit.middleware'
import { validateBody, validateParams } from '../middlewares/validation.middleware';
import { TenantController } from '../controllers/tenant.controller';
import { asyncHandler } from '../middlewares/error.middleware';
import { ShopController } from '../controllers/shop.controller';
import { tenantValidationSchemas } from '../validations/tenant.schemas';
import { shopValidationSchemas } from '../validations/shopValidationSchemas';
import { OnboardingController } from '../controllers/onboarding.controller';
import { SettingsController } from '../controllers/settings.controller'
import PaymentServiceProviderRoutes from './payment-service-provider.routes'
import { DatabaseExportController } from '../controllers/export.controller'

const router = Router();
const authMiddleware = new AuthMiddleware();
const exportController = new DatabaseExportController()

router.use(sanitizeInput);
router.use(preventSQLInjection);
router.use(preventXSS);

router.use((req, res, next) => {
    next();
});

router.get(
    '/export/download/:filename',
    asyncHandler(exportController.downloadFile)
);

router.get(
    '/setup',
    asyncHandler(SettingsController.setup)
)

router.get(
    '/tenant/:tenantId/shops',
    validateParams(tenantValidationSchemas.tenantId),
    asyncHandler(TenantController.getTenantShops)
);

router.get(
    '/shop/:shopCode/workstations',
    validateParams(shopValidationSchemas.shopCode),
    asyncHandler(ShopController.getShopWorkstations)
);

router.use(
    '/on-boarding',
    asyncHandler(OnboardingController.getOnboardingStatus)
);

router.post(
    '/auth/verify-tenant',
    validateBody(tenantValidationSchemas.verifyTenant),
    asyncHandler(TenantController.verify)
);

router.use('/settings', authLimiter, SettingsRoutes);

router.use(authMiddleware.verifyRequestHeaders)

router.use('/auth', authLimiter, AuthRoutes);

router.use(authMiddleware.verifyToken)

router.use('/tenants', TenantsRoutes);

router.use('/mailing', MailingRoutes);
router.use('/export', DatabaseExportRoutes);
router.use('/sync', SyncRoutes);
router.use('/payment-service-providers', PaymentServiceProviderRoutes);
router.use('/users', UsersRoutes);
router.use('/dashboard', DashboardRoutes);
router.use('/printers', PrinterRoutes);
router.use('/inventory', InventoryRoutes);
router.use('/customers', CustomersRoutes);
router.use('/categories', CategoriesRoutes);
router.use('/payment-methods', PaymentMethodRoutes);
router.use('/migration', MigrationRoutes);
router.use('/transactions', TransactionsRoutes);
router.use('/hold-orders', HoldOrdersRoutes);
router.use('/shops', ShopsRoutes);
router.use('/subscriptions', SubscriptionsRoutes);
router.use('/workstations', WorkStationRoutes);
router.use('/roles', RoleRoutes);
router.use('/permissions', PermissionRoutes);
router.use('/role-permissions', RolePermissionRoutes);

export default router