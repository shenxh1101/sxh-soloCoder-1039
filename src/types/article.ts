export type ArticleStatus = 'draft' | 'pending' | 'published' | 'rejected';

export interface Article {
  id: string;
  title: string;
  summary: string;
  content: string;
  coverImage: string;
  images: string[];
  tags: string[];
  status: ArticleStatus;
  categoryId: string;
  categoryName: string;
  author: string;
  views: number;
  shares: number;
  comments: number;
  scheduledPublishTime?: string;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  isTop: boolean;
  isRecommended: boolean;
  versions: ArticleVersion[];
}

export interface ArticleVersion {
  id: string;
  version: number;
  title: string;
  content: string;
  createdAt: string;
  operator: string;
  remark?: string;
}

export interface ReviewComment {
  id: string;
  articleId: string;
  content: string;
  operator: string;
  createdAt: string;
  type: 'suggestion' | 'question' | 'approval';
}

export interface CreateArticleForm {
  title: string;
  summary: string;
  content: string;
  coverImage: string;
  images: string[];
  tags: string[];
  categoryId: string;
  scheduledPublishTime?: string;
}
