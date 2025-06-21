import { Router } from "express";
import { validateBody, validateParams } from "../middlewares/validation.middleware";
import { userValidationSchemas } from "../validations/user.schemas";
import { ClientMiddleware } from "../middlewares/client.middleware";
import { asyncHandler } from "../middlewares/error.middleware";
import { UserController } from "../controllers/user.controller";
import { clientValidationSchemas } from "../validations/client.schemas";
import { ClientController } from "../controllers/client.controller";

const router = Router();

const clientMiddleware = new ClientMiddleware()

router.post(
    '/login',
    validateBody(userValidationSchemas.loginUser),
    clientMiddleware.subscriptionStatus,
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

router.post(
    '/verify-client',
    validateBody(clientValidationSchemas.verifyClient),
    asyncHandler(ClientController.verify)
);

export default router;