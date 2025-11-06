import { v4 as uuidv4 } from 'uuid';
import { sealDBModel } from '../databases/local';
import { TABLE_NAMES } from '../databases/local/tables';

export class SubscriptionPlanModel {
	static async findAll(): Promise<SubscriptionPlan[]> {
		return sealDBModel.findAll(TABLE_NAMES.SUBSCRIPTION_PLANS);
	}

	static async findById(id: string): Promise<SubscriptionPlan | null> {
		return sealDBModel.findById(TABLE_NAMES.SUBSCRIPTION_PLANS, { planId: id });
	}

	static async findActivePlans(): Promise<SubscriptionPlan[]> {
		return sealDBModel.find(TABLE_NAMES.SUBSCRIPTION_PLANS, {
			isActive: true,
		});
	}

	static async findByBillingCycle(billingCycle: string): Promise<SubscriptionPlan[]> {
		return sealDBModel.find(TABLE_NAMES.SUBSCRIPTION_PLANS, { billingCycle });
	}

	static async create(planData: Partial<SubscriptionPlan>): Promise<SubscriptionPlan> {
		const planWithId = {
			...planData,
			id: uuidv4(),
			createdAt: new Date(),
			updatedAt: new Date(),
		};

		return sealDBModel.insert(TABLE_NAMES.SUBSCRIPTION_PLANS, planWithId);
	}

	static async update(id: string, data: Partial<SubscriptionPlan>): Promise<number> {
		const updateData = {
			...data,
			updatedAt: new Date(),
		};

		return sealDBModel.update(TABLE_NAMES.SUBSCRIPTION_PLANS, { planId: id }, updateData);
	}

	static async delete(id: string): Promise<number> {
		return sealDBModel.delete(TABLE_NAMES.SUBSCRIPTION_PLANS, { planId: id });
	}

	static async toggleStatus(id: string): Promise<number> {
		const plan = await this.findById(id);
		if (!plan) {
			throw new Error('Subscription plan not found');
		}

		return this.update(id, { isActive: !plan.isActive });
	}

	static async validatePlan(planId: string): Promise<boolean> {
		const plan = await this.findById(planId);
		return !!(plan && plan.isActive);
	}

	static async getPlanPrice(planId: string): Promise<number> {
		const plan = await this.findById(planId);
		if (!plan) {
			throw new Error('Subscription plan not found');
		}
		return plan.monthlyPrice || plan.yearlyPrice;
	}

	static async getPlansByFeature(feature: PlanFeature): Promise<SubscriptionPlan[]> {
		const allPlans = await this.findAll();
		return allPlans.filter(plan =>
			plan.features.includes(feature) && plan.isActive
		);
	}
}