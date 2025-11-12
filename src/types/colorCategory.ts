// Color Category Types

export interface ColorCategory {
  id: number;
  name: string;
  hexCode?: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  active: boolean;
}

export interface CreateColorCategoryDto {
  name: string;
  hexCode?: string;
  description?: string;
}

export interface UpdateColorCategoryDto {
  name?: string;
  hexCode?: string;
  description?: string;
}
