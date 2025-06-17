interface User {
    id?: number;
    uuid: string;
    client_id: string;
    shop_id: string;
    username: string;
    password: string;
    fullname: string;
    email?: string | null;
    phone?: string | null;
    role_uuid: string;
    status?: UserStatus;
    accessible_shops?: string[] | null;
    allowed_workstations?: string[] | null;
    max_discount_percent?: number;
    can_override_prices?: boolean;
    pin_code?: string | null;
    current_shop_id?: string | null;
    last_login?: Date | null;
    last_logout?: Date | null;
    password_changed_at?: Date;
    force_password_change?: boolean;
    created_at?: Date;
    updated_at?: Date;
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