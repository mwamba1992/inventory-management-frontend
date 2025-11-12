// Stock Distribution Types
import type { ColorCategory } from './colorCategory'

export interface ItemStockDistribution {
  id: number;
  quantity: number;
  itemStock?: any; // Avoid circular reference
  colorCategory?: ColorCategory;
  createdAt: string;
  updatedAt: string;
  active: boolean;
}

export interface CreateItemStockDistributionDto {
  itemStockId: number;
  colorCategoryId?: number;
  quantity: number;
}

export interface UpdateItemStockDistributionDto {
  quantity?: number;
  colorCategoryId?: number;
}

export interface StockDistributionSummary {
  colorName: string;
  colorHex?: string;
  quantity: number;
  percentage: number;
}
