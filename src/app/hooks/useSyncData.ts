import { useState, useEffect, useCallback } from 'react';
import { syncService } from '../services/sync.service';

export function useSyncData() {
	const [tables, setTables] = useState<Table[]>([]);
	const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>(
		{}
	);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const fetchTables = useCallback(async () => {
		try {
			setIsLoading(true);
			setError(null);
			const tablesData = await syncService.getTables();
			setTables(tablesData);
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Failed to fetch tables');
		} finally {
			setIsLoading(false);
		}
	}, []);

	const updateTableStatus = useCallback(
		(tableId: string | number, updates: Partial<Table>) => {
			setTables((prev) =>
				prev.map((table) =>
					table.id === tableId ? { ...table, ...updates } : table
				)
			);
		},
		[]
	);

	const setTableLoading = useCallback(
		(tableId: string | number, action: string, loading: boolean) => {
			const key = `${tableId}-${action}`;
			setLoadingStates((prev) => ({ ...prev, [key]: loading }));
		},
		[]
	);

	useEffect(() => {
		fetchTables();
		const interval = setInterval(fetchTables, 30000);
		return () => clearInterval(interval);
	}, [fetchTables]);

	return {
		tables,
		loadingStates,
		isLoading,
		error,
		setError,
		fetchTables,
		updateTableStatus,
		setTableLoading,
	};
}
