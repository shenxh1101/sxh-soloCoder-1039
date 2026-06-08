export interface PublishRecord {
  id: string;
  articleId: string;
  articleTitle: string;
  articleCover: string;
  categoryName: string;
  publishTime: string;
  views: number;
  shares: number;
  comments: number;
  status: 'published' | 'offline' | 'failed';
  operator: string;
  isAbnormal: boolean;
  abnormalReason?: string;
}

export interface PublishStats {
  totalPublished: number;
  totalViews: number;
  totalShares: number;
  totalComments: number;
  todayPublished: number;
  abnormalCount: number;
  unpublishedCount: number;
}

export interface UnpublishedArticle {
  id: string;
  title: string;
  status: 'draft' | 'pending' | 'rejected';
  updatedAt: string;
}
