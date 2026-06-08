import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, Text, Input, ScrollView, Button } from '@tarojs/components';
import Taro, { usePullDownRefresh, useReachBottom, useDidShow } from '@tarojs/taro';
import classnames from 'classnames';
import { Article, ArticleStatus } from '@/types/article';
import { useAppStore } from '@/store';
import ArticleCard from '@/components/ArticleCard';
import styles from './index.module.scss';

type FilterType = 'all' | ArticleStatus;

interface FilterTab {
  key: FilterType;
  label: string;
}

const ArticleListPage: React.FC = () => {
  const { articles, setCurrentEditingArticleId } = useAppStore();
  const [filteredArticles, setFilteredArticles] = useState<Article[]>([]);
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);

  const filterTabs: FilterTab[] = [
    { key: 'all', label: '全部' },
    { key: 'draft', label: '草稿' },
    { key: 'pending', label: '待审核' },
    { key: 'published', label: '已发布' },
    { key: 'rejected', label: '已退回' }
  ];

  const getCountByStatus = useCallback((status: FilterType) => {
    if (status === 'all') return articles.length;
    return articles.filter(a => a.status === status).length;
  }, [articles]);

  const loadData = useCallback(() => {
    setLoading(true);
    console.log('[ArticleList] 加载数据');
    
    setTimeout(() => {
      setLoading(false);
      Taro.stopPullDownRefresh();
    }, 500);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useDidShow(() => {
    console.log('[ArticleList] 页面显示，刷新数据');
  });

  useEffect(() => {
    let result = [...articles];
    
    if (activeFilter !== 'all') {
      result = result.filter(article => article.status === activeFilter);
    }
    
    if (searchKeyword.trim()) {
      const keyword = searchKeyword.toLowerCase();
      result = result.filter(article => 
        article.title.toLowerCase().includes(keyword) ||
        article.summary.toLowerCase().includes(keyword) ||
        article.tags.some(tag => tag.toLowerCase().includes(keyword))
      );
    }
    
    setFilteredArticles(result);
    console.log('[ArticleList] 筛选结果:', result.length, '条');
  }, [articles, activeFilter, searchKeyword]);

  usePullDownRefresh(() => {
    console.log('[ArticleList] 下拉刷新');
    setPage(1);
    setHasMore(true);
    loadData();
  });

  useReachBottom(() => {
    if (loading || !hasMore) return;
    console.log('[ArticleList] 加载更多');
    setPage(prev => prev + 1);
  });

  const handleFilterChange = (filter: FilterType) => {
    setActiveFilter(filter);
  };

  const handleSearch = (e) => {
    setSearchKeyword(e.detail.value);
  };

  const handleCreate = () => {
    console.log('[ArticleList] 新建稿件');
    Taro.switchTab({
      url: '/pages/editor/index'
    });
  };

  const handleArticleClick = (article: Article) => {
    console.log('[ArticleList] 点击稿件:', article.id, article.status);
    if (article.status === 'draft' || article.status === 'pending' || article.status === 'rejected') {
      setCurrentEditingArticleId(article.id);
      Taro.switchTab({
        url: '/pages/editor/index'
      });
    } else {
      Taro.navigateTo({
        url: `/pages/article-detail/index?id=${article.id}`
      });
    }
  };

  return (
    <View className={styles.page}>
      <View className={styles.header}>
        <View className={styles.searchBar}>
          <Text className={styles.searchIcon}>🔍</Text>
          <Input
            className={styles.searchInput}
            placeholder="搜索稿件标题、内容或标签"
            value={searchKeyword}
            onInput={handleSearch}
            confirmType="search"
          />
        </View>
        
        <ScrollView 
          className={styles.filterTabs}
          scrollX
          enhanced
          showScrollbar={false}
        >
          {filterTabs.map(tab => (
            <View
              key={tab.key}
              className={classnames(
                styles.filterTab, activeFilter === tab.key && styles.active)}
              onClick={() => handleFilterChange(tab.key)}
            >
              <Text className={styles.tabText}>
                {tab.label}
              </Text>
              <Text className={classnames(styles.count, styles.tabText)}>
                ({getCountByStatus(tab.key)})
              </Text>
            </View>
          ))}
        </ScrollView>
      </View>
      
      <View className={styles.listContainer}>
        {filteredArticles.length > 0 ? (
          <View className={styles.list}>
            {filteredArticles.map(article => (
            <ArticleCard
              key={article.id}
              article={article}
              onClick={() => handleArticleClick(article)}
            />
          ))}
          </View>
        ) : (
          <View className={styles.empty}>
            <Text className={styles.emptyIcon}>📄</Text>
            <Text className={styles.emptyText}>暂无稿件</Text>
          </View>
        )}
        
        {loading && (
          <View className={styles.loading}>
            <Text className={styles.loadingText}>加载中...</Text>
          </View>
        )}
      </View>
      
      <Button className={styles.fab} onClick={handleCreate}>
        <Text className={styles.fabIcon}>+</Text>
      </Button>
    </View>
  );
};

export default ArticleListPage;
