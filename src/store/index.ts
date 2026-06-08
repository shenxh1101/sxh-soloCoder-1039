import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import Taro from '@tarojs/taro';
import { Article, ArticleStatus } from '@/types/article';
import { Category } from '@/types/category';
import { ReviewRecord, ReviewStatus } from '@/types/review';
import { mockArticles } from '@/data/mockArticles';
import { mockCategories } from '@/data/mockCategories';
import { mockReviews } from '@/data/mockReviews';
import type { PublishRecord, PublishStats, UnpublishedArticle } from '@/types/publish';
import { mockPublishRecords, mockPublishStats, mockUnpublishedArticles } from '@/data/mockPublishRecords';

interface AppState {
  articles: Article[];
  categories: Category[];
  reviews: ReviewRecord[];
  publishRecords: PublishRecord[];
  publishStats: PublishStats;
  unpublishedArticles: UnpublishedArticle[];
  currentEditingArticleId: string | null;
  currentTopPanelCategoryId: string | null;
  
  addArticle: (article: Article) => void;
  updateArticle: (id: string, updates: Partial<Article>) => void;
  deleteArticle: (id: string) => void;
  
  addReview: (review: ReviewRecord) => void;
  updateReview: (id: string, updates: Partial<ReviewRecord>) => void;
  resubmitReview: (id: string) => void;
  
  updateCategory: (id: string, updates: Partial<Category>) => void;
  moveCategory: (id: string, direction: 'up' | 'down') => void;
  toggleCategoryRecommend: (id: string) => void;
  toggleArticleTop: (categoryId: string, articleId: string) => void;
  
  setCurrentEditingArticleId: (id: string | null) => void;
  setCurrentTopPanelCategoryId: (id: string | null) => void;
  
  resetToMock: () => void;
}

const STORAGE_KEY = 'cms_app_state';

const storage = {
  getItem: (name: string) => {
    try {
      const value = Taro.getStorageSync(name);
      return value ? JSON.stringify(value) : null;
    } catch (e) {
      console.error('[Store] getItem error:', e);
      return null;
    }
  },
  setItem: (name: string, value: string) => {
    try {
      Taro.setStorageSync(name, JSON.parse(value));
    } catch (e) {
      console.error('[Store] setItem error:', e);
    }
  },
  removeItem: (name: string) => {
    try {
      Taro.removeStorageSync(name);
    } catch (e) {
      console.error('[Store] removeItem error:', e);
    }
  }
};

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      articles: mockArticles,
      categories: mockCategories.sort((a, b) => a.sort - b.sort),
      reviews: mockReviews,
      publishRecords: mockPublishRecords,
      publishStats: mockPublishStats,
      unpublishedArticles: mockUnpublishedArticles,
      currentEditingArticleId: null,
      currentTopPanelCategoryId: null,

      addArticle: (article) => {
        console.log('[Store] 新增文章:', article.title);
        set(state => ({
          articles: [article, ...state.articles],
          unpublishedArticles: article.status === 'draft' || article.status === 'pending'
            ? [{
                id: article.id,
                title: article.title,
                status: article.status as 'draft' | 'pending' | 'rejected',
                updatedAt: article.updatedAt
              }, ...state.unpublishedArticles]
            : state.unpublishedArticles
        }));
      },

      updateArticle: (id, updates) => {
        console.log('[Store] 更新文章:', id, updates);
        set(state => ({
          articles: state.articles.map(a =>
            a.id === id ? { ...a, ...updates, updatedAt: new Date().toISOString().replace('T', ' ').slice(0, 19) } : a
          ),
          unpublishedArticles: state.unpublishedArticles.map(u =>
            u.id === id 
              ? { ...u, title: updates.title || u.title, status: (updates.status as any) || u.status, updatedAt: new Date().toISOString().replace('T', ' ').slice(0, 19) }
              : u
          )
        }));
      },

      deleteArticle: (id) => {
        console.log('[Store] 删除文章:', id);
        set(state => ({
          articles: state.articles.filter(a => a.id !== id),
          unpublishedArticles: state.unpublishedArticles.filter(u => u.id !== id)
        }));
      },

      addReview: (review) => {
        console.log('[Store] 新增审核记录:', review.articleTitle);
        set(state => ({
          reviews: [review, ...state.reviews]
        }));
      },

      updateReview: (id, updates) => {
        console.log('[Store] 更新审核记录:', id, updates);
        set(state => ({
          reviews: state.reviews.map(r =>
            r.id === id ? { ...r, ...updates } : r
          )
        }));
      },

      resubmitReview: (id) => {
        console.log('[Store] 重新提交审核:', id);
        const review = get().reviews.find(r => r.id === id);
        if (!review) return;

        const now = new Date().toISOString().replace('T', ' ').slice(0, 19);
        const newReview: ReviewRecord = {
          ...review,
          id: `r${Date.now()}`,
          status: 'pending',
          submitTime: now,
          version: review.version + 1,
          reviewer: undefined,
          reviewTime: undefined,
          reviewComment: undefined
        };

        set(state => ({
          reviews: [newReview, ...state.reviews.filter(r => r.id !== id)],
          articles: state.articles.map(a =>
            a.id === review.articleId
              ? {
                  ...a,
                  status: 'pending' as ArticleStatus,
                  updatedAt: now,
                  versions: [
                    ...a.versions,
                    {
                      id: `v${Date.now()}`,
                      version: review.version + 1,
                      title: a.title,
                      content: a.content,
                      createdAt: now,
                      operator: a.author,
                      remark: '根据审核意见修改后重新提交'
                    }
                  ]
                }
              : a
          ),
          unpublishedArticles: state.unpublishedArticles.map(u =>
            u.id === review.articleId
              ? { ...u, status: 'pending' as const, updatedAt: now }
              : u
          )
        }));
      },

      updateCategory: (id, updates) => {
        console.log('[Store] 更新栏目:', id, updates);
        set(state => ({
          categories: state.categories.map(c =>
            c.id === id ? { ...c, ...updates, updatedAt: new Date().toISOString().replace('T', ' ').slice(0, 19) } : c
          )
        }));
      },

      moveCategory: (id, direction) => {
        console.log('[Store] 移动栏目:', id, direction);
        const { categories } = get();
        const index = categories.findIndex(c => c.id === id);
        if (index === -1) return;
        
        if (direction === 'up' && index === 0) return;
        if (direction === 'down' && index === categories.length - 1) return;

        const newCategories = [...categories];
        const targetIndex = direction === 'up' ? index - 1 : index + 1;
        
        const currentSort = newCategories[index].sort;
        const targetSort = newCategories[targetIndex].sort;
        
        newCategories[index] = { ...newCategories[index], sort: targetSort };
        newCategories[targetIndex] = { ...newCategories[targetIndex], sort: currentSort };
        
        newCategories.sort((a, b) => a.sort - b.sort);
        
        set({ categories: newCategories });
      },

      toggleCategoryRecommend: (id) => {
        console.log('[Store] 切换栏目推荐位:', id);
        set(state => ({
          categories: state.categories.map(c =>
            c.id === id ? { ...c, isRecommended: !c.isRecommended } : c
          )
        }));
      },

      toggleArticleTop: (categoryId, articleId) => {
        console.log('[Store] 切换文章置顶:', categoryId, articleId);
        const category = get().categories.find(c => c.id === categoryId);
        if (!category) return;

        const isTop = category.topArticleIds.includes(articleId);
        const newTopIds = isTop
          ? category.topArticleIds.filter(id => id !== articleId)
          : [...category.topArticleIds, articleId];

        set(state => ({
          categories: state.categories.map(c =>
            c.id === categoryId ? { ...c, topArticleIds: newTopIds } : c
          ),
          articles: state.articles.map(a =>
            a.id === articleId ? { ...a, isTop: !isTop } : a
          )
        }));
      },

      setCurrentEditingArticleId: (id) => {
        console.log('[Store] 设置当前编辑文章ID:', id);
        set({ currentEditingArticleId: id });
      },

      setCurrentTopPanelCategoryId: (id) => {
        console.log('[Store] 设置当前置顶面板栏目ID:', id);
        set({ currentTopPanelCategoryId: id });
      },

      resetToMock: () => {
        console.log('[Store] 重置为初始数据');
        set({
          articles: mockArticles,
          categories: mockCategories.sort((a, b) => a.sort - b.sort),
          reviews: mockReviews,
          publishRecords: mockPublishRecords,
          publishStats: mockPublishStats,
          unpublishedArticles: mockUnpublishedArticles
        });
      }
    }),
    {
      name: STORAGE_KEY,
      storage,
      partialize: (state) => ({
        articles: state.articles,
        categories: state.categories,
        reviews: state.reviews,
        publishRecords: state.publishRecords,
        publishStats: state.publishStats,
        unpublishedArticles: state.unpublishedArticles
      })
    }
  )
);
