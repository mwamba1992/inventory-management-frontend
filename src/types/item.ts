// Item Types
import type { Brand } from './brand'

export interface Item {
  id: number;
  name: string;
  description?: string;
  stockcode: string;
  price: number;
  defaultQty: number;
  tax?: string;
  category?: string;
  supplier?: string;
  brandId?: number;
  brand?: Brand;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateItemDto {
  name: string;
  description?: string;
  stockcode: string;
  price: number;
  defaultQty: number;
  tax?: string;
  category?: string;
  supplier?: string;
  brandId?: number;
}

export interface UpdateItemDto {
  name?: string;
  description?: string;
  stockcode?: string;
  price?: number;
  defaultQty?: number;
  tax?: string;
  category?: string;
  supplier?: string;
  brandId?: number;
}
