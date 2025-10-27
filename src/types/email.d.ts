interface EmailConfig {
    host: string;
    port: number;
    secure: boolean;
    auth: {
        user: string;
        pass: string;
    };
    from: string;
}

interface WelcomeEmailData {
    businessName: string;
    tenantCode: string;
    ownerName: string;
    email: string;
    authKey: string;
    verificationUrl?: string;
}