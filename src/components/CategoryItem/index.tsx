import React from 'react';
import { View, Text, Button } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import { Category } from '@/types/category';
import styles from './index.module.scss';

export interface CategoryItemProps {
  category: Category;
  onSortUp?: () => void;
  onSortDown?: () => void;
  onToggleRecommend?: () => void;
  onEdit?: () => void;
  isFirst?: boolean;
  isLast?: boolean;
}

const CategoryItem: React.FC<CategoryItemProps> = ({
  category,
  onSortUp,
  onSortDown,
  onToggleRecommend,
  onEdit,
  isFirst = false,
  isLast = false
}) => {
  const handleSortUp = (e) => {
    e.stopPropagation();
    if (onSortUp) onSortUp();
  };

  const handleSortDown = (e) => {
    e.stopPropagation();
    if (onSortDown) onSortDown();
  };

  const handleToggleRecommend = (e) => {
    e.stopPropagation();
    if (onToggleRecommend) onToggleRecommend();
  };

  const handleEdit = () => {
    if (onEdit) {
      onEdit();
    } else {
      Taro.showToast({
        title: '编辑栏目',
        icon: 'none'
      });
    }
  };

  return (
    <View className={styles.card} onClick={handleEdit}>
      <View className={styles.header}>
        <View className={styles.nameRow}>
          <Text className={styles.sortNum}>{category.sort}</Text>
          <Text className={styles.name}>{category.name}</Text>
          {category.isRecommended && (
            <View className={styles.recommendTag}>
              <Text className={styles.recommendText}>推荐位</Text>
            </View>
          )}
        </View>
        <Text className={styles.articleCount}>{category.articleCount} 篇</Text>
      </View>
      
      <Text className={styles.description}>{category.description}</Text>
      
      {category.topArticleIds.length > 0 && (
        <View className={styles.topInfo}>
          <Text className={styles.topLabel}>置顶：</Text>
          <Text className={styles.topCount}>{category.topArticleIds.length} 篇</Text>
        </View>
      )}
      
      <View className={styles.actions}>
        <Button 
          className={classnames(styles.actionBtn, styles.sortBtn, isFirst && styles.disabled)}
          onClick={handleSortUp}
          disabled={isFirst}
        >
          <Text className={styles.actionIcon}>↑</Text>
        </Button>
        <Button 
          className={classnames(styles.actionBtn, styles.sortBtn, isLast && styles.disabled)}
          onClick={handleSortDown}
          disabled={isLast}
        >
          <Text className={styles.actionIcon}>↓</Text>
        </Button>
        <Button 
          className={classnames(
            styles.actionBtn, 
            styles.recommendBtn,
            category.isRecommended && styles.active
          )}
          onClick={handleToggleRecommend}
        >
          <Text className={styles.actionText}>
            {category.isRecommended ? '取消推荐' : '设为推荐'}
          </Text>
        </Button>
      </View>
    </View>
  );
};

export default CategoryItem;
