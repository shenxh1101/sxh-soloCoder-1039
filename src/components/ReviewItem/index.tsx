import React from 'react';
import { View, Text, Image, Button } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import { ReviewRecord } from '@/types/review';
import StatusTag from '@/components/StatusTag';
import styles from './index.module.scss';

export interface ReviewItemProps {
  review: ReviewRecord;
  onViewDiff?: () => void;
  onResubmit?: () => void;
  onViewDetail?: () => void;
}

const ReviewItem: React.FC<ReviewItemProps> = ({
  review,
  onViewDiff,
  onResubmit,
  onViewDetail
}) => {
  const handleViewDiff = (e) => {
    e.stopPropagation();
    if (onViewDiff) {
      onViewDiff();
    } else {
      Taro.navigateTo({
        url: `/pages/version-diff/index?id=${review.articleId}`
      });
    }
  };

  const handleResubmit = (e) => {
    e.stopPropagation();
    if (onResubmit) {
      onResubmit();
    }
  };

  const handleViewDetail = () => {
    if (onViewDetail) {
      onViewDetail();
    } else {
      Taro.navigateTo({
        url: `/pages/article-detail/index?id=${review.articleId}`
      });
    }
  };

  const formatDate = (dateStr: string) => {
    return dateStr.split(' ')[0];
  };

  return (
    <View className={styles.card} onClick={handleViewDetail}>
      <View className={styles.header}>
        <Image 
          className={styles.cover} 
          src={review.articleCover} 
          mode="aspectFill"
        />
        <View className={styles.headerRight}>
          <View className={styles.topRow}>
            <StatusTag status={review.status} size="sm" />
            <Text className={styles.version}>v{review.version}</Text>
          </View>
          <Text className={styles.title}>{review.articleTitle}</Text>
        </View>
      </View>
      
      <View className={styles.meta}>
        <View className={styles.metaItem}>
          <Text className={styles.metaLabel}>提交人</Text>
          <Text className={styles.metaValue}>{review.submitter}</Text>
        </View>
        <View className={styles.metaItem}>
          <Text className={styles.metaLabel}>提交时间</Text>
          <Text className={styles.metaValue}>{formatDate(review.submitTime)}</Text>
        </View>
      </View>
      
      {review.reviewer && (
        <View className={styles.meta}>
          <View className={styles.metaItem}>
            <Text className={styles.metaLabel}>审核人</Text>
            <Text className={styles.metaValue}>{review.reviewer}</Text>
          </View>
          {review.reviewTime && (
            <View className={styles.metaItem}>
              <Text className={styles.metaLabel}>审核时间</Text>
              <Text className={styles.metaValue}>{formatDate(review.reviewTime)}</Text>
            </View>
          )}
        </View>
      )}
      
      {review.reviewComment && (
        <View className={styles.commentBox}>
          <Text className={styles.commentLabel}>审核意见：</Text>
          <Text className={styles.commentText}>{review.reviewComment}</Text>
        </View>
      )}
      
      <View className={styles.actions}>
        <Button 
          className={classnames(styles.actionBtn, styles.secondaryBtn)}
          onClick={handleViewDiff}
        >
          <Text className={styles.btnText}>版本对比</Text>
        </Button>
        {review.status === 'rejected' && (
          <Button 
            className={classnames(styles.actionBtn, styles.primaryBtn)}
            onClick={handleResubmit}
          >
            <Text className={styles.btnTextWhite}>重新提交</Text>
          </Button>
        )}
        {review.status === 'pending' && (
          <Button 
            className={classnames(styles.actionBtn, styles.primaryBtn)}
            onClick={handleViewDetail}
          >
            <Text className={styles.btnTextWhite}>查看详情</Text>
          </Button>
        )}
      </View>
    </View>
  );
};

export default ReviewItem;
