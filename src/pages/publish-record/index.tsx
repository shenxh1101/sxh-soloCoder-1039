import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, Image, ScrollView } from '@tarojs/components';
import Taro, { usePullDownRefresh } from '@tarojs/taro';
import classnames from 'classnames';
import { PublishRecord, PublishStats, UnpublishedArticle } from '@/types/publish';
import { 
  mockPublishRecords, 
  mockPublishStats, 
  mockUnpublishedArticles 
} from '@/data/mockPublishRecords';
import StatCard from '@/components/StatCard';
import StatusTag from '@/components/StatusTag';
import styles from './index.module.scss';

const PublishRecordPage: React.FC = () => {
  const [records, setRecords] = useState<PublishRecord[]>([]);
  const [stats, setStats] = useState<PublishStats>(mockPublishStats);
  const [loading, setLoading] = useState(false);
  const [showUnpublished, setShowUnpublished] = useState(false);
  const [unpublishedArticles, setUnpublishedArticles] = useState<UnpublishedArticle[]>([]);

  const loadData = useCallback(() => {
    setLoading(true);
    console.log('[PublishRecord] 加载发布记录');
    
    setTimeout(() => {
      setRecords(mockPublishRecords);
      setStats(mockPublishStats);
      setUnpublishedArticles(mockUnpublishedArticles);
      setLoading(false);
      Taro.stopPullDownRefresh();
    }, 800);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  usePullDownRefresh(() => {
    console.log('[PublishRecord] 下拉刷新');
    loadData();
  });

  const handleAbnormalClick = () => {
    console.log('[PublishRecord] 查看异常稿件');
    const abnormalRecords = records.filter(r => r.isAbnormal);
    if (abnormalRecords.length > 0) {
      Taro.showModal({
        title: '异常提醒',
        content: `共有 ${abnormalRecords.length} 条异常稿件：\n\n${abnormalRecords.map(r => `• ${r.articleTitle}\n  ${r.abnormalReason}`).join('\n')}`,
        showCancel: false,
        confirmText: '我知道了'
      });
    }
  };

  const handleUnpublishedClick = () => {
    console.log('[PublishRecord] 查看未发布稿件');
    setShowUnpublished(true);
  };

  const handleCloseUnpublished = () => {
    setShowUnpublished(false);
  };

  const handleUnpublishedItemClick = (article: UnpublishedArticle) => {
    console.log('[PublishRecord] 点击未发布稿件:', article.id);
    setShowUnpublished(false);
    if (article.status === 'draft') {
      Taro.switchTab({ url: '/pages/editor/index' });
    } else {
      Taro.switchTab({ url: '/pages/review/index' });
    }
  };

  const handleRecordClick = (record: PublishRecord) => {
    console.log('[PublishRecord] 点击发布记录:', record.id);
    Taro.navigateTo({
      url: `/pages/article-detail/index?id=${record.articleId}`
    });
  };

  const formatDate = (dateStr: string) => {
    return dateStr.split(' ')[0];
  };

  const getStatusText = (status: string) => {
    const map: Record<string, string> = {
      published: '已发布',
      offline: '已下架',
      failed: '发布失败'
    };
    return map[status] || status;
  };

  return (
    <View className={styles.page}>
      <View className={styles.statsSection}>
        <View className={styles.statsGrid}>
          <StatCard
            title="总发布数"
            value={stats.totalPublished}
            unit="篇"
            trend={12}
            type="primary"
          />
          <StatCard
            title="总阅读量"
            value={stats.totalViews}
            trend={8}
            type="success"
          />
          <StatCard
            title="总分享数"
            value={stats.totalShares}
            trend={15}
            type="warning"
          />
          <StatCard
            title="总评论数"
            value={stats.totalComments}
            trend={-3}
            type="error"
          />
        </View>
        
        <View className={styles.alertBanners}>
          {stats.abnormalCount > 0 && (
            <View 
              className={classnames(styles.alertBanner, styles.abnormal)}
              onClick={handleAbnormalClick}
            >
              <View className={styles.alertContent}>
                <Text className={styles.alertIcon}>⚠️</Text>
                <View className={styles.alertInfo}>
                  <Text className={styles.alertTitle}>
                    {stats.abnormalCount} 条稿件异常
                  </Text>
                  <Text className={styles.alertDesc}>点击查看详情</Text>
                </View>
              </View>
              <Text className={styles.alertArrow}>›</Text>
            </View>
          )}
          
          {stats.unpublishedCount > 0 && (
            <View 
              className={classnames(styles.alertBanner, styles.unpublished)}
              onClick={handleUnpublishedClick}
            >
              <View className={styles.alertContent}>
                <Text className={styles.alertIcon}>📝</Text>
                <View className={styles.alertInfo}>
                  <Text className={styles.alertTitle}>
                    {stats.unpublishedCount} 篇未发布
                  </Text>
                  <Text className={styles.alertDesc}>
                    {unpublishedArticles.filter(a => a.status === 'draft').length} 篇草稿 · 
                    {unpublishedArticles.filter(a => a.status === 'pending').length} 篇待审 · 
                    {unpublishedArticles.filter(a => a.status === 'rejected').length} 篇被退
                  </Text>
                </View>
              </View>
              <Text className={styles.alertArrow}>›</Text>
            </View>
          )}
        </View>
      </View>
      
      <View className={styles.filterBar}>
        <Text className={styles.filterTitle}>发布记录</Text>
        <View className={styles.filterSelect}>
          <Text>全部时间</Text>
          <Text className={styles.filterArrow}>▼</Text>
        </View>
      </View>
      
      <View className={styles.listContainer}>
        {records.length > 0 ? (
          <ScrollView scrollY enhanced>
            {records.map(record => (
              <View 
                key={record.id} 
                className={styles.recordCard}
                onClick={() => handleRecordClick(record)}
              >
                <View className={styles.recordHeader}>
                  <Image 
                    className={styles.recordCover} 
                    src={record.articleCover} 
                    mode="aspectFill"
                  />
                  <View className={styles.recordInfo}>
                    <View>
                      <View style={{ display: 'flex', alignItems: 'center', gap: '16rpx', marginBottom: '8rpx' }}>
                        <StatusTag 
                          status={record.status} 
                          text={getStatusText(record.status)}
                          size="sm"
                        />
                        {record.isAbnormal && (
                          <View style={{ 
                            fontSize: '20rpx', 
                            color: '#F53F3F',
                            background: 'rgba(245, 63, 63, 0.1)',
                            padding: '4rpx 12rpx',
                            borderRadius: '8rpx'
                          }}>
                            异常
                          </View>
                        )}
                      </View>
                      <Text className={styles.recordTitle}>{record.articleTitle}</Text>
                    </View>
                    <View className={styles.recordMeta}>
                      <Text className={styles.recordCategory}>{record.categoryName}</Text>
                      <Text className={styles.recordTime}>{formatDate(record.publishTime)}</Text>
                      <Text className={styles.recordTime}>操作人：{record.operator}</Text>
                    </View>
                  </View>
                </View>
                
                <View className={styles.recordStats}>
                  <View className={styles.statItem}>
                    <Text className={styles.statIcon}>👁</Text>
                    <Text className={styles.statValue}>{record.views.toLocaleString()}</Text>
                  </View>
                  <View className={styles.statItem}>
                    <Text className={styles.statIcon}>↗</Text>
                    <Text className={styles.statValue}>{record.shares.toLocaleString()}</Text>
                  </View>
                  <View className={styles.statItem}>
                    <Text className={styles.statIcon}>💬</Text>
                    <Text className={styles.statValue}>{record.comments.toLocaleString()}</Text>
                  </View>
                </View>
                
                {record.isAbnormal && record.abnormalReason && (
                  <View className={styles.abnormalReason}>
                    <Text className={styles.abnormalReasonText}>
                      异常原因：{record.abnormalReason}
                    </Text>
                  </View>
                )}
              </View>
            ))}
          </ScrollView>
        ) : (
          <View className={styles.empty}>
            <Text className={styles.emptyIcon}>📊</Text>
            <Text className={styles.emptyText}>暂无发布记录</Text>
          </View>
        )}
        
        {loading && (
          <View className={styles.loading}>
            <Text className={styles.loadingText}>加载中...</Text>
          </View>
        )}
      </View>
      
      {showUnpublished && (
        <View className={styles.unpublishedPanel} onClick={handleCloseUnpublished}>
          <View className={styles.panelContent} onClick={e => e.stopPropagation()}>
            <View className={styles.panelHeader}>
              <Text className={styles.panelTitle}>未发布稿件</Text>
              <Text className={styles.panelClose} onClick={handleCloseUnpublished}>×</Text>
            </View>
            
            <ScrollView className={styles.unpublishedList} scrollY>
              {unpublishedArticles.map(article => (
                <View 
                  key={article.id}
                  className={styles.unpublishedItem}
                  onClick={() => handleUnpublishedItemClick(article)}
                >
                  <View className={styles.unpublishedInfo}>
                    <Text className={styles.unpublishedTitle}>{article.title}</Text>
                    <Text className={styles.unpublishedTime}>
                      更新于 {formatDate(article.updatedAt)}
                    </Text>
                  </View>
                  <StatusTag status={article.status} size="sm" />
                </View>
              ))}
            </ScrollView>
          </View>
        </View>
      )}
    </View>
  );
};

export default PublishRecordPage;
