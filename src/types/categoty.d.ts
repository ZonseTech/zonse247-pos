interface Category {
    categoryId: string;
    name: string;
    description?: string;
    tenantId: string;
    branchId: string;
    userId: string;
    createdAt?: Date;
    updatedAt?: Date;
    itemCount?: number;
    color?: string;
    isDefault?: boolean;
    synced?: 1 | 0;
}

interface CreateCategoryDto {
    name: string;
    color: string;
    description: string;
    isDefault?: boolean;
}

interface UpdateCategoryDto {
    name?: string;
    color: string;
    description: string;
    isDefault?: boolean;
}

interface CategoryFilters {
    tenantId: string;
    branchId: string;
}


interface CreateCategoryRequest {
    name: string;
    description: string;
    color: string;
    isDefault?: boolean;
    tenantId: string;
    branchId: string;
    userId: string;
}

interface UpdateCategoryDto {
    name?: string;
    synced?: number;
    description?: string;
    color?: string;
    isDefault?: boolean;
}

interface CategoryFilters {
    tenantId: string;
    branchId: string;
}