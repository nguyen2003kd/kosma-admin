/* eslint-disable */
/* Orval Generated - Order API */
import {
  useMutation,
  useQuery,
} from '@tanstack/react-query';
import type {
  DataTag,
  DefinedUseQueryResult,
  MutationFunction,
  QueryClient,
  QueryFunction,
  QueryKey,
  UseMutationOptions,
  UseMutationResult,
  UseQueryOptions,
  UseQueryResult,
} from '@tanstack/react-query';
import { mainInstance } from '../mutator/custom-instance';

/**
 * Get all orders with pagination and filtering
 */
export const getApiV10Order = (params?: Record<string, string | number>) => {
  return mainInstance<{ success: boolean; data: { count: number; rows: any[] } }>({
    url: '/api/v1.0/order',
    method: 'GET',
    params,
  });
};

export const getGetApiV10OrderQueryKey = (params?: Record<string, string | number>) => [
  '/api/v1.0/order',
  ...(params ? [JSON.stringify(params)] : []),
] as const;

export const getGetApiV10OrderQueryOptions = <TData, TError = unknown>(
  params: Record<string, string | number>,
  options?: { query?: Partial<UseQueryOptions<TData, TError>> }
) => {
  const queryKey = options?.query?.queryKey ?? getGetApiV10OrderQueryKey(params);
  return {
    queryKey,
    queryFn: () => getApiV10Order(params) as Promise<TData>,
    enabled: !!params,
    retry: 3,
    retryDelay: 1000,
    ...options?.query,
  } as UseQueryOptions<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> };
};

export function useGetApiV10Order<TData = Awaited<ReturnType<typeof getApiV10Order>>, TError = unknown>(
  params: Record<string, string | number>,
  options?: { query?: Partial<UseQueryOptions<TData, TError>> },
  queryClient?: QueryClient
) {
  const queryOptions = getGetApiV10OrderQueryOptions(params, options);
  return useQuery(queryOptions, queryClient) as UseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> };
}

/**
 * Get order by ID
 */
export const getApiV10OrderId = (id: string) => {
  return mainInstance<{ success: boolean; data: any }>({
    url: `/api/v1.0/order/${id}`,
    method: 'GET',
  });
};

export const getGetApiV10OrderIdQueryOptions = <TData, TError = unknown>(
  id: string,
  options?: { query?: Partial<UseQueryOptions<TData, TError>> }
) => {
  return {
    queryKey: [`/api/v1.0/order/${id}`],
    queryFn: () => getApiV10OrderId(id) as Promise<TData>,
    enabled: !!id,
    retry: 3,
    retryDelay: 1000,
    ...options?.query,
  } as UseQueryOptions<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> };
};

export function useGetApiV10OrderId<TData = Awaited<ReturnType<typeof getApiV10OrderId>>, TError = unknown>(
  id: string,
  options?: { query?: Partial<UseQueryOptions<TData, TError>> },
  queryClient?: QueryClient
) {
  const queryOptions = getGetApiV10OrderIdQueryOptions(id, options);
  return useQuery(queryOptions, queryClient) as UseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> };
}

/**
 * Update order status
 */
export const putApiV10OrderId = (id: string, data: { status: string }) => {
  return mainInstance<{ success: boolean; data: any }>({
    url: `/api/v1.0/order/${id}`,
    method: 'PUT',
    data,
  });
};

export const getPutApiV10OrderIdMutationOptions = <TError = unknown, TContext = unknown>(
  options?: { mutation?: UseMutationOptions<Awaited<ReturnType<typeof putApiV10OrderId>>, TError, { id: string; data: { status: string } }, TContext> }
) => {
  const mutationKey = ['putApiV10OrderId'];
  return {
    mutationFn: ((props) => putApiV10OrderId(props.id, props.data)) as MutationFunction<Awaited<ReturnType<typeof putApiV10OrderId>>, { id: string; data: { status: string } }>,
    ...options?.mutation,
  };
};

export function usePutApiV10OrderId<TError = unknown, TContext = unknown>(
  options?: { mutation?: UseMutationOptions<Awaited<ReturnType<typeof putApiV10OrderId>>, TError, { id: string; data: { status: string } }, TContext> },
  queryClient?: QueryClient
) {
  return useMutation(getPutApiV10OrderIdMutationOptions(options), queryClient);
}
