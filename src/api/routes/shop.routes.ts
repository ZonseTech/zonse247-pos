import { Request, Response, Router } from 'express';
import { ShopController } from '../controllers/shop.controller';

const router = Router();
const shopController = new ShopController();

router.get('/', function (req: Request, res: Response): void {
	res.send('Shop API');
});

router.post('/verify-pos-station', shopController.verifyPosStation);

router.post('/check-pos-details', shopController.checkPosDetails);

export default router;
