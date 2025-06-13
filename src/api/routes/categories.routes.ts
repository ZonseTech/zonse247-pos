import { v4 as uuidv4 } from 'uuid';
import { Request, Response, Router } from 'express';
import { sealDBModel } from '../databases/local';
import { CATEGORIES_DB } from '../databases/local/tables';

const router = Router();

router.get('/', function (req: Request, res: Response): void {
	res.send('Category API');
});

router.get('/all', async function (req: Request, res: Response): Promise<void> {
	try {
		const docs = await sealDBModel.findAll(CATEGORIES_DB);
		res.send(docs);
	} catch (err) {
		console.error(err);
		res.status(500).json({
			error: 'Internal Server Error',
			message: 'An unexpected error occurred.',
		});
	}
});

router.post(
	'/category',
	async function (req: Request, res: Response): Promise<void> {
		try {
			const newCategory: Category = req.body;
			newCategory.uuid = uuidv4();

			await sealDBModel.insert(CATEGORIES_DB, newCategory);
			res.sendStatus(200);
		} catch (err) {
			console.error(err);
			res.status(500).json({
				error: 'Internal Server Error',
				message: 'An unexpected error occurred.',
			});
		}
	}
);

router.delete(
	'/category/:categoryId',
	async function (req: Request, res: Response): Promise<void> {
		try {
			const categoryId = req.params.categoryId;
			await sealDBModel.delete(CATEGORIES_DB, categoryId);
			res.sendStatus(200);
		} catch (err) {
			console.error(err);
			res.status(500).json({
				error: 'Internal Server Error',
				message: 'An unexpected error occurred.',
			});
		}
	}
);

router.put(
	'/category/:categoryId',
	async function (req: Request, res: Response): Promise<void> {
		try {
			const categoryId = req.params.categoryId;
			await sealDBModel.update(CATEGORIES_DB, categoryId, req.body);
			res.sendStatus(200);
		} catch (err) {
			console.error(err);
			res.status(500).json({
				error: 'Internal Server Error',
				message: 'An unexpected error occurred.',
			});
		}
	}
);

export default router;
