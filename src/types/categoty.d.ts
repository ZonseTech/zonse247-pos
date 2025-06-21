interface Category {
    uuid: string;
    name: string;
    clientUuid: string;
    shopUuid: string;
    userUuid: string;
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
    clientUuid: string;
    shopUuid: string;
}


interface CreateCategoryRequest {
    name: string;
    clientUuid: string;
    shopUuid: string;
    userUuid: string;
}

interface UpdateCategoryDto {
    name?: string;
    synced?: number;
}

interface CategoryFilters {
    clientUuid: string;
    shopUuid: string;
}