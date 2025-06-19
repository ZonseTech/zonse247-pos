import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { AuthMiddleware } from '../middlewares/auth.middleware';
import {
	preventSQLInjection,
	preventXSS,
	sanitizeInput,
} from '../middlewares/security.middleware';
import {
	authLimiter,
	createAccountLimiter,
	createUserSpecificLimiter,
	generalLimiter,
} from '../middlewares/rate-limit.middleware';
import {
	validateBody,
	validateParams,
} from '../middlewares/validation.middleware';
import { userValidationSchemas } from '../validations/user.schemas';
import { asyncHandler } from '../middlewares/error.middleware';

const router = Router();
const userController = new UserController();
const authMiddleware = new AuthMiddleware();

router.use(sanitizeInput);
router.use(preventSQLInjection);
router.use(preventXSS);

router.get('/', userController.getHealthCheck);

router.post(
	'/login',
	authLimiter,
	validateBody(userValidationSchemas.loginUser),
	asyncHandler(userController.loginUser)
);

router.post(
	'/refresh-token',
	authLimiter,
	asyncHandler(userController.refreshToken)
);

router.post(
	'/verify-token',
	authLimiter,
	asyncHandler(userController.verifyToken)
);

router.use(authMiddleware.verifyToken);
router.use(generalLimiter);

router.get(
	'/user/:userId',
	validateParams(userValidationSchemas.userId),
	authMiddleware.verifyOwnership,
	asyncHandler(userController.getUserById)
);

router.get(
	'/logout/:userId',
	validateParams(userValidationSchemas.userId),
	authMiddleware.verifyOwnership,
	asyncHandler(userController.logoutUser)
);

router.put(
	'/update/:userId',
	validateParams(userValidationSchemas.userId),
	validateBody(userValidationSchemas.updateUser),
	authMiddleware.verifyOwnership,
	authMiddleware.verifyPasswordStrength,
	createUserSpecificLimiter(
		60 * 60 * 1000,
		10,
		'Too many profile updates, please try again later'
	),
	asyncHandler(userController.updateUser)
);

router.delete(
	'/user/:userId',
	validateParams(userValidationSchemas.userId),
	authMiddleware.verifyOwnership,
	createUserSpecificLimiter(
		60 * 60 * 1000,
		3,
		'Too many deletion attempts, please try again later'
	),
	asyncHandler(userController.deleteUser)
);

router.get('/all', asyncHandler(userController.getAllUsers));

router.use(authMiddleware.requireAdmin);

router.post(
	'/post',
	createAccountLimiter,
	validateBody(userValidationSchemas.createUser),
	authMiddleware.verifyPasswordStrength,
	asyncHandler(userController.createUser)
);

router.get(
	'/admin/user/:userId',
	validateParams(userValidationSchemas.userId),
	asyncHandler(userController.getUserById)
);

export default router;