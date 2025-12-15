import api from './http.service';

class PlanFeaturesService {
    private readonly endpoint = '/plan-features';

    /**
     * List all feature categories
     */
    async list(): Promise<FeatureCategory[]> {
        try {
            const response = await api.get<ApiResponse<FeatureCategory[]>>(this.endpoint);
            return response.data.data || [];
        } catch (error) {
            console.error('Error fetching feature categories:', error);
            throw error;
        }
    }

    /**
     * Get single feature category by ID
     */
    async show(id: string): Promise<FeatureCategory> {
        try {
            const response = await api.get<ApiResponse<FeatureCategory>>(
                `${this.endpoint}/${id}`
            );
            return response.data.data;
        } catch (error) {
            console.error('Error fetching feature category:', error);
            throw error;
        }
    }

    /**
     * Create new feature category
     */
    async store(data: CreateFeatureCategoryRequest): Promise<FeatureCategory> {
        try {
            const response = await api.post<ApiResponse<FeatureCategory>>(
                this.endpoint,
                data as any
            );
            return response.data.data;
        } catch (error) {
            console.error('Error creating feature category:', error);
            throw error;
        }
    }

    /**
     * Update existing feature category
     */
    async update(
        id: string,
        data: UpdateFeatureCategoryRequest
    ): Promise<FeatureCategory> {
        try {
            const response = await api.put<ApiResponse<FeatureCategory>>(
                `${this.endpoint}/${id}`,
                data as any
            );
            return response.data.data;
        } catch (error) {
            console.error('Error updating feature category:', error);
            throw error;
        }
    }

    /**
     * Delete feature category
     */
    async delete(id: string): Promise<void> {
        try {
            await api.delete(`${this.endpoint}/${id}`);
        } catch (error) {
            console.error('Error deleting feature category:', error);
            throw error;
        }
    }
}

const planFeaturesService = new PlanFeaturesService();
export default planFeaturesService;
