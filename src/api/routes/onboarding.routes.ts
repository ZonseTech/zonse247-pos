import { Request, Response, Router } from 'express';
import { OnboardingController } from '../controllers/onboarding.controller';

const router: Router = Router();

router.get('/', function (req: Request, res: Response): void {
    res.send('On boarding endpointss');
})
router.post('/register-client', OnboardingController.registerClient);
router.post('/verify-client', OnboardingController.verifyClient);
router.put('/update-client/:client_id', OnboardingController.updateClient);
router.get('/subscription-plans', OnboardingController.getSubscriptionPlans);
router.post('/create-subscription', OnboardingController.createSubscription);
router.get('/onboarding-status/:client_id', OnboardingController.getOnboardingStatus);
router.post('/create-shop', OnboardingController.createShop);
router.post('/create-workstation', OnboardingController.createWorkstation);

export default router;