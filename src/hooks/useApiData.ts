
import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

type ApiFunction<T, P> = (params: P) => Promise<T>;

interface UseApiDataResult<T> {
  data: T | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Custom hook for handling API data fetching with authentication, loading states,
 * error handling, and automatic retry functionality
 */
export function useApiData<T, P = any>(
  apiFunction: ApiFunction<T, P>,
  params: P,
  options?: {
    initialData?: T | null;
    onSuccess?: (data: T) => void;
    onError?: (error: any) => void;
    showErrorToast?: boolean;
    showSuccessToast?: boolean;
    successMessage?: string;
    autoRefreshInterval?: number; // in milliseconds
  }
): UseApiDataResult<T> {
  const [data, setData] = useState<T | null>(options?.initialData || null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { refreshAuth } = useAuth();

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await apiFunction(params);
      setData(result);
      setError(null);
      
      if (options?.onSuccess) {
        options.onSuccess(result);
      }
      
      if (options?.showSuccessToast) {
        toast.success(options.successMessage || 'Data loaded successfully');
      }
      
      return result;
    } catch (err) {
      console.error('API Error:', err);
      
      if (err.message === 'Authentication expired. Please log in again.') {
        // Try to refresh the auth token
        const refreshSuccess = await refreshAuth();
        
        if (refreshSuccess) {
          // Retry the API call
          try {
            const retryResult = await apiFunction(params);
            setData(retryResult);
            setError(null);
            
            if (options?.onSuccess) {
              options.onSuccess(retryResult);
            }
            
            return retryResult;
          } catch (retryError) {
            handleError(retryError);
          }
        } else {
          handleError(err);
        }
      } else {
        handleError(err);
      }
      
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [apiFunction, params, refreshAuth, options]);
  
  const handleError = (err: any) => {
    const errorMessage = err.message || 'An unknown error occurred';
    setError(errorMessage);
    
    if (options?.onError) {
      options.onError(err);
    }
    
    if (options?.showErrorToast !== false) {
      toast.error(`Error: ${errorMessage}`);
    }
  };
  
  useEffect(() => {
    fetchData();
    
    // Set up auto-refresh if specified
    let intervalId: number | undefined;
    if (options?.autoRefreshInterval) {
      intervalId = window.setInterval(() => {
        fetchData();
      }, options.autoRefreshInterval);
    }
    
    return () => {
      if (intervalId !== undefined) {
        clearInterval(intervalId);
      }
    };
  }, [fetchData]);

  // Fix the return type of refetch
  const refetch = useCallback(async (): Promise<void> => {
    await fetchData();
  }, [fetchData]);

  return { data, isLoading, error, refetch };
}

export default useApiData;
