interface EncryptionResult {
    encrypted: string;
    iv: string;
}

interface SetupParams {
    uuid: string;
    tenantId: string;
    branchId: string;
    terminalId: string;
    verificationToken: string;
    tenantSignature?: string;
    createdAt?: Date;
    updatedAt?: Date;
}

interface SetupData {
    id: string;
    tenantId: string;
    branchId: string;
    terminalId: string;
    verificationToken: string;
}

interface EncryptedSetupParams {
    id: string;
    encryptedVerificationToken: string;
    iv: string;
    dataSignature: string;
    createdAt: Date;
    updatedAt: Date;
}