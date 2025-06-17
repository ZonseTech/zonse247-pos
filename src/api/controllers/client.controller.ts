import { Request, Response } from "express";
import { Controller } from "./controller";
import { ClientService } from "../services/client.service";

export class ClientController extends Controller {
    constructor() {
        super()
    }

    static async list(req: Request, res: Response): Promise<void> {
        try {
            const query = req.query;
            const clients = await ClientService.getAllClients(query);
            Controller.sendResponse(res, 200, true, 'Clients retrieved successfully', clients);
        } catch (error: any) {
            console.error('Error retrieving clients:', error);
            Controller.sendResponse(res, 500, false, error.message, undefined, error.message);
        }
    }

    static async store(req: Request<{}, ApiResponse<Client>, RegisterClientRequest>, res: Response): Promise<void> {
        try {
            const newClient = await ClientService.registerClient(req.body);
            Controller.sendResponse(res, 201, true, 'Client created successfully', newClient);
        } catch (error: any) {
            console.error('Error creating client:', error);

            let statusCode = 500;
            if (error.message.includes('Missing required field') || error.message.includes('Invalid email format')) {
                statusCode = 400;
            } else if (error.message.includes('already exists')) {
                statusCode = 409;
            }

            Controller.sendResponse(res, statusCode, false, error.message, undefined, error.message);
        }
    }

    static async show(req: Request<{ id: string }, ApiResponse<Omit<Client, 'auth_key'>>>, res: Response): Promise<void> {
        try {
            const { id } = req.params;

            if (!id) {
                Controller.sendResponse(res, 400, false, 'Client ID is required');
                return;
            }

            const client = await ClientService.getClientById(id);
            Controller.sendResponse(res, 200, true, 'Client retrieved successfully', client);
        } catch (error: any) {
            console.error('Error retrieving client:', error);

            const statusCode = error.message.includes('not found') ? 404 : 500;
            Controller.sendResponse(res, statusCode, false, error.message, undefined, error.message);
        }
    }

    static async delete(req: Request<{ id: string }, ApiResponse<{ status: boolean }>>, res: Response): Promise<void> {
        try {
            const { id } = req.params;

            if (!id) {
                Controller.sendResponse(res, 400, false, 'Client ID is required');
                return;
            }

            const result = await ClientService.deleteClient(id);
            Controller.sendResponse(res, 200, true, 'Client deleted successfully', result);
        } catch (error: any) {
            console.error('Error deleting client:', error);

            const statusCode = error.message.includes('not found') ? 404 : 500;
            Controller.sendResponse(res, statusCode, false, error.message, undefined, error.message);
        }
    }

    static async update(req: Request<{ id?: string; client_id?: string }, ApiResponse<Omit<Client, 'auth_key'>>, Partial<RegisterClientRequest>>, res: Response): Promise<void> {
        try {
            const clientId = req.params.id || req.params.client_id;
            const updateData = req.body;

            if (!clientId) {
                Controller.sendResponse(res, 400, false, 'Client ID is required');
                return;
            }

            const updatedClient = await ClientService.updateClient(clientId, updateData);
            Controller.sendResponse(res, 200, true, 'Client updated successfully', updatedClient);
        } catch (error: any) {
            console.error('Error updating client:', error);

            let statusCode = 500;
            if (error.message.includes('not found')) {
                statusCode = 404;
            } else if (error.message.includes('already exists') || error.message.includes('Failed to update')) {
                statusCode = 409;
            }

            Controller.sendResponse(res, statusCode, false, error.message, undefined, error.message);
        }
    }

    static async register(req: Request<{}, ApiResponse<Client>, RegisterClientRequest>, res: Response): Promise<void> {
        try {
            const newClient = await ClientService.registerClient(req.body);
            Controller.sendResponse(res, 201, true, 'Client registered successfully', newClient);
        } catch (error: any) {
            console.error('Error registering client:', error);

            let statusCode = 500;
            if (error.message.includes('Missing required field') || error.message.includes('Invalid email format')) {
                statusCode = 400;
            } else if (error.message.includes('already exists')) {
                statusCode = 409;
            }

            Controller.sendResponse(res, statusCode, false, error.message, undefined, error.message);
        }
    }

    static async verify(req: Request<{}, ApiResponse<Omit<Client, 'auth_key'>>, VerifyClientRequest>, res: Response): Promise<void> {
        try {
            const { client_id, auth_key } = req.body;

            if (!client_id || !auth_key) {
                Controller.sendResponse(res, 400, false, 'Client ID and auth key are required');
                return;
            }

            const safeClientData = await ClientService.verifyClient(client_id, auth_key);
            Controller.sendResponse(res, 200, true, 'Client verified successfully', safeClientData);
        } catch (error: any) {
            console.error('Error verifying client:', error);

            const statusCode = error.message.includes('Invalid credentials') ? 401 : 500;
            Controller.sendResponse(res, statusCode, false, error.message, undefined, error.message);
        }
    }

    static async getOnboardingStatus(req: Request<{ client_id: string }>, res: Response): Promise<void> {
        try {
            const { client_id } = req.params;

            if (!client_id) {
                Controller.sendResponse(res, 400, false, 'Client ID is required');
                return;
            }

            const onboardingStatus = await ClientService.getOnboardingStatus(client_id);
            Controller.sendResponse(res, 200, true, 'Onboarding status retrieved successfully', onboardingStatus);
        } catch (error: any) {
            console.error('Error retrieving onboarding status:', error);

            const statusCode = error.message.includes('not found') ? 404 : 500;
            Controller.sendResponse(res, statusCode, false, error.message, undefined, error.message);
        }
    }
}