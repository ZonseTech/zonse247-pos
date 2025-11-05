import { mysqlPool } from '../../config/db';
import {
    TENANT_TABLE,
    BRANCHES_TABLE,
    TERMINALS_TABLE,
    USERS_DB,
    USER_SESSIONS_DB,
    CATEGORIES_DB,
    CUSTOMERS_DB,
    INVENTORY_DB,
    TRANSACTIONS_DB,
    ORDERS_DB,
    PAYMENT_METHODS_DB,
    SHOP_SETTINGS_DB,
    SUBSCRIPTION_PLANS_TABLE,
    TENANT_SUBSCRIPTIONS_TABLE,
    AUDIT_LOGS_DB,
    ROLES_DB,
    PERMISSIONS_DB,
    ROLE_PERMISSIONS_DB,
    USER_PERMISSIONS_DB,
    PAYMENT_SERVICE_PROVIDERS_DB,
    MRA_API_CONFIG_TABLE,
    PLAN_FEATURES
} from '../local/tables';

const testConnection = async () => {
    try {
        const connection = await mysqlPool.getConnection();
        console.log('Database connection established successfully');
        connection.release();
        return true;
    } catch (error) {
        console.error('Error connecting to the database:', error);
        return false;
    }
};

const initDatabase = async () => {
    try {
        const connection = await mysqlPool.getConnection();

        await connection.query(`
            CREATE TABLE IF NOT EXISTS ${TENANT_TABLE} (
                id INT PRIMARY KEY AUTO_INCREMENT,
                tenant_id VARCHAR(100) UNIQUE NOT NULL,
                business_name VARCHAR(255) NOT NULL,
                tin VARCHAR(50) UNIQUE NOT NULL,
                tenant_code VARCHAR(50) UNIQUE NOT NULL,
                business_type ENUM('PRODUCT_BASED', 'SERVICE_BASED') NOT NULL,
                phone_number VARCHAR(20) NOT NULL,
                email VARCHAR(255) NOT NULL UNIQUE,
                mra_portal_username VARCHAR(100),
                trading_name VARCHAR(255),
                is_vat_registered BOOLEAN DEFAULT FALSE,
                tax_office_code VARCHAR(50),
                msonkho_online_status ENUM('VERIFIED', 'PENDING', 'FAILED') DEFAULT 'PENDING',
                subscription_plan VARCHAR(50),
                subscription_status ENUM('ACTIVE', 'SUSPENDED', 'CANCELLED', 'TRIAL') DEFAULT 'TRIAL',
                owner_name VARCHAR(100) NOT NULL,
                address TEXT,
                country VARCHAR(50),
                trial_ends_at TIMESTAMP(3) NULL,
                auth_key VARCHAR(255) NOT NULL UNIQUE,
                status ENUM('pending', 'active', 'suspended', 'cancelled') DEFAULT 'pending',
                registered_at TIMESTAMP(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
                activated_at TIMESTAMP(3) NULL,
                synced TINYINT DEFAULT 0,
                created_at TIMESTAMP(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
                updated_at TIMESTAMP(3) NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
                
                INDEX idx_tin (tin),
                INDEX idx_subscription_status (subscription_status),
                INDEX idx_tenant_code (tenant_code),
                INDEX idx_auth_key (auth_key),
                INDEX idx_email (email)
            );
        `);

        await connection.query(`
            CREATE TABLE ${MRA_API_CONFIG_TABLE} (
                config_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                tenant_id UUID NOT NULL,
                environment ENUM('SANDBOX', 'PRODUCTION') DEFAULT 'SANDBOX',
                api_base_url VARCHAR(255) NOT NULL,
                api_key VARCHAR(255) ENCRYPTED,
                api_secret VARCHAR(255) ENCRYPTED,
                last_sync_timestamp TIMESTAMP,
                sync_status ENUM('SUCCESS', 'FAILED', 'IN_PROGRESS') DEFAULT 'SUCCESS',
                is_active BOOLEAN DEFAULT TRUE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                
                FOREIGN KEY (tenant_id) REFERENCES tenants(tenant_id) ON DELETE CASCADE,
                UNIQUE KEY unique_tenant_env (tenant_id, environment)
            );    
        `)

        await connection.query(`
            CREATE TABLE IF NOT EXISTS ${SUBSCRIPTION_PLANS_TABLE} (
                subscription_plan_id INT PRIMARY KEY AUTO_INCREMENT,
                plan_code VARCHAR(50) UNIQUE NOT NULL, -- 'free', 'cloud', 'cloud-mra'
                name VARCHAR(100) NOT NULL,
                description TEXT,
                monthly_price DECIMAL(12, 2) NOT NULL DEFAULT 0,
                yearly_price DECIMAL(12, 2) NOT NULL DEFAULT 0,
                color VARCHAR(20) NOT NULL DEFAULT 'gray',
                is_popular BOOLEAN DEFAULT FALSE,
                is_active BOOLEAN DEFAULT TRUE,
                features JSON NOT NULL,
                limits JSON NOT NULL,
                notes TEXT,
                synced TINYINT DEFAULT 0,
                created_at TIMESTAMP(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
                updated_at TIMESTAMP(3) NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)
            );
        `);

        await connection.query(`
            CREATE TABLE IF NOT EXISTS ${PLAN_FEATURES} (
                feature_category_id INT PRIMARY KEY AUTO_INCREMENT,
                title VARCHAR(100) NOT NULL,
                features JSON NOT NULL,
                display_order INT DEFAULT 0,
                created_at TIMESTAMP(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
                updated_at TIMESTAMP(3) NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)
            );
        `);

        await connection.query(`
            CREATE TABLE IF NOT EXISTS ${TENANT_SUBSCRIPTIONS_TABLE} (
                tenant_subscription_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                tenant_id UUID NOT NULL,
                subscription_plan_id VARCHAR(100) NOT NULL,
                status ENUM('active', 'cancelled', 'expired', 'past_due') DEFAULT 'active',
                starts_at TIMESTAMP(3) NOT NULL,
                ends_at TIMESTAMP(3) NULL,
                auto_renew BOOLEAN DEFAULT TRUE,
                payment_method VARCHAR(50),
                max_shops INT DEFAULT 1,
                synced TINYINT DEFAULT 0,
                last_payment_date TIMESTAMP(3) NULL,
                next_payment_date TIMESTAMP(3) NULL,

                created_at TIMESTAMP(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
                updated_at TIMESTAMP(3) NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
                FOREIGN KEY (tenant_id) REFERENCES ${TENANT_TABLE}(uuid) ON DELETE CASCADE,
                FOREIGN KEY (plan_id) REFERENCES ${SUBSCRIPTION_PLANS_TABLE}(uuid) ON DELETE RESTRICT
            )
        `);

        await connection.query(`
            CREATE TABLE IF NOT EXISTS ${BRANCHES_TABLE} (
                id INT PRIMARY KEY AUTO_INCREMENT,
                branch_id VARCHAR(100) UNIQUE NOT NULL,
                tenant_id VARCHAR(36) NOT NULL,
                branch_name VARCHAR(255) NOT NULL,
                branch_code VARCHAR(50) NOT NULL,
                site_id VARCHAR(100),
                site_name VARCHAR(255),
                description TEXT,
                address_line_1 VARCHAR(255),
                address_line_2 VARCHAR(255),
                address_line_3 VARCHAR(255),
                district VARCHAR(100),
                city VARCHAR(100),
                state VARCHAR(100),
                postal_code VARCHAR(20),
                phone_number VARCHAR(20),
                email VARCHAR(100),
                currency_code VARCHAR(3) DEFAULT 'MKW',
                currency_symbol VARCHAR(10) DEFAULT 'K',
                tax_rate DECIMAL(5, 2) DEFAULT 0.00,
                charge_tax BOOLEAN DEFAULT FALSE,
                receipt_footer TEXT,
                logo_url VARCHAR(500),
                is_virtual_warehouse BOOLEAN DEFAULT FALSE,
                is_active BOOLEAN DEFAULT TRUE,
                synced TINYINT DEFAULT 0,
                mra_approval_status ENUM('PENDING', 'APPROVED', 'REJECTED') DEFAULT 'PENDING',
                mra_approval_date TIMESTAMP NULL,
                status ENUM('active', 'inactive', 'suspended') DEFAULT 'active',
                created_at TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP(3),
                updated_at TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
                
                FOREIGN KEY (tenant_id) REFERENCES tenants(tenant_id) ON DELETE CASCADE,
                UNIQUE KEY unique_tenant_shop (tenant_id, shop_code),
                UNIQUE KEY unique_tenant_branch_code (tenant_id, branch_code),
                INDEX idx_tenant_id (tenant_id),
                INDEX idx_shop_code (shop_code),
                INDEX idx_tenant_active (tenant_id, is_active)
            )
        `);

        await connection.query(`
            CREATE TABLE IF NOT EXISTS ${TERMINALS_TABLE} (
                id INT PRIMARY KEY AUTO_INCREMENT,
                terminal_id VARCHAR(100) UNIQUE NOT NULL,
                tenant_id VARCHAR(36) NOT NULL,
                branch_id VARCHAR(36) NOT NULL,
                mra_terminal_id VARCHAR(100) UNIQUE,
                terminal_code VARCHAR(100) UNIQUE NOT NULL,
                terminal_label VARCHAR(255) NOT NULL,
                terminal_position INT,
                device_id VARCHAR(100),
                os_name VARCHAR(100),
                os_version VARCHAR(100),
                os_build VARCHAR(100),
                mac_address VARCHAR(50),
                pos_product_id VARCHAR(100),
                pos_product_version VARCHAR(50),
                terminal_config_version DECIMAL(10,2),
                offline_max_transaction_age_hours DECIMAL(10,2),
                offline_max_cumulative_amount DECIMAL(15,2),
                activation_code VARCHAR(255),
                activation_status ENUM('PENDING', 'ACTIVATED', 'DEACTIVATED', 'SUSPENDED', 'BLOCKED') DEFAULT 'PENDING',
                activation_date TIMESTAMP NULL,
                is_primary BOOLEAN DEFAULT FALSE,
                is_blocked BOOLEAN DEFAULT FALSE,
                blocking_reason TEXT,
                blocked_at TIMESTAMP NULL,
                mra_application_status ENUM('APPLIED', 'APPROVED', 'REJECTED') DEFAULT 'APPLIED',
                mra_approval_date TIMESTAMP NULL,
                last_activity TIMESTAMP(3) NULL,
                last_sync TIMESTAMP(3) NULL,
                last_sync_timestamp TIMESTAMP NULL,
                synced TINYINT DEFAULT 0,
                registered_at TIMESTAMP(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
                created_at TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP(3),
                updated_at TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
                
                FOREIGN KEY (tenant_id) REFERENCES tenants(tenant_id) ON DELETE CASCADE,
                FOREIGN KEY (branch_id) REFERENCES branches(branch_id) ON DELETE CASCADE,

                UNIQUE KEY unique_tenant_till_number (tenant_id, till_number),
                INDEX idx_tenant_id (tenant_id),
                INDEX idx_branch_id (branch_id),
                INDEX idx_tenant_branch (tenant_id, branch_id),
                INDEX idx_activation_status (activation_status)
            );
        `);

        await connection.query(`
            CREATE TABLE IF NOT EXISTS ${ROLES_DB} (
                id INT PRIMARY KEY AUTO_INCREMENT,
                uuid VARCHAR(100) NOT NULL UNIQUE,
                tenant_id VARCHAR(100) NOT NULL,
                branch_id VARCHAR(100),
                name VARCHAR(50) NOT NULL,
                display_name VARCHAR(100) NOT NULL,
                description TEXT,
                synced TINYINT DEFAULT 0,
                is_system_role BOOLEAN DEFAULT FALSE,
                is_active BOOLEAN DEFAULT TRUE,
                created_at TIMESTAMP(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
                updated_at TIMESTAMP(3) NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
                
                FOREIGN KEY (tenant_id) REFERENCES ${TENANT_TABLE}(uuid) ON DELETE CASCADE,
                FOREIGN KEY (branch_id) REFERENCES ${BRANCHES_TABLE}(uuid) ON DELETE CASCADE,
                
                UNIQUE KEY unique_client_shop_role (tenant_, branch_id, name),
                INDEX idx_tenant_id (tenant_id),
                INDEX idx_branch_id (branch_id),
                INDEX idx_name (name)
            )
        `);

        await connection.query(`
            CREATE TABLE IF NOT EXISTS ${PERMISSIONS_DB} (
                id INT PRIMARY KEY AUTO_INCREMENT,
                uuid VARCHAR(100) NOT NULL UNIQUE,
                name VARCHAR(255) NOT NULL UNIQUE,
                display_name VARCHAR(255) NOT NULL,
                description TEXT,
                category VARCHAR(255) NOT NULL, 
                scope ENUM('global', 'workstation', 'self', 'system', 'client', 'shop') DEFAULT 'shop',
                synced TINYINT DEFAULT 0,
                is_system_permission BOOLEAN DEFAULT TRUE,
                created_at TIMESTAMP(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
                updated_at TIMESTAMP(3) NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
                
                INDEX idx_name (name),
                INDEX idx_category (category),
                INDEX idx_scope (scope)
            )
        `);

        await connection.query(`
            CREATE TABLE IF NOT EXISTS ${ROLE_PERMISSIONS_DB} (
                id INT PRIMARY KEY AUTO_INCREMENT,
                uuid VARCHAR(100) NOT NULL UNIQUE,
                role_uuid VARCHAR(100) NOT NULL,
                permission_uuid VARCHAR(100) NOT NULL,
                synced TINYINT DEFAULT 0,
                created_at TIMESTAMP(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
                updated_at TIMESTAMP(3) NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
                
                FOREIGN KEY (role_uuid) REFERENCES ${ROLES_DB}(uuid) ON DELETE CASCADE,
                FOREIGN KEY (permission_uuid) REFERENCES ${PERMISSIONS_DB}(uuid) ON DELETE CASCADE,
                
                UNIQUE KEY unique_role_permission (role_uuid, permission_uuid),
                INDEX idx_role_uuid (role_uuid),
                INDEX idx_permission_uuid (permission_uuid)
            )
        `);

        await connection.query(`
            CREATE TABLE IF NOT EXISTS ${USERS_DB} (
                id INT PRIMARY KEY AUTO_INCREMENT,
                uuid VARCHAR(100) NOT NULL UNIQUE,
                tenant_id VARCHAR(100) NOT NULL,
                branch_id VARCHAR(100) NOT NULL,
                username VARCHAR(50) NOT NULL,
                password VARCHAR(255) NOT NULL,
                fullname VARCHAR(100) NOT NULL,
                email VARCHAR(100),
                phone VARCHAR(20),
                role_uuid VARCHAR(100) NOT NULL,
                status ENUM('active', 'inactive', 'suspended') DEFAULT 'active',
                accessible_shops JSON,
                allowed_workstations JSON,
                max_discount_percent DECIMAL(5, 2) DEFAULT 0.00,
                can_override_prices BOOLEAN DEFAULT FALSE,
                pin_code VARCHAR(10),
                current_branch_id VARCHAR(100) NULL,
                last_login TIMESTAMP(3) NULL,
                last_logout TIMESTAMP(3) NULL,
                password_changed_at TIMESTAMP(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
                force_password_change BOOLEAN DEFAULT FALSE,
                synced TINYINT DEFAULT 0,
                created_at TIMESTAMP(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
                updated_at TIMESTAMP(3) NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),

                FOREIGN KEY (branch_id) REFERENCES ${BRANCHES_TABLE}(uuid) ON DELETE CASCADE,
                FOREIGN KEY (tenant_id) REFERENCES ${TENANT_TABLE}(uuid) ON DELETE CASCADE,
                FOREIGN KEY (role_uuid) REFERENCES ${ROLES_DB}(uuid) ON DELETE RESTRICT,
                FOREIGN KEY (current_branch_id) REFERENCES ${BRANCHES_TABLE}(uuid) ON DELETE SET NULL,

                UNIQUE KEY unique_client_username (tenant_, username),
                INDEX idx_tenant_id (tenant_id),
                INDEX idx_username (username),
                INDEX idx_role_uuid (role_uuid)
            )
        `);

        await connection.query(`
            CREATE TABLE IF NOT EXISTS ${USER_PERMISSIONS_DB} (
                id INT PRIMARY KEY AUTO_INCREMENT,
                user_uuid VARCHAR(100) NOT NULL,
                permission_uuid VARCHAR(100) NOT NULL,
                branch_id VARCHAR(100),
                granted BOOLEAN NOT NULL,
                created_at TIMESTAMP(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
                created_by VARCHAR(100),
                synced TINYINT DEFAULT 0,
                FOREIGN KEY (user_uuid) REFERENCES ${USERS_DB}(uuid) ON DELETE CASCADE,
                FOREIGN KEY (permission_uuid) REFERENCES ${PERMISSIONS_DB}(uuid) ON DELETE CASCADE,
                FOREIGN KEY (branch_id) REFERENCES ${BRANCHES_TABLE}(uuid) ON DELETE CASCADE,
                FOREIGN KEY (created_by) REFERENCES ${USERS_DB}(uuid) ON DELETE SET NULL,
                
                UNIQUE KEY unique_user_permission_shop (user_uuid, permission_uuid, branch_id),
                INDEX idx_user_uuid (user_uuid),
                INDEX idx_permission_uuid (permission_uuid),
                INDEX idx_branch_id (branch_id)
            )
        `);

        await connection.query(`
            CREATE TABLE IF NOT EXISTS ${USER_SESSIONS_DB} (
                id INT PRIMARY KEY AUTO_INCREMENT,
                uuid VARCHAR(100) NOT NULL UNIQUE,
                user_uuid VARCHAR(100) NOT NULL,
                workstation_uuid VARCHAR(100) NOT NULL,
                session_token VARCHAR(255) NOT NULL UNIQUE,
                ip_address VARCHAR(45),
                user_agent TEXT,
                started_at TIMESTAMP(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
                last_activity TIMESTAMP(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
                ended_at TIMESTAMP(3) NULL,
                synced TINYINT DEFAULT 0,
                is_active BOOLEAN DEFAULT TRUE,
                created_at TIMESTAMP(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
                updated_at TIMESTAMP(3) NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
                FOREIGN KEY (user_uuid) REFERENCES ${USERS_DB}(uuid) ON DELETE CASCADE,
                FOREIGN KEY (workstation_uuid) REFERENCES ${TERMINALS_TABLE}(uuid) ON DELETE CASCADE,
                INDEX idx_user_uuid (user_uuid),
                INDEX idx_session_token (session_token),
                INDEX idx_workstation_uuid (workstation_uuid)
            )
        `);

        await connection.query(`
            CREATE TABLE IF NOT EXISTS ${CATEGORIES_DB} (
                id INT PRIMARY KEY AUTO_INCREMENT,
                uuid VARCHAR(100) NOT NULL UNIQUE,
                branch_id VARCHAR(100) NOT NULL,
                tenant_id VARCHAR(100) NOT NULL,
                user_uuid VARCHAR(100) NOT NULL,
                name VARCHAR(100) NOT NULL,
                description TEXT,
                color VARCHAR(7),
                is_active BOOLEAN DEFAULT TRUE,
                sort_order INT DEFAULT 0,
                item_count INT(11) NULL,
                synced TINYINT DEFAULT 0,
                created_at TIMESTAMP(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
                updated_at TIMESTAMP(3) NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
                FOREIGN KEY (branch_id) REFERENCES ${BRANCHES_TABLE}(uuid) ON DELETE CASCADE,
                UNIQUE KEY unique_shop_category (branch_id, name),
                INDEX idx_branch_id (branch_id)
            )
        `);

        await connection.query(`
            CREATE TABLE IF NOT EXISTS ${PAYMENT_SERVICE_PROVIDERS_DB} (
                id INT PRIMARY KEY AUTO_INCREMENT,
                uuid VARCHAR(100) NOT NULL UNIQUE,
                branch_id VARCHAR(100) NOT NULL,
                tenant_id VARCHAR(100) NOT NULL,
                user_uuid VARCHAR(100) NOT NULL,
                name VARCHAR(100) NOT NULL,
                description TEXT,
                logoUrl TEXT,
                is_active BOOLEAN DEFAULT TRUE,
                sort_order INT DEFAULT 0,
                synced TINYINT DEFAULT 0,
                created_at TIMESTAMP(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
                updated_at TIMESTAMP(3) NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
                FOREIGN KEY (branch_id) REFERENCES ${BRANCHES_TABLE}(uuid) ON DELETE CASCADE,
                UNIQUE KEY unique_shop_service_provider(branch_id, name),
                INDEX idx_branch_id (branch_id)
            )
        `);

        await connection.query(`
            CREATE TABLE IF NOT EXISTS ${CUSTOMERS_DB} (
                id INT PRIMARY KEY AUTO_INCREMENT,
                uuid VARCHAR(100) NOT NULL UNIQUE,
                tenant_id VARCHAR(100) NOT NULL,
                branch_id VARCHAR(100) NOT NULL,
                user_uuid VARCHAR(100),
                name VARCHAR(100) NOT NULL,
                synced TINYINT DEFAULT 0,
                created_at TIMESTAMP(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
                updated_at TIMESTAMP(3) NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
                FOREIGN KEY (branch_id) REFERENCES ${BRANCHES_TABLE}(uuid) ON DELETE CASCADE,
                INDEX idx_branch_id (branch_id)
            )
        `);

        await connection.query(`
            CREATE TABLE IF NOT EXISTS ${PAYMENT_METHODS_DB} (
                id INT PRIMARY KEY AUTO_INCREMENT,
                uuid VARCHAR(100) NOT NULL UNIQUE,
                branch_id VARCHAR(100) NOT NULL,
                tenant_id VARCHAR(100) NOT NULL,
                user_uuid VARCHAR(100) NOT NULL,
                name VARCHAR(50) NOT NULL,
                is_active BOOLEAN DEFAULT TRUE,
                icon VARCHAR(500) NULL,
                sort_order INT DEFAULT 0,
                synced TINYINT DEFAULT 0,
                created_at TIMESTAMP(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
                updated_at TIMESTAMP(3) NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
                FOREIGN KEY (branch_id) REFERENCES ${BRANCHES_TABLE}(uuid) ON DELETE CASCADE,
                FOREIGN KEY (tenant_id) REFERENCES ${TENANT_TABLE}(uuid) ON DELETE CASCADE,
                FOREIGN KEY (user_uuid) REFERENCES ${USERS_DB}(uuid) ON DELETE CASCADE,
                UNIQUE KEY unique_${BRANCHES_TABLE}_${PAYMENT_METHODS_DB} (branch_id, name),
                UNIQUE KEY unique_${USERS_DB}_${PAYMENT_METHODS_DB} (user_uuid, name),
                UNIQUE KEY unique_${TENANT_TABLE}_${PAYMENT_METHODS_DB} (tenant_, name),
                INDEX idx_branch_id (branch_id),
                INDEX idx_user_uuid (user_uuid),
                INDEX idx_tenant_id (tenant_id)
            )
        `);

        await connection.query(`
            CREATE TABLE IF NOT EXISTS ${INVENTORY_DB} (
                id INT PRIMARY KEY AUTO_INCREMENT,
                uuid VARCHAR(100) NOT NULL UNIQUE,
                branch_id VARCHAR(100) NOT NULL,
                tenant_id VARCHAR(100) NOT NULL,
                user_uuid VARCHAR(100) NOT NULL,
                category_uuid VARCHAR(100),
                barcode VARCHAR(100) NOT NULL,
                sku VARCHAR(50),
                name VARCHAR(200) NOT NULL,
                description TEXT,
                brand VARCHAR(100),
                unit VARCHAR(20) DEFAULT 'piece',
                cost_price DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
                sell_price DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
                promo_price DECIMAL(10, 2),
                promo_start DATE,
                promo_end DATE,
                quantity VARCHAR(100) DEFAULT 0,
                reserved_quantity INT DEFAULT 0,
                min_stock INT DEFAULT 0,
                original_quantity VARCHAR(20) DEFAULT 0,
                max_stock INT,
                stock INT,
                reorder_level INT,
                weight DECIMAL(8, 3),
                dimensions VARCHAR(50),
                color VARCHAR(50),
                size VARCHAR(50),
                status ENUM('active', 'inactive', 'discontinued', 'out_of_stock') DEFAULT 'active',
                track_inventory BOOLEAN DEFAULT TRUE,
                allow_negative_stock BOOLEAN DEFAULT FALSE,
                is_taxable BOOLEAN DEFAULT TRUE,
                expiration_date DATE,
                manufacture_date DATE,
                image_urls JSON,
                supplier_name VARCHAR(100),
                supplier_code VARCHAR(50),
                created_by VARCHAR(100),
                last_updated_by VARCHAR(100),
                synced TINYINT DEFAULT 0,
                created_at TIMESTAMP(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
                updated_at TIMESTAMP(3) NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
                
                FOREIGN KEY (branch_id) REFERENCES ${BRANCHES_TABLE}(uuid) ON DELETE CASCADE,
                FOREIGN KEY (category_uuid) REFERENCES ${CATEGORIES_DB}(uuid) ON DELETE SET NULL,
                FOREIGN KEY (created_by) REFERENCES ${USERS_DB}(uuid) ON DELETE SET NULL,
                FOREIGN KEY (last_updated_by) REFERENCES ${USERS_DB}(uuid) ON DELETE SET NULL,
                
                INDEX idx_branch_id (branch_id),
                INDEX idx_category_uuid (category_uuid),
                INDEX idx_barcode (barcode),
                INDEX idx_name (name),
                INDEX idx_status (status)
            )
        `);

        await connection.query(`
            CREATE TABLE IF NOT EXISTS ${TRANSACTIONS_DB} (
                id INT PRIMARY KEY AUTO_INCREMENT,
                uuid VARCHAR(100) NOT NULL UNIQUE,
                ref_number VARCHAR(50) NOT NULL,
                discount DECIMAL(10, 2) DEFAULT 0.00,
                customer_uuid VARCHAR(100),
                subtotal DECIMAL(10, 2) DEFAULT 0.00,
                tax DECIMAL(10, 2) DEFAULT 0.00,
                date TIMESTAMP(3) NULL,
                payment_method_uuid VARCHAR(100),
                transaction_id VARCHAR(100),
                phone_number VARCHAR(20),
                payment_service_provider_uuid VARCHAR(100),
                total DECIMAL(10, 2) DEFAULT 0.00,
                paid DECIMAL(10, 2) DEFAULT 0.00,
                change_amount DECIMAL(10, 2) DEFAULT 0.00,
                till_uuid VARCHAR(100),
                user_uuid VARCHAR(100),
                tenant_id VARCHAR(100) NOT NULL,
                branch_id VARCHAR(100) NOT NULL,
                status VARCHAR(50),
                synced TINYINT DEFAULT 0,
                created_at TIMESTAMP(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
                updated_at TIMESTAMP(3) NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
                FOREIGN KEY (branch_id) REFERENCES ${BRANCHES_TABLE}(uuid) ON DELETE CASCADE,
                INDEX idx_branch_id (branch_id)
            )
        `);

        await connection.query(`
            CREATE TABLE IF NOT EXISTS ${ORDERS_DB} (
                id INT PRIMARY KEY AUTO_INCREMENT,
                uuid VARCHAR(100) NOT NULL UNIQUE,
                ref_number VARCHAR(100) NOT NULL,
                transaction_uuid VARCHAR(100) DEFAULT 1,
                product_uuid VARCHAR(100) NOT NULL,
                quantity DECIMAL(10, 3) NOT NULL DEFAULT 1,
                purchase_price DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
                sell_price DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
                synced TINYINT DEFAULT 0,
                created_at TIMESTAMP(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
                updated_at TIMESTAMP(3) NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
                INDEX idx_transaction_uuid (transaction_uuid)
            )
        `);

        await connection.query(`
            CREATE TABLE IF NOT EXISTS ${SHOP_SETTINGS_DB} (
                id INT PRIMARY KEY AUTO_INCREMENT,
                uuid VARCHAR(100) NOT NULL UNIQUE,
                tenant_id VARCHAR(100) NOT NULL,
                branch_id VARCHAR(100) NOT NULL,
                workstation_uuid VARCHAR(100) NOT NULL,
                app VARCHAR(100),
                store VARCHAR(255),
                address_line1 VARCHAR(255),
                address_line2 VARCHAR(255),
                country VARCHAR(100),
                city VARCHAR(100),
                contact VARCHAR(100),
                tax VARCHAR(50),
                symbol VARCHAR(10),
                footer TEXT,
                status ENUM('active', 'inactive', 'suspended') DEFAULT 'inactive',
                synced TINYINT DEFAULT 0,
                created_at TIMESTAMP(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
                updated_at TIMESTAMP(3) NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
                FOREIGN KEY (branch_id) REFERENCES ${BRANCHES_TABLE}(uuid) ON DELETE CASCADE,
                UNIQUE KEY unique_shop_settings (branch_id),
                INDEX idx_branch_id (branch_id)
            )
        `);

        await connection.query(`
            CREATE TABLE IF NOT EXISTS ${AUDIT_LOGS_DB} (
                id INT PRIMARY KEY AUTO_INCREMENT,
                uuid VARCHAR(100) NOT NULL UNIQUE,
                tenant_id VARCHAR(100),
                branch_id VARCHAR(100),
                user_uuid VARCHAR(100),
                workstation_uuid VARCHAR(100),
                action_type ENUM('create', 'update', 'delete', 'login', 'logout', 'access', 'export', 'import', 'backup', 'sync') NOT NULL,
                entity_type VARCHAR(50) NOT NULL,
                entity_id VARCHAR(100),
                entity_name VARCHAR(200),
                old_values JSON,
                new_values JSON,
                changes_summary TEXT,
                ip_address VARCHAR(45),
                user_agent TEXT,
                request_method VARCHAR(10),
                request_url VARCHAR(500),
                description TEXT,
                synced TINYINT DEFAULT 0,
                severity ENUM('low', 'medium', 'high', 'critical') DEFAULT 'low',
                created_at TIMESTAMP(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
                
                FOREIGN KEY (tenant_id) REFERENCES ${TENANT_TABLE}(uuid) ON DELETE SET NULL,
                FOREIGN KEY (branch_id) REFERENCES ${BRANCHES_TABLE}(uuid) ON DELETE SET NULL,
                FOREIGN KEY (user_uuid) REFERENCES ${USERS_DB}(uuid) ON DELETE SET NULL,
                FOREIGN KEY (workstation_uuid) REFERENCES ${TERMINALS_TABLE}(uuid) ON DELETE SET NULL,
                
                INDEX idx_tenant_id (tenant_id),
                INDEX idx_branch_id (branch_id),
                INDEX idx_user_uuid (user_uuid),
                INDEX idx_action_type (action_type),
                INDEX idx_entity_type (entity_type),
                INDEX idx_created_at (created_at)
            )
        `);

        connection.release();
        console.log('Enhanced multi-tenant database initialized successfully');
        return true;
    } catch (error) {
        console.error('Error initializing database:', error);
        return false;
    }
};

const seedDefaultData = async () => {
    try {
        const connection = await mysqlPool.getConnection();

        await connection.query(`
            INSERT IGNORE INTO ${SUBSCRIPTION_PLANS_TABLE} (uuid, name, description, price, billing_cycle, max_shops, max_users_per_shop, max_products, max_transactions_per_month, features) VALUES
            ('plan-basic-001', 'Basic Plan', 'Perfect for small businesses', 9.99, 'monthly', 1, 3, 500, 1000, '["basic_pos", "inventory_management", "basic_reports"]'),
            ('plan-pro-001', 'Professional Plan', 'Great for growing businesses', 29.99, 'monthly', 3, 10, 5000, 10000, '["advanced_pos", "inventory_management", "advanced_reports", "customer_management", "loyalty_program"]'),
            ('plan-enterprise-001', 'Enterprise Plan', 'For large businesses', 99.99, 'monthly', 10, 50, 50000, 100000, '["full_pos", "advanced_inventory", "comprehensive_reports", "multi_location", "api_access", "custom_integrations"]'),
            ('plan-trial-001', 'Trial Plan', '30-day free trial', 0.00, 'monthly', 1, 2, 100, 500, '["basic_pos", "basic_inventory", "basic_reports"]')
        `);

        connection.release();
        console.log('Default data seeded successfully');
        return true;
    } catch (error) {
        console.error('Error seeding default data:', error);
        return false;
    }
};

export { testConnection, initDatabase, seedDefaultData };