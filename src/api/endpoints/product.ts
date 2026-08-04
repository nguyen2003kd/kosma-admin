/* eslint-disable */
/* Product API - Admin Frontend */
import { mainInstance } from '../mutator/custom-instance';
import type { Product } from '../models/product';

export interface GetProductsParams {
  page?: string | number;
  pageSize?: string | number;
  search?: string;
  status?: string;
  category?: string;
  sortField?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export const getApiV10Product = (params?: GetProductsParams) => {
  return mainInstance<{ success: boolean; data: { count: number; rows: Product[] } }>({
    url: '/api/v1.0/product',
    method: 'GET',
    params,
  });
};

export const getApiV10ProductId = (id: string) => {
  return mainInstance<{ success: boolean; data: Product }>({
    url: `/api/v1.0/product/${id}`,
    method: 'GET',
  });
};

export const postApiV10Product = (data: Partial<Product>) => {
  return mainInstance<{ success: boolean; data: Product }>({
    url: '/api/v1.0/product',
    method: 'POST',
    data,
  });
};

export const putApiV10ProductId = (id: string, data: Partial<Product>) => {
  return mainInstance<{ success: boolean; data: Product }>({
    url: `/api/v1.0/product/${id}`,
    method: 'PUT',
    data,
  });
};

export const deleteApiV10ProductId = (id: string) => {
  return mainInstance<{ success: boolean }>({
    url: `/api/v1.0/product/${id}`,
    method: 'DELETE',
  });
};
