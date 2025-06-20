interface User {
    id?: number;
    uuid: string;
    clientId: string;
    shopId: string;
    username: string;
    password: string;
    fullname: string;
    email?: string | null;
    phone?: string | null;
    roleUuid: string;
    roleName?: string | null;
    permissions?: string[] | null;
    status?: UserStatus;
    accessibleShops?: string[] | null;
    allowedWorkstations?: string[] | null;
    maxDiscountPercent?: number;
    canOverridePrices?: boolean;
    pinCode?: string | null;
    currentShopId?: string | null;
    lastLogin?: Date | null;
    lastLogout?: Date | null;
    passwordChangedAt?: Date;
    forcePasswordChange?: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}

type UserStatus = 'active' | 'inactive' | 'suspended';

interface CreateUserRequest extends Omit<User, 'uuid' | 'id' | 'createdAt' | 'updatedAt' | 'lastLogin' | 'lastLogout' | 'roleName' | 'permissions'> {

}

interface PublicUser extends Omit<User, 'password'> {
    roleName?: string;
    permissions?: string[];
}

interface UserDetailsModalProps {
    user?: User | null;
    isOpen?: boolean;
    onClose?: () => void;
}

interface UserDetailsModalProps {
    user?: User | null;
    isOpen?: boolean;
    onClose?: () => void;
}

interface UserFormModalProps {
    user?: User;
    isOpen?: boolean;
    onClose?: () => void;
    onUserSaved?: () => void;
}