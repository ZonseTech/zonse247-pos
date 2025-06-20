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
import TransactionsRoutes from './transactions.routes'
import UsersRoutes from './users.routes'
import ClientsRoutes from './client.routes'
import SubscriptionsRoutes from './subscription.routes'
import ShopsRoutes from './shop.routes'
import WorkStationRoutes from './workstations.routes'
import RoleRoutes from './role.routes'
import PermissionRoutes from './permission.routes'
import RolePermissionRoutes from './role-permission.routes'
import { AuthMiddleware } from '../middlewares/auth.middleware'
import { preventSQLInjection, preventXSS, sanitizeInput } from '../middlewares/security.middleware'
import { asyncHandler } from '../middlewares/error.middleware'
import { UserController } from '../controllers/user.controller'
import { authLimiter } from '../middlewares/rate-limit.middleware'
import { validateBody, validateParams } from '../middlewares/validation.middleware'
import { userValidationSchemas } from '../validations/user.schemas'
import { OnboardingController } from '../controllers/onboarding.controller'
import { ClientController } from '../controllers/client.controller'
import { clientValidationSchemas } from '../validations/client.schemas'
import { ShopController } from '../controllers/shop.controller'
import { shopValidationSchemas } from '../validations/shopValidationSchemas'

const router = Router();
const authMiddleware = new AuthMiddleware();

router.use(sanitizeInput);
router.use(preventSQLInjection);
router.use(preventXSS);

router.use((req, res, next) => {
    next();
});

router.post(
    '/auth/login',
    authLimiter,
    validateBody(userValidationSchemas.loginUser),
    asyncHandler(UserController.login)
);

router.post(
    '/auth/verify-client',
    authLimiter,
    validateBody(clientValidationSchemas.verifyClient),
    asyncHandler(ClientController.verify)
);

router.get(
    '/client/:clientId/shops',
    validateParams(clientValidationSchemas.clientId),
    asyncHandler(ClientController.getClientShops)
);

router.get(
    '/shop/:shopCode/workstations',
    validateParams(shopValidationSchemas.shopCode),
    asyncHandler(ShopController.getShopWorkstations)
);

router.post(
    '/auth/refresh-token',
    authLimiter,
    validateBody(userValidationSchemas.refreshToken),
    asyncHandler(UserController.refreshToken)
);

router.post(
    '/auth/verify-token',
    authLimiter,
    asyncHandler(UserController.verifyToken)
);

router.use(
    '/on-boarding',
    authLimiter,
    asyncHandler(OnboardingController.getOnboardingStatus)
);

router.get(
    '/auth/logout/:id',
    validateParams(userValidationSchemas.id),
    asyncHandler(UserController.logout)
);

router.use('/export', authMiddleware.verifyToken, DatabaseExportRoutes);
router.use('/sync', authMiddleware.verifyToken, SyncRoutes);
router.use('/users', authMiddleware.verifyToken, UsersRoutes);
router.use('/dashboard', authMiddleware.verifyToken, DashboardRoutes);
router.use('/printers', authMiddleware.verifyToken, PrinterRoutes);
router.use('/settings', authMiddleware.verifyToken, SettingsRoutes);
router.use('/inventory', authMiddleware.verifyToken, InventoryRoutes);
router.use('/customers', authMiddleware.verifyToken, CustomersRoutes);
router.use('/categories', authMiddleware.verifyToken, CategoriesRoutes);
router.use('/payment-methods', authMiddleware.verifyToken, PaymentMethodRoutes);
router.use('/migration', authMiddleware.verifyToken, MigrationRoutes);
router.use('/transactions', authMiddleware.verifyToken, TransactionsRoutes);
router.use('/hold-orders', authMiddleware.verifyToken, HoldOrdersRoutes);
router.use('/clients', authMiddleware.verifyToken, ClientsRoutes);
router.use('/shops', authMiddleware.verifyToken, ShopsRoutes);
router.use('/subscriptions', authMiddleware.verifyToken, SubscriptionsRoutes);
router.use('/workstations', authMiddleware.verifyToken, WorkStationRoutes);
router.use('/roles', authMiddleware.verifyToken, RoleRoutes);
router.use('/permissions', authMiddleware.verifyToken, PermissionRoutes);
router.use('/role-permissions', authMiddleware.verifyToken, RolePermissionRoutes);

export default router