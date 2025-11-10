import { Request, Response, Router } from "express";
import { RoleController } from "../controllers/role.controller";
import { PermissionController } from "../controllers/permission.controller";
import { RolePermissionController } from "../controllers/role-permission.controller";
import { UserController } from "../controllers/user.controller";
import { CustomerController } from "../controllers/customer.service";
import { CategoryController } from "../controllers/category.controller";
import { SubscriptionPlanController } from "../controllers/subscription-plan.controller";
import { SubscriptionController } from "../controllers/subscription.controller";
import { PaymentMethodController } from "../controllers/payment-method.controller";
import { PaymentServiceProviderController } from "../controllers/payment-service-provider.controller";
import { MetadataController } from "../controllers/metadata.controller";

const router = Router();

router.get('/', function (req: Request, res: Response): void {
    res.send('Account seeds api');
});

router.get('/roles', RoleController.selectAll)
router.get('/permissions', PermissionController.selectAll)
router.get('/role-permissions', RolePermissionController.selectAll)
router.get('/default-user', UserController.selectAll)
router.get('/customer', CustomerController.selectAll)
router.get('/category', CategoryController.selectAll)
router.get('/subscription-plans', SubscriptionPlanController.selectAll)
router.get('/tenant-subscription', SubscriptionController.selectAll)
router.get('/payment-methods', PaymentMethodController.selectAll)
router.get('/payment-service-provider', PaymentServiceProviderController.selectAll)
router.get('/sync-all', MetadataController.syncAll)

export default router;
