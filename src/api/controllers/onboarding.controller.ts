import { Request, Response } from 'express';
import { ShopService } from '../services/shop.service';
import { ClientService } from '../services/client.service';
import { WorkstationService } from '../services/workstation.service';
import { SubscriptionService } from '../services/subscription.service';

export class OnboardingController {
    static sendResponse<T>(res: Response, statusCode: number, success: boolean, message: string, data?: T, error?: string): void {
        const response: ApiResponse<T> = {
            success,
            message,
            ...(data && { data }),
            ...(error && { error })
        };
        res.status(statusCode).json(response);
    }

    static async getSubscriptionPlans(req: Request, res: Response): Promise<void> {
        try {
            const plans = await SubscriptionService.getActivePlans();
            OnboardingController.sendResponse(res, 200, true, 'Subscription plans retrieved successfully', plans);
        } catch (error: any) {
            console.error('Error fetching subscription plans:', error);
            OnboardingController.sendResponse(res, 500, false, 'Failed to fetch subscription plans', undefined, error.message);
        }
    }

    static async registerClient(req: Request<{}, ApiResponse<Client>, RegisterClientRequest>, res: Response): Promise<void> {
        try {
            const newClient = await ClientService.registerClient(req.body);
            OnboardingController.sendResponse(res, 201, true, 'Client registered successfully', newClient);
        } catch (error: any) {
            console.error('Error registering client:', error);

            let statusCode = 500;
            if (error.message.includes('Missing required field') || error.message.includes('Invalid email format')) {
                statusCode = 400;
            } else if (error.message.includes('already exists')) {
                statusCode = 409;
            }

            OnboardingController.sendResponse(res, statusCode, false, error.message, undefined, error.message);
        }
    }

    static async createSubscription(req: Request<{}, ApiResponse<ClientSubscription>, CreateSubscriptionRequest>, res: Response): Promise<void> {
        try {
            const newSubscription = await SubscriptionService.createSubscription(req.body);
            OnboardingController.sendResponse(res, 201, true, 'Subscription created successfully', newSubscription);
        } catch (error: any) {
            console.error('Error creating subscription:', error);

            let statusCode = 500;
            if (error.message.includes('Missing required field')) {
                statusCode = 400;
            } else if (error.message.includes('not found')) {
                statusCode = 404;
            } else if (error.message.includes('already has an active subscription')) {
                statusCode = 409;
            }

            OnboardingController.sendResponse(res, statusCode, false, error.message, undefined, error.message);
        }
    }

    static async createShop(req: Request<{}, ApiResponse<IShop>, CreateShopRequest>, res: Response): Promise<void> {
        try {
            const newShop = await ShopService.createShop(req.body);
            OnboardingController.sendResponse(res, 201, true, 'Shop created successfully', newShop);
        } catch (error: any) {
            console.error('Error creating shop:', error);

            let statusCode = 500;
            if (error.message.includes('Missing required field') || error.message.includes('Client must be active') || error.message.includes('Maximum number of shops')) {
                statusCode = 400;
            } else if (error.message.includes('not found')) {
                statusCode = 404;
            } else if (error.message.includes('already exists')) {
                statusCode = 409;
            } else if (error.message.includes('does not own')) {
                statusCode = 403;
            }

            OnboardingController.sendResponse(res, statusCode, false, error.message, undefined, error.message);
        }
    }

    static async createWorkstation(req: Request<{}, ApiResponse<Workstation>, CreateWorkstationRequest>, res: Response): Promise<void> {
        try {
            const newWorkstation = await WorkstationService.createWorkstation(req.body);
            OnboardingController.sendResponse(res, 201, true, 'Workstation created successfully', newWorkstation);
        } catch (error: any) {
            console.error('Error creating workstation:', error);

            let statusCode = 500;
            if (error.message.includes('Missing required field')) {
                statusCode = 400;
            } else if (error.message.includes('not found')) {
                statusCode = 404;
            } else if (error.message.includes('already exists')) {
                statusCode = 409;
            } else if (error.message.includes('does not own')) {
                statusCode = 403;
            }

            OnboardingController.sendResponse(res, statusCode, false, error.message, undefined, error.message);
        }
    }

    static async getOnboardingStatus(req: Request<{ client_id: string }>, res: Response): Promise<void> {
        try {
            const { client_id } = req.params;

            if (!client_id) {
                OnboardingController.sendResponse(res, 400, false, 'Client ID is required');
                return;
            }

            const onboardingStatus = await ClientService.getOnboardingStatus(client_id);
            OnboardingController.sendResponse(res, 200, true, 'Onboarding status retrieved successfully', onboardingStatus);
        } catch (error: any) {
            console.error('Error getting onboarding status:', error);

            const statusCode = error.message.includes('not found') ? 404 : 500;
            OnboardingController.sendResponse(res, statusCode, false, error.message, undefined, error.message);
        }
    }

    static async verifyClient(req: Request<{}, ApiResponse<Omit<Client, 'auth_key'>>, VerifyClientRequest>, res: Response): Promise<void> {
        try {
            const { client_id, auth_key } = req.body;

            if (!client_id || !auth_key) {
                OnboardingController.sendResponse(res, 400, false, 'Client ID and auth key are required');
                return;
            }

            const safeClientData = await ClientService.verifyClient(client_id, auth_key);
            OnboardingController.sendResponse(res, 200, true, 'Client verified successfully', safeClientData);
        } catch (error: any) {
            console.error('Error verifying client:', error);

            const statusCode = error.message.includes('Invalid credentials') ? 401 : 500;
            OnboardingController.sendResponse(res, statusCode, false, error.message, undefined, error.message);
        }
    }

    static async updateClient(req: Request<{ client_id: string }, ApiResponse<Omit<Client, 'auth_key'>>, Partial<RegisterClientRequest>>, res: Response): Promise<void> {
        try {
            const { client_id } = req.params;
            const updateData = req.body;

            if (!client_id) {
                OnboardingController.sendResponse(res, 400, false, 'Client ID is required');
                return;
            }

            const updatedClient = await ClientService.updateClient(client_id, updateData);
            OnboardingController.sendResponse(res, 200, true, 'Client updated successfully', updatedClient);
        } catch (error: any) {
            console.error('Error updating client:', error);

            let statusCode = 500;
            if (error.message.includes('not found')) {
                statusCode = 404;
            } else if (error.message.includes('already exists') || error.message.includes('Failed to update')) {
                statusCode = 409;
            }

            OnboardingController.sendResponse(res, statusCode, false, error.message, undefined, error.message);
        }
    }
}