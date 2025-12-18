interface TerminalVerificationParams {
    verificationToken: string;
    os: string;
    hostname: string;
    macAddress: string;
}

type ValidationParams = {
    tenantId: string;
    branchId: string;
    terminalId: string;
    verificationKey: string;
}

interface OnboardingStatus {
    tenant: Omit<Tenant, 'verificationToken'>;
    subscription: any;
    branches: any[];
    terminals: any[];
    onboarding: {
        steps: {
            tenantRegistered: boolean;
            subscriptionActive: boolean;
            branchCreated: boolean;
            terminalSetup: boolean;
        };
        completedSteps: number;
        totalSteps: number;
        completionPercentage: number;
        isComplete: boolean;
    };
}