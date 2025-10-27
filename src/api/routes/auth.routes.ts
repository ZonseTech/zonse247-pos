import { Router } from "express";
import { validateBody, validateParams } from "../middlewares/validation.middleware";
import { userValidationSchemas } from "../validations/user.schemas";
import { TenantMiddleware } from "../middlewares/tenant.middleware";
import { asyncHandler } from "../middlewares/error.middleware";
import { UserController } from "../controllers/user.controller";

const router = Router();

const tenantMiddleware = new TenantMiddleware()

router.post(
    '/login',
    validateBody(userValidationSchemas.loginUser),
    tenantMiddleware.subscriptionStatus,
    asyncHandler(UserController.login)
);

router.post(
    '/refresh-token',
    validateBody(userValidationSchemas.refreshToken),
    asyncHandler(UserController.refreshToken)
);

router.post(
    '/verify-token',
    asyncHandler(UserController.verifyToken)
);

router.get(
    '/logout/:id',
    validateParams(userValidationSchemas.id),
    asyncHandler(UserController.logout)
)

export default router;