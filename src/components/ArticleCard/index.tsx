import React from 'react';
import { View, Text, Image } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import { Article } from '@/types/article';
import StatusTag from '@/components/StatusTag';
import styles from './index.module.scss';

export interface ArticleCardProps {
  article: Article;
  showStats?: boolean;
  onClick?: () => void;
}

const ArticleCard: React.FC<ArticleCardProps> = ({ article, showStats = true, onClick }) => {
  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      Taro.navigateTo({
        url: `/pages/article-detail/index?id=${article.id}`
      });
    }
  };

  const formatDate = (dateStr: string) => {
    return dateStr.split(' ')[0];
  };

  return (
    <View className={styles.card} onClick={handleClick}>
      <View className={styles.leftContent}>
        <View className={styles.header}>
          <StatusTag status={article.status} size="sm" />
          {article.isTop && (
            <View className={classnames(styles.topTag, styles.tag)}>
              <Text className={styles.tagText}>置顶</Text>
            </View>
          )}
          {article.isRecommended && (
            <View className={classnames(styles.recommendTag, styles.tag)}>
              <Text className={styles.tagText}>推荐</Text>
            </View>
          )}
        </View>
        
        <Text className={styles.title}>{article.title}</Text>
        <Text className={styles.summary}>{article.summary}</Text>
        
        <View className={styles.meta}>
          <Text className={styles.metaItem}>{article.categoryName}</Text>
          <Text className={styles.metaDot}>·</Text>
          <Text className={styles.metaItem}>{article.author}</Text>
          <Text className={styles.metaDot}>·</Text>
          <Text className={styles.metaItem}>{formatDate(article.updatedAt)}</Text>
        </View>
        
        {showStats && article.status === 'published' && (
          <View className={styles.stats}>
            <View className={styles.statItem}>
              <Text className={styles.statIcon}>👁</Text>
              <Text className={styles.statText}>{article.views}</Text>
            </View>
            <View className={styles.statItem}>
              <Text className={styles.statIcon}>↗</Text>
              <Text className={styles.statText}>{article.shares}</Text>
            </View>
            <View className={styles.statItem}>
              <Text className={styles.statIcon}>💬</Text>
              <Text className={styles.statText}>{article.comments}</Text>
            </View>
          </View>
        )}
        
        {article.tags.length > 0 && (
          <View className={styles.tags}>
            {article.tags.slice(0, 3).map((tag, index) => (
              <View key={index} className={styles.tagItem}>
                <Text className={styles.tagItemText}>#{tag}</Text>
              </View>
            ))}
          </View>
        )}
      </View>
      
      <Image 
        className={styles.cover} 
        src={article.coverImage} 
        mode="aspectFill"
        lazyLoad
      />
    </View>
  );
};

export default ArticleCard;
