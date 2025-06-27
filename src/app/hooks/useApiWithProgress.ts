import { useState, useCallback, useRef } from 'react';
import { AxiosResponse, AxiosError } from 'axios';
import NProgress from 'nprogress';
import api, { apiUtils } from '../services/http.service';

interface UseApiOptions {
    showProgress?: boolean;
    showGlobalProgress?: boolean;
    onSuccess?: (data: any) => void;
    onError?: (error: any) => void;
    retryCount?: number;
    retryDelay?: number;
}

interface UseApiReturn<T> {
    data: T | null;
    loading: boolean;
    error: any;
    execute: (...args: any[]) => Promise<T | undefined>;
    cancel: () => void;
    retry: () => void;
    reset: () => void;
}

export function useApiWithProgress<T = any>(
    apiCall: (...args: any[]) => Promise<AxiosResponse<T>>,
    options: UseApiOptions = {}
): UseApiReturn<T> {
    const [data, setData] = useState<T | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<any>(null);

    const abortControllerRef = useRef<AbortController | null>(null);
    const lastArgsRef = useRef<any[]>([]);

    const {
        showProgress = true,
        showGlobalProgress = true,
        onSuccess,
        onError,
        retryCount = 0,
        retryDelay = 1000
    } = options;

    const executeWithRetry = useCallback(async (
        args: any[],
        attempt: number = 0
    ): Promise<T | undefined> => {
        try {
            if (showProgress && !showGlobalProgress) {
                NProgress.start();
            }

            const response = await apiCall(...args);
            const result = response.data;

            setData(result);
            setError(null);
            onSuccess?.(result);

            if (showProgress && !showGlobalProgress) {
                NProgress.done();
            }

            return result;
        } catch (err) {
            const axiosError = err as AxiosError;

            if (attempt < retryCount && axiosError.code !== 'ECONNABORTED') {
                await new Promise(resolve => setTimeout(resolve, retryDelay));
                return executeWithRetry(args, attempt + 1);
            }

            setError(err);
            onError?.(err);

            if (showProgress && !showGlobalProgress) {
                NProgress.done();
            }

            throw err;
        }
    }, [apiCall, showProgress, showGlobalProgress, onSuccess, onError, retryCount, retryDelay]);

    const execute = useCallback(async (...args: any[]): Promise<T | undefined> => {
        // Cancel previous request if still pending
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }

        abortControllerRef.current = new AbortController();
        lastArgsRef.current = args;

        setLoading(true);
        setError(null);

        try {
            return await executeWithRetry(args);
        } catch (err) {
            return undefined;
        } finally {
            setLoading(false);
            abortControllerRef.current = null;
        }
    }, [executeWithRetry]);

    const cancel = useCallback(() => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
            abortControllerRef.current = null;
        }
        setLoading(false);
        if (showProgress && !showGlobalProgress) {
            NProgress.done();
        }
    }, [showProgress, showGlobalProgress]);

    const retry = useCallback(() => {
        if (lastArgsRef.current.length > 0) {
            execute(...lastArgsRef.current);
        }
    }, [execute]);

    const reset = useCallback(() => {
        setData(null);
        setError(null);
        setLoading(false);
        cancel();
    }, [cancel]);

    return {
        data,
        loading,
        error,
        execute,
        cancel,
        retry,
        reset
    };
}

export const useGet = <T = any>(
    url: string,
    options: UseApiOptions = {}
) => {
    return useApiWithProgress<T>(
        (params?: Record<string, any>, baseURL?: string) =>
            api.get<T>(url, params, baseURL),
        options
    );
};

export const usePost = <T = any>(
    url: string,
    options: UseApiOptions = {}
) => {
    return useApiWithProgress<T>(
        (body: any, headers?: Record<string, any>) =>
            api.post<T>(url, body, headers),
        options
    );
};

export const usePut = <T = any>(
    url: string,
    options: UseApiOptions = {}
) => {
    return useApiWithProgress<T>(
        (body: any, headers?: Record<string, any>) =>
            api.put<T>(url, body, headers),
        options
    );
};

export const useDelete = <T = any>(
    url: string,
    options: UseApiOptions = {}
) => {
    return useApiWithProgress<T>(
        (headers?: Record<string, any>) =>
            api.delete<T>(url, headers),
        options
    );
};

export const usePatch = <T = any>(
    url: string,
    options: UseApiOptions = {}
) => {
    return useApiWithProgress<T>(
        (body: any, headers?: Record<string, any>) =>
            api.patch<T>(url, body, headers),
        options
    );
};

export const useMultipleApi = () => {
    const [globalLoading, setGlobalLoading] = useState(false);
    const activeCallsRef = useRef(0);

    const executeMultiple = useCallback(async (
        calls: (() => Promise<any>)[],
        options: { showProgress?: boolean; parallel?: boolean } = {}
    ) => {
        const { showProgress = true, parallel = true } = options;

        activeCallsRef.current = calls.length;
        setGlobalLoading(true);

        if (showProgress) {
            apiUtils.startProgress();
        }

        try {
            const results = parallel
                ? await Promise.allSettled(calls.map(call => call()))
                : await calls.reduce(async (acc, call) => {
                    const results = await acc;
                    const result = await call();
                    return [...results, result];
                }, Promise.resolve([] as any[]));

            return results;
        } finally {
            activeCallsRef.current = 0;
            setGlobalLoading(false);
            if (showProgress) {
                apiUtils.stopProgress();
            }
        }
    }, []);

    return {
        globalLoading,
        executeMultiple,
        activeCallsCount: activeCallsRef.current
    };
};
