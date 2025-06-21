import { Response } from "express";

export class BaseController {
    /**
     * Send a standard API response
     */
    static sendResponse<T>(
        res: Response,
        statusCode: number,
        success: boolean,
        message: string,
        data?: T,
        error?: string
    ): void {
        const response: ApiResponse<T> = {
            success,
            message,
            ...(data !== undefined && { data }),
            ...(error && { error })
        };

        res.status(statusCode).json(response);
    }

    /**
     * Send a response with subscription status information
     * This method is useful when you want to include subscription status
     * even in successful responses
     */
    static sendResponseWithSubscription<T>(
        res: Response,
        statusCode: number,
        success: boolean,
        message: string,
        subscriptionStatus: string,
        data?: T,
        error?: string
    ): void {
        const response: ApiResponse<T> = {
            success,
            message,
            subscriptionStatus,
            ...(data !== undefined && { data }),
            ...(error && { error })
        };

        res.status(statusCode).json(response);
    }

    /**
     * Send success response
     */
    static sendSuccess<T>(res: Response, message: string, data?: T): void {
        this.sendResponse(res, 200, true, message, data);
    }

    /**
     * Send created response
     */
    static sendCreated<T>(res: Response, message: string, data?: T): void {
        this.sendResponse(res, 201, true, message, data);
    }

    /**
     * Send bad request response
     */
    static sendBadRequest(res: Response, message: string, error?: string): void {
        this.sendResponse(res, 400, false, message, null, error);
    }

    /**
     * Send unauthorized response
     */
    static sendUnauthorized(res: Response, message: string = 'Unauthorized'): void {
        this.sendResponse(res, 401, false, message);
    }

    /**
     * Send forbidden response with subscription status
     * This matches your middleware's 403 responses
     */
    static sendForbiddenWithSubscription<T>(
        res: Response,
        message: string,
        subscriptionStatus: string,
        data?: T
    ): void {
        this.sendResponseWithSubscription(res, 403, false, message, subscriptionStatus, data);
    }

    /**
     * Send not found response
     */
    static sendNotFound(res: Response, message: string = 'Resource not found'): void {
        this.sendResponse(res, 404, false, message);
    }

    /**
     * Send not found response with subscription status
     * This matches your middleware's 404 responses
     */
    static sendNotFoundWithSubscription(
        res: Response,
        message: string,
        subscriptionStatus: string
    ): void {
        this.sendResponseWithSubscription(res, 404, false, message, subscriptionStatus);
    }

    /**
     * Send internal server error response
     */
    static sendServerError(res: Response, message: string = 'Internal server error', error?: string): void {
        this.sendResponse(res, 500, false, message, null, error);
    }

    /**
     * Send internal server error with subscription status
     * This matches your middleware's 500 responses
     */
    static sendServerErrorWithSubscription(
        res: Response,
        message: string,
        subscriptionStatus: string = 'error'
    ): void {
        this.sendResponseWithSubscription(res, 500, false, message, subscriptionStatus);
    }

    /**
     * Send validation error response
     */
    static sendValidationError(res: Response, message: string, errors?: any): void {
        this.sendResponse(res, 422, false, message, errors);
    }
}