import { Request, Response } from 'express';
import { UserService } from '../services/user.service';

export class UserController {
	private userService: UserService;

	constructor() {
		const jwtConfig = {
			jwtSecret: process.env.JWT_SECRET || 'your-secret-key',
			jwtExpiresIn: process.env.JWT_EXPIRES_IN || '24h',
		};

		this.userService = new UserService(jwtConfig);
	}

	getHealthCheck = (req: Request, res: Response): void => {
		res.send('Users API');
	};

	getUserById = async (req: Request, res: Response): Promise<void> => {
		try {
			const user = await this.userService.getUserById(req.params.userId);
			res.send(user);
		} catch (error: any) {
			console.error(error);
			res.status(500).json({
				error: 'Internal Server Error',
				message: error.message || `An unexpected error occurred. ${error}`,
			});
		}
	};

	logoutUser = async (req: Request, res: Response): Promise<void> => {
		try {
			await this.userService.logoutUser(req.params.userId);
			res.status(200).json({
				message: 'User logged out successfully'
			});
		} catch (error: any) {
			console.error(error);
			res.status(500).json({
				error: 'Internal Server Error',
				message: error.message || `An unexpected error occurred. ${error}`,
			});
		}
	};

	loginUser = async (req: Request, res: Response): Promise<void> => {
		try {
			const { username, password } = req.body;
			const result = await this.userService.loginUser(username, password);

			if (result.message) {
				res.status(401).json(result);
			} else {
				res.status(200).json(result);
			}
		} catch (error: any) {
			console.error(error);
			res.status(500).json({
				error: 'Internal Server Error',
				message: error.message || 'An unexpected error occurred during login',
			});
		}
	};

	getAllUsers = async (req: Request, res: Response): Promise<void> => {
		try {
			const users = await this.userService.getAllUsers();
			res.send(users);
		} catch (error: any) {
			console.error(error);
			res.status(500).json({
				error: 'Internal Server Error',
				message: error.message || `An unexpected error occurred. ${error}`,
			});
		}
	};

	deleteUser = async (req: Request, res: Response): Promise<void> => {
		try {
			await this.userService.deleteUser(req.params.userId);
			res.status(200).json({
				message: 'User deleted successfully'
			});
		} catch (error: any) {
			console.error(error);
			res.status(500).json({
				error: 'Internal Server Error',
				message: error.message || `An unexpected error occurred. ${error}`,
			});
		}
	};

	createUser = async (req: Request, res: Response): Promise<void> => {
		try {
			const user = await this.userService.createUser(req.body);
			res.status(201).json({
				message: 'User created successfully',
				user: user
			});
		} catch (error: any) {
			console.error(error);
			res.status(500).json({
				error: 'Internal Server Error',
				message: error.message || `An unexpected error occurred. ${error}`,
			});
		}
	};

	updateUser = async (req: Request, res: Response): Promise<void> => {
		try {
			const userData = await this.userService.updateUser(
				req.params.userId,
				req.body
			);
			res.status(200).json({
				message: 'User updated successfully',
				user: userData
			});
		} catch (error: any) {
			console.error(error);
			res.status(500).json({
				error: 'Internal Server Error',
				message: error.message || `An unexpected error occurred. ${error}`,
			});
		}
	};

	refreshToken = async (req: Request, res: Response): Promise<void> => {
		try {
			const { token } = req.body;
			if (!token) {
				res.status(400).json({
					error: 'Bad Request',
					message: 'Token is required'
				});
				return;
			}

			const newToken = await this.userService.refreshToken(token);
			res.status(200).json({
				message: 'Token refreshed successfully',
				token: newToken
			});
		} catch (error: any) {
			console.error(error);
			res.status(401).json({
				error: 'Token Refresh Error',
				message: error.message || 'Failed to refresh token',
			});
		}
	};

	verifyToken = async (req: Request, res: Response): Promise<void> => {
		try {
			const token = req.headers.authorization?.replace('Bearer ', '') ||
				(req.headers['x-access-token'] as string);

			if (!token) {
				res.status(400).json({
					error: 'Bad Request',
					message: 'Token is required'
				});
				return;
			}

			const decoded = this.userService.verifyJWTToken(token);
			res.status(200).json({
				message: 'Token is valid',
				user: decoded
			});
		} catch (error: any) {
			console.error(error);
			res.status(401).json({
				error: 'Token Verification Error',
				message: error.message || 'Invalid token',
			});
		}
	};
}