import { Router } from 'express';
import { OnboardingController } from '../controllers/onboarding.controller';

const router: Router = Router();

router.post('/create-shop', OnboardingController.createShop);
router.post('/verify-client', OnboardingController.verifyClient);
router.post('/register-client', OnboardingController.registerClient);
router.post('/create-workstation', OnboardingController.createWorkstation);
router.put('/update-client/:client_id', OnboardingController.updateClient);
router.get('/subscription-plans', OnboardingController.getSubscriptionPlans);
router.post('/create-subscription', OnboardingController.createSubscription);
router.get('/onboarding-status/:client_id', OnboardingController.getOnboardingStatus);

export default router;