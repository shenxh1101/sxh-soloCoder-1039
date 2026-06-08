import React, { useState, useMemo } from 'react';
import { View, Text, Image, ScrollView, Button } from '@tarojs/components';
import Taro, { useRouter, useDidShow } from '@tarojs/taro';
import classnames from 'classnames';
import { useAppStore } from '@/store';
import StatusTag from '@/components/StatusTag';
import styles from './index.module.scss';

const ArticleDetailPage: React.FC = () => {
  const router = useRouter();
  const { articles, reviews, setCurrentEditingArticleId } = useAppStore();
  
  const articleId = router.params.id as string;
  
  const article = useMemo(() => articles.find(a => a.id === articleId), [articles, articleId]);
  const review = useMemo(() => reviews.find(r => r.articleId === articleId), [reviews, articleId]);

  if (!article) {
    return (
      <View className={styles.page}>
        <View className={styles.emptyState}>
          <Text className={styles.emptyIcon}>❌</Text>
          <Text className={styles.emptyTitle}>文章不存在</Text>
          <Text className={styles.emptyDesc}>未找到对应的文章数据</Text>
        </View>
      </View>
    );
  }

  const canEdit = article.status === 'draft' || article.status === 'pending' || article.status === 'rejected';

  const handleEdit = () => {
    console.log('[ArticleDetail] 编辑文章:', article.id);
    setCurrentEditingArticleId(article.id);
    Taro.switchTab({
      url: '/pages/editor/index'
    });
  };

  const handleViewDiff = () => {
    console.log('[ArticleDetail] 查看版本对比:', article.id);
    Taro.navigateTo({
      url: `/pages/version-diff/index?id=${article.id}`
    });
  };

  const getStatusText = (status: string) => {
    const statusMap: Record<string, string> = {
      draft: '草稿',
      pending: '待审核',
      approved: '已通过',
      rejected: '已退回',
      published: '已发布',
      offline: '已下架'
    };
    return statusMap[status] || status;
  };

  const formatDate = (dateStr: string) => {
    return dateStr.slice(5, 16);
  };

  const allHistory = useMemo(() => {
    if (review) {
      const history = review.history || [];
      return [
        ...history,
        {
          id: `current-${Date.now()}`,
          version: review.version,
          status: review.status,
          submitter: review.submitter,
          submitTime: review.submitTime,
          reviewer: review.reviewer,
          reviewTime: review.reviewTime,
          reviewComment: review.reviewComment
        }
      ];
    }
    return [];
  }, [review]);

  return (
    <ScrollView className={styles.page} scrollY>
      <View className={styles.coverSection}>
        <Image 
          className={styles.coverImage} src={article.coverImage} mode="aspectFill" />
        <View className={styles.coverOverlay}>
          <View className={styles.coverTitle}>{article.title}</View>
        </View>
      </View>

      <View className={styles.content}>
        <View className={styles.metaSection}>
          {review && (
            <View className={styles.metaRow}>
              <Text className={styles.metaLabel}>审核状态</Text>
              <StatusTag status={review.status} size="md" />
            </View>
          )}
          {(article.status === 'published' || article.status === 'offline') && (
            <View className={styles.metaRow}>
              <Text className={styles.metaLabel}>发布状态</Text>
              <StatusTag status={article.status} size="md" />
            </View>
          )}
          {!review && article.status !== 'published' && article.status !== 'offline' && (
            <View className={styles.metaRow}>
              <Text className={styles.metaLabel}>状态</Text>
              <StatusTag status={article.status} size="md" />
            </View>
          )}
          <View className={styles.metaRow}>
            <Text className={styles.metaLabel}>栏目</Text>
            <Text className={styles.metaValue}>{article.categoryName}</Text>
          </View>
          <View className={styles.metaRow}>
            <Text className={styles.metaLabel}>作者</Text>
            <Text className={styles.metaValue}>{article.author}</Text>
          </View>
          <View className={styles.metaRow}>
            <Text className={styles.metaLabel}>创建时间</Text>
            <Text className={styles.metaValue}>{formatDate(article.createdAt)}</Text>
          </View>
          <View className={styles.metaRow}>
            <Text className={styles.metaLabel}>更新时间</Text>
            <Text className={styles.metaValue}>{formatDate(article.updatedAt)}</Text>
          </View>
          {article.scheduledPublishTime && (
            <View className={styles.metaRow}>
              <Text className={styles.metaLabel}>定时发布</Text>
              <Text className={styles.metaValue}>{formatDate(article.scheduledPublishTime)}</Text>
            </View>
          )}
        </View>

        <View className={styles.section}>
          <Text className={styles.sectionTitle}>文章摘要</Text>
          <Text className={styles.summaryText}>{article.summary || '暂无摘要'}</Text>
        </View>

        <View className={styles.section}>
          <Text className={styles.sectionTitle}>文章正文</Text>
          <View className={styles.contentText}>
            <Text className={styles.contentInner}>{article.content}</Text>
          </View>
        </View>

        {article.tags.length > 0 && (
          <View className={styles.section}>
            <Text className={styles.sectionTitle}>话题标签</Text>
            <View className={styles.tagsList}>
              {article.tags.map((tag, index) => (
                <View key={index} className={styles.tagItem}>
                  <Text className={styles.tagText}>#{tag}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {article.images.length > 0 && (
          <View className={styles.section}>
            <Text className={styles.sectionTitle}>正文图片</Text>
            <ScrollView className={styles.imagesList} scrollX>
              {article.images.map((img, index) => (
                <Image key={index} className={styles.contentImage} src={img} mode="aspectFill" />
              ))}
            </ScrollView>
          </View>
        )}

        {article.versions.length > 1 && (
          <View className={styles.section}>
            <Text className={styles.sectionTitle}>版本信息</Text>
            <View className={styles.versionInfo}>
              <Text className={styles.versionText}>当前版本：v{article.versions.length}</Text>
              <Button className={styles.viewDiffBtn} onClick={handleViewDiff}>
                <Text className={styles.viewDiffText}>查看版本对比</Text>
              </Button>
            </View>
          </View>
        )}

        {allHistory.length > 0 && (
          <View className={styles.section}>
            <Text className={styles.sectionTitle}>审核历史</Text>
            <View className={styles.timeline}>
              {allHistory.map((item, index) => (
                <View key={item.id} className={styles.timelineItem}>
                  <View className={styles.timelineDot} />
                  <View className={classnames(
                    styles.timelineLine,
                    index === allHistory.length - 1 && styles.timelineLineLast
                  )} />
                  <View className={styles.timelineContent}>
                    <View className={styles.timelineHeader}>
                      <StatusTag status={item.status} size="sm" />
                      <Text className={styles.timelineVersion}>v{item.version}</Text>
                    </View>
                    <View className={styles.timelineMeta}>
                      <Text className={styles.timelineText}>
                        {item.submitter} 于 {formatDate(item.submitTime)} 提交
                      </Text>
                    </View>
                    {item.reviewer && item.reviewTime && (
                      <View className={styles.timelineMeta}>
                      <Text className={styles.timelineText}>
                        {item.reviewer} 于 {formatDate(item.reviewTime)} 审核
                      </Text>
                    </View>
                    )}
                    {item.reviewComment && (
                      <View className={styles.timelineComment}>
                        <Text className={styles.timelineCommentLabel}>审核意见：</Text>
                        <Text className={styles.timelineCommentText}>{item.reviewComment}</Text>
                      </View>
                    )}
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        <View className={styles.statsSection}>
          <View className={styles.statItem}>
            <Text className={styles.statNumber}>{article.views}</Text>
            <Text className={styles.statLabel}>阅读</Text>
          </View>
          <View className={styles.statItem}>
            <Text className={styles.statNumber}>{article.shares}</Text>
            <Text className={styles.statLabel}>分享</Text>
          </View>
          <View className={styles.statItem}>
            <Text className={styles.statNumber}>{article.comments}</Text>
            <Text className={styles.statLabel}>评论</Text>
          </View>
        </View>
      </View>

      {canEdit && (
        <View className={styles.bottomBar}>
          <Button className={styles.editBtn} onClick={handleEdit}>
            <Text className={styles.editBtnText}>继续编辑</Text>
          </Button>
        </View>
      )}
    </ScrollView>
  );
};

export default ArticleDetailPage;
