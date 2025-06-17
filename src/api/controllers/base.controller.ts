import { Response } from "express";

export class BaseController {
    static sendResponse<T>(res: Response, statusCode: number, success: boolean, message: string, data?: T, error?: string): void {
        const response: ApiResponse<T> = {
            success,
            message,
            ...(data && { data }),
            ...(error && { error })
        };
        res.status(statusCode).json(response);
    }
}