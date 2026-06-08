export type ReviewStatus = 'pending' | 'approved' | 'rejected';

export interface ReviewRecord {
  id: string;
  articleId: string;
  articleTitle: string;
  articleCover: string;
  status: ReviewStatus;
  submitter: string;
  submitTime: string;
  reviewer?: string;
  reviewTime?: string;
  reviewComment?: string;
  version: number;
  history?: ReviewHistoryItem[];
}

export interface ReviewHistoryItem {
  id: string;
  version: number;
  status: ReviewStatus;
  submitter: string;
  submitTime: string;
  reviewer?: string;
  reviewTime?: string;
  reviewComment?: string;
}

export interface ReviewDiff {
  oldVersion: number;
  newVersion: number;
  oldContent: string;
  newContent: string;
  changes: DiffChange[];
}

export interface DiffChange {
  type: 'added' | 'removed' | 'modified';
  field: string;
  oldValue: string;
  newValue: string;
}
