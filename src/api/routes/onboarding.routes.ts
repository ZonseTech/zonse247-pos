import { Request, Response, Router } from 'express';
import { OnboardingController } from '../controllers/onboarding.controller';

const router: Router = Router();

router.get('/', function (req: Request, res: Response): void {
    res.send('On boarding endpointss');
})
router.get('/onboarding-status/:clientId', OnboardingController.getOnboardingStatus);

export default router;