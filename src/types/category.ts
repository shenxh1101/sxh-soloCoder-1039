export interface Category {
  id: string;
  name: string;
  description: string;
  sort: number;
  articleCount: number;
  isRecommended: boolean;
  topArticleIds: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CategorySortItem {
  id: string;
  name: string;
  sort: number;
}
