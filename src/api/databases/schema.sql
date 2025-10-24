-- =====================================================
-- MULTI-TENANT POS DATABASE SCHEMA FOR MRA EIS INTEGRATION
-- =====================================================

-- =====================================================
-- TENANT MANAGEMENT
-- =====================================================

CREATE TABLE tenants (
    tenant_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_name VARCHAR(255) NOT NULL,
    tin VARCHAR(50) UNIQUE NOT NULL, -- Tax Identification Number
    business_type ENUM('PRODUCT_BASED', 'SERVICE_BASED') NOT NULL,
    phone_number VARCHAR(20) NOT NULL,
    email VARCHAR(255) NOT NULL,
    mra_portal_username VARCHAR(100),
    msonkho_online_status ENUM('VERIFIED', 'PENDING', 'FAILED') DEFAULT 'PENDING',
    subscription_plan VARCHAR(50),
    subscription_status ENUM('ACTIVE', 'SUSPENDED', 'CANCELLED') DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_tin (tin),
    INDEX idx_subscription_status (subscription_status)
);

-- =====================================================
-- MRA API CONFIGURATION & CREDENTIALS
-- =====================================================

CREATE TABLE mra_api_config (
    config_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    environment ENUM('SANDBOX', 'PRODUCTION') DEFAULT 'SANDBOX',
    api_base_url VARCHAR(255) NOT NULL,
    api_key VARCHAR(255) ENCRYPTED, -- Store encrypted
    api_secret VARCHAR(255) ENCRYPTED, -- Store encrypted
    last_sync_timestamp TIMESTAMP,
    sync_status ENUM('SUCCESS', 'FAILED', 'IN_PROGRESS') DEFAULT 'SUCCESS',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (tenant_id) REFERENCES tenants(tenant_id) ON DELETE CASCADE,
    UNIQUE KEY unique_tenant_env (tenant_id, environment)
);

-- =====================================================
-- BRANCHES & LOCATIONS
-- =====================================================

CREATE TABLE branches (
    branch_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    branch_name VARCHAR(255) NOT NULL,
    branch_code VARCHAR(50) NOT NULL,
    is_virtual_warehouse BOOLEAN DEFAULT FALSE, -- MRA Virtual Warehouse
    address TEXT,
    city VARCHAR(100),
    district VARCHAR(100),
    phone_number VARCHAR(20),
    is_active BOOLEAN DEFAULT TRUE,
    mra_approval_status ENUM('PENDING', 'APPROVED', 'REJECTED') DEFAULT 'PENDING',
    mra_approval_date TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (tenant_id) REFERENCES tenants(tenant_id) ON DELETE CASCADE,
    UNIQUE KEY unique_tenant_branch_code (tenant_id, branch_code),
    INDEX idx_tenant_active (tenant_id, is_active)
);

-- =====================================================
-- TERMINAL MANAGEMENT
-- =====================================================

CREATE TABLE terminals (
    terminal_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    branch_id UUID NOT NULL,
    terminal_code VARCHAR(100) UNIQUE NOT NULL, -- MRA generated code
    terminal_name VARCHAR(255) NOT NULL,
    activation_code VARCHAR(255), -- Received from MRA via email/SMS
    activation_status ENUM('PENDING', 'ACTIVATED', 'DEACTIVATED', 'SUSPENDED') DEFAULT 'PENDING',
    activation_date TIMESTAMP NULL,
    device_id VARCHAR(100), -- Physical device identifier
    mra_application_status ENUM('APPLIED', 'APPROVED', 'REJECTED') DEFAULT 'APPLIED',
    mra_approval_date TIMESTAMP NULL,
    last_sync_timestamp TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (tenant_id) REFERENCES tenants(tenant_id) ON DELETE CASCADE,
    FOREIGN KEY (branch_id) REFERENCES branches(branch_id) ON DELETE CASCADE,
    INDEX idx_tenant_branch (tenant_id, branch_id),
    INDEX idx_activation_status (activation_status)
);

-- =====================================================
-- PRODUCTS (Synced from MRA)
-- =====================================================

CREATE TABLE products (
    product_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    mra_product_code VARCHAR(100) NOT NULL, -- MRA assigned code
    product_name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    unit_of_measure VARCHAR(50),
    tax_type VARCHAR(50), -- VAT, Excise, etc.
    tax_rate DECIMAL(5,2),
    base_price DECIMAL(15,2),
    mra_approval_status ENUM('PENDING', 'APPROVED', 'REJECTED') DEFAULT 'PENDING',
    mra_sync_status ENUM('SYNCED', 'PENDING_SYNC', 'FAILED') DEFAULT 'PENDING_SYNC',
    last_synced_at TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (tenant_id) REFERENCES tenants(tenant_id) ON DELETE CASCADE,
    UNIQUE KEY unique_tenant_mra_code (tenant_id, mra_product_code),
    INDEX idx_tenant_active (tenant_id, is_active),
    INDEX idx_mra_approval (mra_approval_status)
);

-- =====================================================
-- SERVICES (For Service-Based Businesses)
-- =====================================================

CREATE TABLE services (
    service_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    mra_service_code VARCHAR(100) NOT NULL, -- MRA assigned code
    service_name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    tax_type VARCHAR(50),
    tax_rate DECIMAL(5,2),
    base_price DECIMAL(15,2),
    mra_approval_status ENUM('PENDING', 'APPROVED', 'REJECTED') DEFAULT 'PENDING',
    mra_sync_status ENUM('SYNCED', 'PENDING_SYNC', 'FAILED') DEFAULT 'PENDING_SYNC',
    last_synced_at TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (tenant_id) REFERENCES tenants(tenant_id) ON DELETE CASCADE,
    UNIQUE KEY unique_tenant_mra_service_code (tenant_id, mra_service_code),
    INDEX idx_tenant_active (tenant_id, is_active)
);

-- =====================================================
-- INVENTORY MANAGEMENT (Product-Based Businesses)
-- =====================================================

CREATE TABLE inventory (
    inventory_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    product_id UUID NOT NULL,
    branch_id UUID NOT NULL,
    quantity_on_hand DECIMAL(15,3) DEFAULT 0,
    quantity_reserved DECIMAL(15,3) DEFAULT 0,
    quantity_available DECIMAL(15,3) GENERATED ALWAYS AS (quantity_on_hand - quantity_reserved) STORED,
    reorder_level DECIMAL(15,3) DEFAULT 0,
    last_stock_take_date TIMESTAMP,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (tenant_id) REFERENCES tenants(tenant_id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE,
    FOREIGN KEY (branch_id) REFERENCES branches(branch_id) ON DELETE CASCADE,
    UNIQUE KEY unique_product_branch (product_id, branch_id),
    INDEX idx_tenant_branch (tenant_id, branch_id)
);

-- =====================================================
-- STOCK TRANSFERS (Virtual Warehouse to Branches)
-- =====================================================

CREATE TABLE stock_transfers (
    transfer_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    transfer_number VARCHAR(50) NOT NULL,
    from_branch_id UUID NOT NULL, -- Usually Virtual Warehouse
    to_branch_id UUID NOT NULL,
    transfer_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status ENUM('PENDING', 'IN_TRANSIT', 'COMPLETED', 'CANCELLED') DEFAULT 'PENDING',
    mra_approval_status ENUM('PENDING', 'APPROVED', 'REJECTED') DEFAULT 'PENDING',
    mra_approval_date TIMESTAMP NULL,
    notes TEXT,
    created_by UUID,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (tenant_id) REFERENCES tenants(tenant_id) ON DELETE CASCADE,
    FOREIGN KEY (from_branch_id) REFERENCES branches(branch_id),
    FOREIGN KEY (to_branch_id) REFERENCES branches(branch_id),
    UNIQUE KEY unique_transfer_number (tenant_id, transfer_number),
    INDEX idx_tenant_status (tenant_id, status)
);

CREATE TABLE stock_transfer_items (
    transfer_item_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transfer_id UUID NOT NULL,
    product_id UUID NOT NULL,
    quantity DECIMAL(15,3) NOT NULL,
    unit_cost DECIMAL(15,2),
    total_cost DECIMAL(15,2) GENERATED ALWAYS AS (quantity * unit_cost) STORED,
    FOREIGN KEY (transfer_id) REFERENCES stock_transfers(transfer_id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(product_id),
    INDEX idx_transfer (transfer_id)
);

-- =====================================================
-- INITIAL STOCK UPLOAD (For MRA Approval)
-- =====================================================

CREATE TABLE initial_stock_uploads (
    upload_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    file_name VARCHAR(255),
    total_items INT DEFAULT 0,
    upload_status ENUM('UPLOADED', 'SUBMITTED', 'PROCESSING') DEFAULT 'UPLOADED',
    mra_approval_status ENUM('PENDING', 'APPROVED', 'REJECTED') DEFAULT 'PENDING',
    mra_approval_date TIMESTAMP NULL,
    mra_rejection_reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (tenant_id) REFERENCES tenants(tenant_id) ON DELETE CASCADE,
    INDEX idx_tenant_status (tenant_id, mra_approval_status)
);

CREATE TABLE initial_stock_upload_items (
    item_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    upload_id UUID NOT NULL,
    product_id UUID NOT NULL,
    quantity DECIMAL(15,3) NOT NULL,
    unit_cost DECIMAL(15,2),
    item_status ENUM('PENDING', 'APPROVED', 'REJECTED') DEFAULT 'PENDING',
    FOREIGN KEY (upload_id) REFERENCES initial_stock_uploads(upload_id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(product_id),
    INDEX idx_upload (upload_id)
);

-- =====================================================
-- ELECTRONIC INVOICES (Sent to MRA)
-- =====================================================

CREATE TABLE invoices (
    invoice_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    terminal_id UUID NOT NULL,
    branch_id UUID NOT NULL,
    invoice_number VARCHAR(100) NOT NULL,
    mra_invoice_code VARCHAR(255), -- MRA generated unique code
    mra_qr_code TEXT, -- QR code from MRA
    invoice_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    customer_name VARCHAR(255),
    customer_tin VARCHAR(50),
    customer_phone VARCHAR(20),
    customer_email VARCHAR(255),
    subtotal DECIMAL(15,2) NOT NULL,
    tax_amount DECIMAL(15,2) NOT NULL,
    discount_amount DECIMAL(15,2) DEFAULT 0,
    total_amount DECIMAL(15,2) NOT NULL,
    payment_method VARCHAR(50),
    invoice_type ENUM('SALE', 'RETURN', 'CREDIT_NOTE', 'DEBIT_NOTE') DEFAULT 'SALE',
    mra_submission_status ENUM('PENDING', 'SUBMITTED', 'ACCEPTED', 'REJECTED') DEFAULT 'PENDING',
    mra_submission_timestamp TIMESTAMP NULL,
    mra_response TEXT,
    is_synced BOOLEAN DEFAULT FALSE,
    sync_attempts INT DEFAULT 0,
    last_sync_attempt TIMESTAMP,
    created_by UUID,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (tenant_id) REFERENCES tenants(tenant_id) ON DELETE CASCADE,
    FOREIGN KEY (terminal_id) REFERENCES terminals(terminal_id),
    FOREIGN KEY (branch_id) REFERENCES branches(branch_id),
    UNIQUE KEY unique_tenant_invoice (tenant_id, invoice_number),
    INDEX idx_tenant_date (tenant_id, invoice_date),
    INDEX idx_mra_status (mra_submission_status),
    INDEX idx_sync_pending (is_synced, mra_submission_status)
);

CREATE TABLE invoice_items (
    item_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_id UUID NOT NULL,
    product_id UUID NULL, -- NULL if service
    service_id UUID NULL, -- NULL if product
    item_type ENUM('PRODUCT', 'SERVICE') NOT NULL,
    mra_item_code VARCHAR(100) NOT NULL, -- MRA product/service code
    item_name VARCHAR(255) NOT NULL,
    quantity DECIMAL(15,3) NOT NULL,
    unit_price DECIMAL(15,2) NOT NULL,
    tax_type VARCHAR(50),
    tax_rate DECIMAL(5,2),
    tax_amount DECIMAL(15,2) NOT NULL,
    discount_amount DECIMAL(15,2) DEFAULT 0,
    line_total DECIMAL(15,2) NOT NULL,
    FOREIGN KEY (invoice_id) REFERENCES invoices(invoice_id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(product_id),
    FOREIGN KEY (service_id) REFERENCES services(service_id),
    INDEX idx_invoice (invoice_id),
    CHECK ((product_id IS NOT NULL AND service_id IS NULL) OR (product_id IS NULL AND service_id IS NOT NULL))
);

-- =====================================================
-- MRA API SYNC LOGS
-- =====================================================

CREATE TABLE mra_api_logs (
    log_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    endpoint VARCHAR(255) NOT NULL,
    http_method VARCHAR(10),
    request_payload JSON,
    response_payload JSON,
    response_code INT,
    status ENUM('SUCCESS', 'FAILED', 'TIMEOUT') NOT NULL,
    error_message TEXT,
    execution_time_ms INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tenant_id) REFERENCES tenants(tenant_id) ON DELETE CASCADE,
    INDEX idx_tenant_created (tenant_id, created_at),
    INDEX idx_status_created (status, created_at)
);

-- =====================================================
-- SYNC QUEUE (For Real-time MRA Submissions)
-- =====================================================

CREATE TABLE mra_sync_queue (
    queue_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    entity_type ENUM('INVOICE', 'PRODUCT', 'SERVICE', 'STOCK_TRANSFER', 'INITIAL_STOCK') NOT NULL,
    entity_id UUID NOT NULL,
    action ENUM('CREATE', 'UPDATE', 'DELETE') NOT NULL,
    priority INT DEFAULT 5, -- 1=highest, 10=lowest
    status ENUM('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED') DEFAULT 'PENDING',
    retry_count INT DEFAULT 0,
    max_retries INT DEFAULT 3,
    error_message TEXT,
    scheduled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    processed_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tenant_id) REFERENCES tenants(tenant_id) ON DELETE CASCADE,
    INDEX idx_status_priority (status, priority, scheduled_at),
    INDEX idx_tenant_status (tenant_id, status)
);

-- =====================================================
-- USERS & AUTHENTICATION
-- =====================================================

CREATE TABLE users (
    user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    username VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    phone_number VARCHAR(20),
    role ENUM('ADMIN', 'MANAGER', 'CASHIER', 'INVENTORY_MANAGER') NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (tenant_id) REFERENCES tenants(tenant_id) ON DELETE CASCADE,
    UNIQUE KEY unique_tenant_username (tenant_id, username),
    UNIQUE KEY unique_email (email),
    INDEX idx_tenant_active (tenant_id, is_active)
);

-- =====================================================
-- AUDIT TRAIL
-- =====================================================

CREATE TABLE audit_logs (
    audit_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    user_id UUID,
    entity_type VARCHAR(100) NOT NULL,
    entity_id UUID NOT NULL,
    action VARCHAR(50) NOT NULL, -- CREATE, UPDATE, DELETE, SYNC
    old_values JSON,
    new_values JSON,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tenant_id) REFERENCES tenants(tenant_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE SET NULL,
    INDEX idx_tenant_created (tenant_id, created_at),
    INDEX idx_entity (entity_type, entity_id)
);