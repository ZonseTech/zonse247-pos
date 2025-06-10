import { Request, Response } from 'express';
import { ShopService } from '../services/shop.service';

export class ShopController {
	private shopService: ShopService;

	constructor() {
		this.shopService = new ShopService();
	}

	async verifyPosStation(req: Request, res: Response): Promise<void> {
		try {
			const params = {};
		} catch (error) {}
	}

	async checkPosDetails(req: Request, res: Response): Promise<void> {
		try {
			const shop = await this.shopService.getPosDetails();
			res.send(shop);
		} catch (error: any) {
			console.error(error);
			res.status(500).json({
				error: 'Internal Server Error',
				message: error.message || `An unexpected error occurred. ${error}`,
			});
		}
	}
}
