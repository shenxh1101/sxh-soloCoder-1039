import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro, { usePullDownRefresh } from '@tarojs/taro';
import classnames from 'classnames';
import { ReviewRecord, ReviewStatus } from '@/types/review';
import { mockReviews } from '@/data/mockReviews';
import ReviewItem from '@/components/ReviewItem';
import styles from './index.module.scss';

type FilterType = 'all' | ReviewStatus;

interface FilterTab {
  key: FilterType;
  label: string;
}

const ReviewPage: React.FC = () => {
  const [reviews, setReviews] = useState<ReviewRecord[]>([]);
  const [filteredReviews, setFilteredReviews] = useState<ReviewRecord[]>([]);
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [loading, setLoading] = useState(false);

  const filterTabs: FilterTab[] = [
    { key: 'all', label: '全部' },
    { key: 'pending', label: '待审核' },
    { key: 'approved', label: '已通过' },
    { key: 'rejected', label: '已退回' }
  ];

  const getCountByStatus = (status: FilterType) => {
    if (status === 'all') return mockReviews.length;
    return mockReviews.filter(r => r.status === status).length;
  };

  const getStats = () => {
    const pending = reviews.filter(r => r.status === 'pending').length;
    const approved = reviews.filter(r => r.status === 'approved').length;
    const rejected = reviews.filter(r => r.status === 'rejected').length;
    return { pending, approved, rejected };
  };

  const loadData = useCallback(() => {
    setLoading(true);
    console.log('[Review] 加载审核数据');
    
    setTimeout(() => {
      setReviews(mockReviews);
      setLoading(false);
      Taro.stopPullDownRefresh();
    }, 800);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    let result = [...reviews];
    
    if (activeFilter !== 'all') {
      result = result.filter(review => review.status === activeFilter);
    }
    
    setFilteredReviews(result);
    console.log('[Review] 筛选结果:', result.length, '条');
  }, [reviews, activeFilter]);

  usePullDownRefresh(() => {
    console.log('[Review] 下拉刷新');
    loadData();
  });

  const handleFilterChange = (filter: FilterType) => {
    setActiveFilter(filter);
  };

  const handleViewDiff = (review: ReviewRecord) => {
    console.log('[Review] 查看版本对比:', review.articleId);
    Taro.navigateTo({
      url: `/pages/version-diff/index?id=${review.articleId}`
    });
  };

  const handleResubmit = (review: ReviewRecord) => {
    console.log('[Review] 重新提交稿件:', review.articleId);
    Taro.showModal({
      title: '重新提交',
      content: '确定要重新提交此稿件进入审核流程吗？',
      success: (res) => {
        if (res.confirm) {
          Taro.showLoading({ title: '提交中...' });
          setTimeout(() => {
            Taro.hideLoading();
            Taro.showToast({ title: '已重新提交', icon: 'success' });
            console.log('[Review] 稿件已重新提交');
            setReviews(prev => prev.map(r => 
              r.id === review.id 
                ? { ...r, status: 'pending' as const, reviewComment: undefined, reviewer: undefined, reviewTime: undefined }
                : r
            ));
          }, 1000);
        }
      }
    });
  };

  const handleViewDetail = (review: ReviewRecord) => {
    console.log('[Review] 查看详情:', review.articleId);
    Taro.navigateTo({
      url: `/pages/article-detail/index?id=${review.articleId}`
    });
  };

  const stats = getStats();

  return (
    <View className={styles.page}>
      <View className={styles.header}>
        <View className={styles.statsRow}>
          <View className={styles.statItem}>
            <Text className={styles.statNumber} style={{ color: '#FF7D00' }}>{stats.pending}</Text>
            <Text className={styles.statLabel}>待审核</Text>
          </View>
          <View className={styles.statItem}>
            <Text className={styles.statNumber} style={{ color: '#00B42A' }}>{stats.approved}</Text>
            <Text className={styles.statLabel}>已通过</Text>
          </View>
          <View className={styles.statItem}>
            <Text className={styles.statNumber} style={{ color: '#F53F3F' }}>{stats.rejected}</Text>
            <Text className={styles.statLabel}>已退回</Text>
          </View>
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
                styles.filterTab,
                activeFilter === tab.key && styles.active
              )}
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
        {filteredReviews.length > 0 ? (
          <View className={styles.list}>
            {filteredReviews.map(review => (
              <ReviewItem
                key={review.id}
                review={review}
                onViewDiff={() => handleViewDiff(review)}
                onResubmit={() => handleResubmit(review)}
                onViewDetail={() => handleViewDetail(review)}
              />
            ))}
          </View>
        ) : (
          <View className={styles.empty}>
            <Text className={styles.emptyIcon}>📋</Text>
            <Text className={styles.emptyText}>暂无审核记录</Text>
          </View>
        )}
        
        {loading && (
          <View className={styles.loading}>
            <Text className={styles.loadingText}>加载中...</Text>
          </View>
        )}
      </View>
    </View>
  );
};

export default ReviewPage;
