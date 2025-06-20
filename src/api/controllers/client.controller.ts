import { Request, Response } from "express";
import { BaseController } from "./base.controller";
import { ClientService } from "../services/client.service";
import { ShopService } from "../services/shop.service";

export class ClientController extends BaseController {
    constructor() {
        super()
    }

    static async list(req: Request, res: Response): Promise<void> {
        try {
            const query = req.query;
            const clients = await ClientService.getAllClients(query);
            BaseController.sendResponse(res, 200, true, 'Clients retrieved successfully', clients);
        } catch (error: any) {
            console.error('Error retrieving clients:', error);
            BaseController.sendResponse(res, 500, false, error.message, undefined, error.message);
        }
    }

    static async store(req: Request<{}, ApiResponse<Client>, RegisterClientRequest>, res: Response): Promise<void> {
        try {
            const newClient = await ClientService.registerClient(req.body);
            BaseController.sendResponse(res, 201, true, 'Client created successfully', newClient);
        } catch (error: any) {
            console.error('Error creating client:', error);

            let statusCode = 500;
            if (error.message.includes('Missing required field') || error.message.includes('Invalid email format')) {
                statusCode = 400;
            } else if (error.message.includes('already exists')) {
                statusCode = 409;
            }

            BaseController.sendResponse(res, statusCode, false, error.message, undefined, error.message);
        }
    }

    static async show(req: Request<{ id: string }, ApiResponse<Omit<Client, 'authKey'>>>, res: Response): Promise<void> {
        try {
            const { id } = req.params;

            if (!id) {
                BaseController.sendResponse(res, 400, false, 'Client ID is required');
                return;
            }

            const client = await ClientService.getClientById(id);
            BaseController.sendResponse(res, 200, true, 'Client retrieved successfully', client);
        } catch (error: any) {
            console.error('Error retrieving client:', error);

            const statusCode = error.message.includes('not found') ? 404 : 500;
            BaseController.sendResponse(res, statusCode, false, error.message, undefined, error.message);
        }
    }

    static async delete(req: Request<{ id: string }, ApiResponse<{ status: boolean }>>, res: Response): Promise<void> {
        try {
            const { id } = req.params;

            if (!id) {
                BaseController.sendResponse(res, 400, false, 'Client ID is required');
                return;
            }

            const result = await ClientService.deleteClient(id);
            BaseController.sendResponse(res, 200, true, 'Client deleted successfully', result);
        } catch (error: any) {
            console.error('Error deleting client:', error);

            const statusCode = error.message.includes('not found') ? 404 : 500;
            BaseController.sendResponse(res, statusCode, false, error.message, undefined, error.message);
        }
    }

    static async update(req: Request<{ id?: string; clientId?: string }, ApiResponse<Omit<Client, 'authKey'>>, Partial<RegisterClientRequest>>, res: Response): Promise<void> {
        try {
            const clientId = req.params.id || req.params.clientId;
            const updateData = req.body;

            if (!clientId) {
                BaseController.sendResponse(res, 400, false, 'Client ID is required');
                return;
            }

            const updatedClient = await ClientService.updateClient(clientId, updateData);
            BaseController.sendResponse(res, 200, true, 'Client updated successfully', updatedClient);
        } catch (error: any) {
            console.error('Error updating client:', error);

            let statusCode = 500;
            if (error.message.includes('not found')) {
                statusCode = 404;
            } else if (error.message.includes('already exists') || error.message.includes('Failed to update')) {
                statusCode = 409;
            }

            BaseController.sendResponse(res, statusCode, false, error.message, undefined, error.message);
        }
    }

    static async register(req: Request<{}, ApiResponse<Client>, RegisterClientRequest>, res: Response): Promise<void> {
        try {
            const newClient = await ClientService.registerClient(req.body);
            BaseController.sendResponse(res, 201, true, 'Client registered successfully', newClient);
        } catch (error: any) {
            console.error('Error registering client:', error);

            let statusCode = 500;
            if (error.message.includes('Missing required field') || error.message.includes('Invalid email format')) {
                statusCode = 400;
            } else if (error.message.includes('already exists')) {
                statusCode = 409;
            }

            BaseController.sendResponse(res, statusCode, false, error.message, undefined, error.message);
        }
    }

    static async verify(req: Request<{}, ApiResponse<Omit<Client, 'authKey'>>, VerifyClientRequest>, res: Response): Promise<void> {
        try {
            const { clientId, authKey } = req.body;

            if (!clientId || !authKey) {
                BaseController.sendResponse(res, 400, false, 'Client ID and auth key are required');
                return;
            }

            const safeClientData = await ClientService.verifyClient(clientId, authKey);
            BaseController.sendResponse(res, 200, true, 'Client verified successfully', safeClientData);
        } catch (error: any) {
            console.error('Error verifying client:', error);

            const statusCode = error.message.includes('Invalid credentials') ? 401 : 500;
            BaseController.sendResponse(res, statusCode, false, error.message, undefined, error.message);
        }
    }

    static async getClientShops(req: Request<{ clientId: string }>, res: Response): Promise<void> {
        try {
            const { clientId } = req.params;

            const shops = await ShopService.getShopByClientId(clientId);
            BaseController.sendResponse(res, 200, true, 'Client Shops retrieved successfully', shops);
        } catch (error: any) {
            console.error('Error fetching client shops:', error);
            BaseController.sendResponse(res, 500, false, error.message, undefined, error.message);
        }
    }

    static async getOnboardingStatus(req: Request<{ clientId: string }>, res: Response): Promise<void> {
        try {
            const { clientId } = req.params;

            if (!clientId) {
                BaseController.sendResponse(res, 400, false, 'Client ID is required');
                return;
            }

            const onboardingStatus = await ClientService.getOnboardingStatus(clientId);
            BaseController.sendResponse(res, 200, true, 'Onboarding status retrieved successfully', onboardingStatus);
        } catch (error: any) {
            console.error('Error retrieving onboarding status:', error);

            const statusCode = error.message.includes('not found') ? 404 : 500;
            BaseController.sendResponse(res, statusCode, false, error.message, undefined, error.message);
        }
    }
}