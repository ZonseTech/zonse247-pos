import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import validator from 'validator';
import { PERMISSIONS_DB, ROLE_PERMISSIONS_DB, ROLES_DB, USERS_DB } from '../databases/local/tables';
import { sealDBModel } from '../databases/local';
import { v4 as uuidv4 } from 'uuid';
import config from '../config';

const saltRounds = 10;

export class UserService {
	static async getUserById(userId: string): Promise<any> {
		if (!userId) {
			throw new Error('ID field is required.');
		}
		return await sealDBModel.findById(USERS_DB, userId);
	}

	static async logoutUser(userId: string): Promise<void> {
		if (!userId) {
			throw new Error('ID field is required.');
		}
		await sealDBModel.update(USERS_DB, userId, {
			lastLoggedOut: new Date(),
		});
	}

	static async loginUser(
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

	private static getPublicUser(user: User, privileges: any): PublicUser {
		const { password, ...publicUser } = user;
		return {
			...publicUser,
			roleName: privileges.roleName || null,
			permissions: privileges.permissions || null,
		};
	}

	private static async getRoleWithPermissions(
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

	private static generateJWTToken(user: any): string {
		const payload = {
			...user,
			iat: Math.floor(Date.now() / 1000),
		};

		return (jwt as any).sign(payload, config.jwt.secret, {
			expiresIn: config.jwt.expiresIn,
			issuer: config.app.name,
			audience: config.app.users,
		});
	}

	static verifyJWTToken(token: string): any {
		try {
			return jwt.verify(token, config.jwt.secret);
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

	static async refreshToken(oldToken: string): Promise<string> {
		try {
			const decoded = jwt.verify(oldToken, config.jwt.secret, {
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

	static async checkUserExists(username: string, email: string): Promise<boolean> {
		const existingUsers = await sealDBModel.find(USERS_DB, {
			$or: [
				{ username: validator.escape(username) },
				{ email: validator.escape(email) },
			],
		});
		return existingUsers.length > 0;
	}

	static async getAllUsers(query?: any): Promise<any[]> {
		let users: Array<User>;

		if (query && Object.keys(query).length > 0) {
			const searchCriteria: any = {};

			if (query.status) {
				searchCriteria.status = query.status;
			}
			if (query.roleUuid) {
				searchCriteria.roleUuid = query.roleUuid;
			}
			if (query.shopUuid) {
				searchCriteria.shopUuid = query.shopUuid;
			}
			if (query.search) {
				const searchTerm = validator.escape(query.search);
				searchCriteria.$or = [
					{ username: { $regex: searchTerm, $options: 'i' } },
					{ email: { $regex: searchTerm, $options: 'i' } },
					{ firstName: { $regex: searchTerm, $options: 'i' } },
					{ lastName: { $regex: searchTerm, $options: 'i' } }
				];
			}

			users = await sealDBModel.find(USERS_DB, searchCriteria);
		} else {
			users = await sealDBModel.findAll(USERS_DB);
		}

		const publicUsers = await Promise.all(
			users.map(async (user) => {
				const roleData = await this.getRoleWithPermissions(user.roleUuid);
				return this.getPublicUser(user, roleData || {});
			})
		);

		return publicUsers;
	}

	static async deleteUser(userId: string): Promise<void> {
		if (!userId) {
			throw new Error('ID field is required.');
		}
		await sealDBModel.delete(USERS_DB, userId);
	}

	static async createUser(userData: CreateUserRequest): Promise<any> {
		const userExists = await this.checkUserExists(
			userData.username,
			userData.email
		);
		if (userExists) {
			throw new Error('User with this username or email already exists');
		}

		const hash = await bcrypt.hash(userData.password, saltRounds);
		const newUserData = {
			...userData,
			password: hash,
			status: 'active',
		};

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

	static async updateUser(userId: string, userData: any): Promise<User> {
		if (!userId) {
			throw new Error('ID field is required.');
		}

		const existingUser = await sealDBModel.findById(USERS_DB, userId);
		if (!existingUser) {
			throw new Error('User not found');
		}

		const updatedUserData = { ...userData };
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

	static async changePassword(
		userId: string,
		currentPassword: string,
		newPassword: string
	): Promise<void> {
		if (!userId) {
			throw new Error('User ID is required.');
		}

		if (!currentPassword || !newPassword) {
			throw new Error('Current password and new password are required.');
		}

		if (newPassword.length < 8) {
			throw new Error('Password must be at least 8 characters long.');
		}

		const user = await sealDBModel.findById<User>(USERS_DB, userId);
		if (!user) {
			throw new Error('User not found');
		}

		const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
		if (!isCurrentPasswordValid) {
			throw new Error('Current password is incorrect');
		}

		const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);
		await sealDBModel.update(USERS_DB, userId, {
			password: hashedNewPassword,
			updatedAt: new Date(),
		});
	}


	static async resetPassword(userId: string): Promise<{ tempPassword: string }> {
		if (!userId) {
			throw new Error('User ID is required.');
		}

		const user = await sealDBModel.findById<User>(USERS_DB, userId);
		if (!user) {
			throw new Error('User not found');
		}

		const tempPassword = this.generateTempPassword();
		const hashedTempPassword = await bcrypt.hash(tempPassword, saltRounds);

		await sealDBModel.update(USERS_DB, userId, {
			password: hashedTempPassword,
			passwordResetRequired: true,
			updatedAt: new Date(),
		});

		return { tempPassword };
	}


	private static generateTempPassword(): string {
		const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
		let tempPassword = '';
		for (let i = 0; i < 12; i++) {
			tempPassword += chars.charAt(Math.floor(Math.random() * chars.length));
		}
		return tempPassword;
	}


	static async getUsersByRole(roleId: string): Promise<any[]> {
		if (!roleId) {
			throw new Error('Role ID is required.');
		}

		const users = await sealDBModel.find<User[]>(USERS_DB, { roleUuid: roleId });

		const publicUsers = await Promise.all(
			users.map(async (user) => {
				const roleData = await this.getRoleWithPermissions(user.roleUuid);
				return this.getPublicUser(user, roleData || {});
			})
		);

		return publicUsers;
	}

	static async getUsersByShop(shopId: string): Promise<any[]> {
		if (!shopId) {
			throw new Error('Shop ID is required.');
		}

		const users = await sealDBModel.find<User[]>(USERS_DB, { shopUuid: shopId });

		const publicUsers = await Promise.all(
			users.map(async (user) => {
				const roleData = await this.getRoleWithPermissions(user.roleUuid);
				return this.getPublicUser(user, roleData || {});
			})
		);

		return publicUsers;
	}

	static async updateUserStatus(
		userId: string,
		status: 'active' | 'inactive' | 'suspended'
	): Promise<any> {
		if (!userId) {
			throw new Error('User ID is required.');
		}

		if (!status || !['active', 'inactive', 'suspended'].includes(status)) {
			throw new Error('Valid status is required (active, inactive, suspended).');
		}

		const user = await sealDBModel.findById<User>(USERS_DB, userId);
		if (!user) {
			throw new Error('User not found');
		}

		await sealDBModel.update(USERS_DB, userId, {
			status,
			updatedAt: new Date(),
		});

		const updatedUser = await sealDBModel.findById<User>(USERS_DB, userId);
		const roleData = await this.getRoleWithPermissions(updatedUser.roleUuid);

		return this.getPublicUser(updatedUser, roleData || {});
	}
}