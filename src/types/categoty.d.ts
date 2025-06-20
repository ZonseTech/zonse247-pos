interface Category {
    uuid: string;
    name: string;
    clientId: string;
    shopId: string;
    userId: string;
    createdAt?: Date;
    updatedAt?: Date;
    synced?: 1 | 0;
}

interface CreateCategoryDto {
    name: string;
}

interface UpdateCategoryDto {
    name?: string;
}

interface CategoryFilters {
    clientId: string;
    shopId: string;
}


interface CreateCategoryRequest {
    name: string;
    clientId: string;
    shopId: string;
    userId: string;
}

interface UpdateCategoryDto {
    name?: string;
    synced?: number;
}

interface CategoryFilters {
    clientId: string;
    shopId: string;
}