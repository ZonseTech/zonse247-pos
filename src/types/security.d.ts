interface CreateSettingRequest {
    tenantId: string;
    branchId: string;
    terminalId: string;
    authKey: string;
    branchName?: string;
    terminalName?: string;
}

interface TerminalSettings extends CreateSettingRequest {
    id?: string;
    tenantSignature: string;
    encryptedAuthKey: string;
    iv: string;
    createdAt?: Date;
    updatedAt?: Date;
}

interface EncryptionResult {
    encrypted: string;
    iv: string;
}