interface EncryptionResult {
    encrypted: string;
    iv: string;
}

interface SetupParams {
    setupId: string;
    tenantId: string;
    branchId: string;
    terminalId: string;
    verificationToken: string;
    tenantSignature?: string;
    createdAt?: Date;
    updatedAt?: Date;
}

interface SetupData {
    setupId: string;
    tenantId: string;
    branchId: string;
    terminalId: string;
    encryptedVerificationToken: string;
    iv: string;
    dataSignature: string;
    createdAt: Date;
    updatedAt: Date;
}

interface EncryptedSetupParams {
    id: string;
    encryptedVerificationToken: string;
    iv: string;
    dataSignature: string;
    createdAt: Date;
    updatedAt: Date;
}