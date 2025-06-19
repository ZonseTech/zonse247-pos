import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import validator from 'validator';
import { PERMISSIONS_DB, ROLE_PERMISSIONS_DB, ROLES_DB, USERS_DB } from '../databases/local/tables';
import { sealDBModel } from '../databases/local';
import { v4 as uuidv4 } from 'uuid';

const saltRounds = 10;

export interface JWTConfig {
	jwtSecret: string;
	jwtExpiresIn: string;
}

export class UserService {
	private jwtConfig: JWTConfig;

	constructor(jwtConfig: JWTConfig) {
		this.jwtConfig = jwtConfig;
	}

	async getUserById(userId: string): Promise<any> {
		if (!userId) {
			throw new Error('ID field is required.');
		}
		return await sealDBModel.findById(USERS_DB, userId);
	}

	async logoutUser(userId: string): Promise<void> {
		if (!userId) {
			throw new Error('ID field is required.');
		}
		await sealDBModel.update(USERS_DB, userId, {
			lastLoggedOut: new Date(),
		});
	}

	async loginUser(
		username: string,
		password: string
	): Promise<{ user?: any; token?: string; message?: string }> {
		const user = await sealDBModel.findById<User>(USERS_DB, {
			username: validator.escape(username),
		});

		if (!user) {
			return { message: 'Incorrect username or password.' };
		}

		if (user.status !== 'active') {
			return { message: 'Account is not active. Please contact support.' };
		}

		const isPasswordValid = await bcrypt.compare(password, user.password);
		if (!isPasswordValid) {
			return { message: 'Incorrect username or password.' };
		}

		await sealDBModel.update(USERS_DB, user.uuid.toString(), {
			lastLogin: new Date(),
		});

		const roleData = await this.getRoleWithPermissions(user.roleUuid);

		const completeUser = this.getPublicUser(user, roleData || {});

		const token = this.generateJWTToken(completeUser);

		return { user: completeUser, token };
	}

	private getPublicUser(user: User, privileges: any): PublicUser {
		const { password, ...publicUser } = user;
		return {
			...publicUser,
			roleName: privileges.roleName || null,
			permissions: privileges.permissions || null,
		};
	}

	private async getRoleWithPermissions(
		roleUuid: string
	): Promise<{ name: string; permissions: string[] } | null> {
		try {
			const role = await sealDBModel.findById<Role>(ROLES_DB, roleUuid);
			if (!role) return null;

			const rolePermissions = await sealDBModel.find<Array<RolePermission>>(
				ROLE_PERMISSIONS_DB,
				{ roleUuid }
			);

			const permissionDetails = await Promise.all(
				rolePermissions.map((rp) =>
					sealDBModel.findById<Permission>(PERMISSIONS_DB, rp.permissionUuid)
				)
			);

			const permissions = permissionDetails
				.filter((p): p is Permission => !!p)
				.map(p => p.name);

			return {
				name: role.name,
				permissions,
			};
		} catch (error) {
			console.error('Error fetching role data:', error);
			return null;
		}
	}


	private generateJWTToken(user: any): string {
		const payload = {
			...user,
			iat: Math.floor(Date.now() / 1000),
		};

		return (jwt as any).sign(payload, this.jwtConfig.jwtSecret, {
			expiresIn: this.jwtConfig.jwtExpiresIn,
			issuer: 'your-app-name',
			audience: 'your-app-users',
		});
	}

	verifyJWTToken(token: string): any {
		try {
			return jwt.verify(token, this.jwtConfig.jwtSecret);
		} catch (error) {
			if (error instanceof jwt.TokenExpiredError) {
				throw new Error('Token has expired');
			} else if (error instanceof jwt.JsonWebTokenError) {
				throw new Error('Invalid token');
			} else {
				throw new Error('Token verification failed');
			}
		}
	}

	async refreshToken(oldToken: string): Promise<string> {
		try {
			const decoded = jwt.verify(oldToken, this.jwtConfig.jwtSecret, {
				ignoreExpiration: true,
			}) as any;

			const user = await this.getUserById(decoded.uuid);
			if (!user || user.status !== 'active') {
				throw new Error('User not found or inactive');
			}

			return this.generateJWTToken(user);
		} catch (error) {
			throw new Error('Token refresh failed');
		}
	}

	async checkUserExists(username: string, email: string): Promise<boolean> {
		const existingUsers = await sealDBModel.find(USERS_DB, {
			$or: [
				{ username: validator.escape(username) },
				{ email: validator.escape(email) },
			],
		});
		return existingUsers.length > 0;
	}

	async getAllUsers(): Promise<any[]> {
		const users: Array<User> = await sealDBModel.findAll(USERS_DB);

		const publicUsers = await Promise.all(
			users.map(async (user) => {
				const roleData = await this.getRoleWithPermissions(user.roleUuid);
				return this.getPublicUser(user, roleData || {});
			})
		);

		return publicUsers;
	}

	async deleteUser(userId: string): Promise<void> {
		if (!userId) {
			throw new Error('ID field is required.');
		}
		await sealDBModel.delete(USERS_DB, userId);
	}

	async createUser(userData: UserInput): Promise<any> {
		const userExists = await this.checkUserExists(
			userData.username,
			userData.email
		);
		if (userExists) {
			throw new Error('User with this username or email already exists');
		}

		const hash = await bcrypt.hash(userData.password, saltRounds);
		const newUserData: UserInput = {
			...userData,
			password: hash,
			status: 'active',
		};
		delete newUserData.repeatPassword;

		const newUser = {
			...newUserData,
			uuid: uuidv4(),
			createdAt: new Date(),
			updatedAt: new Date(),
		} as User;

		const user = await sealDBModel.insert(USERS_DB, newUser);
		delete user.password;
		return user;
	}

	async updateUser(userId: string, userData: any): Promise<any> {
		if (!userId) {
			throw new Error('ID field is required.');
		}

		const existingUser = await sealDBModel.findById(USERS_DB, userId);
		if (!existingUser) {
			throw new Error('User not found');
		}

		const updatedUserData: any = { ...userData };
		if (userData.password !== '') {
			const hash = await bcrypt.hash(userData.password, saltRounds);
			updatedUserData.password = hash;
		} else {
			updatedUserData.password = existingUser.password;
		}

		delete updatedUserData.repeatPassword;
		updatedUserData.updatedAt = new Date();

		await sealDBModel.update(USERS_DB, userId, updatedUserData);
		delete updatedUserData.password;
		return updatedUserData;
	}
}