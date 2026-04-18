import { useState, useEffect, useCallback } from 'react';
import { Notify } from 'notiflix';
import staffService from '../services/staff.service';
import { getErrorMessage } from '../utils/api-error-handler';

export const useStaff = (query: StaffListQuery = { limit: 200, employmentStatus: 'ACTIVE' }) => {
    const [staff, setStaff] = useState<Staff[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const loadStaff = useCallback(async () => {
        setIsLoading(true);
        try {
            const result = await staffService.list(query);
            setStaff(result.staff || []);
        } catch (error: any) {
            Notify.failure(getErrorMessage(error, 'Failed to load staff'));
            setStaff([]);
        } finally {
            setIsLoading(false);
        }
    }, [query.search, query.department, query.employmentStatus, query.page, query.limit]);

    useEffect(() => {
        loadStaff();
    }, [loadStaff]);

    return { staff, isLoading, refetch: loadStaff };
};
