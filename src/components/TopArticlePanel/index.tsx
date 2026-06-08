import React, { useMemo } from 'react';
import { View, Text, Button, ScrollView, Image } from '@tarojs/components';
import classnames from 'classnames';
import { useAppStore } from '@/store';
import { Article } from '@/types/article';
import styles from './index.module.scss';

interface TopArticlePanelProps {
  visible: boolean;
  onClose: () => void;
}

const TopArticlePanel: React.FC<TopArticlePanelProps> = ({ visible, onClose }) => {
  const { 
    articles, 
    categories, 
    currentTopPanelCategoryId, 
    toggleArticleTop 
  } = useAppStore();

  const category = useMemo(() => {
    if (!currentTopPanelCategoryId) return null;
    return categories.find(c => c.id === currentTopPanelCategoryId);
  }, [currentTopPanelCategoryId, categories]);

  const categoryArticles = useMemo(() => {
    if (!currentTopPanelCategoryId) return [];
    return articles.filter(a => a.categoryId === currentTopPanelCategoryId && a.status === 'published');
  }, [currentTopPanelCategoryId, articles]);

  const topArticles = useMemo(() => {
    if (!category) return [];
    return categoryArticles.filter(a => category.topArticleIds.includes(a.id));
  }, [category, categoryArticles]);

  const normalArticles = useMemo(() => {
    if (!category) return [];
    return categoryArticles.filter(a => !category.topArticleIds.includes(a.id));
  }, [category, categoryArticles]);

  const handleToggleTop = (articleId: string) => {
    if (!currentTopPanelCategoryId) return;
    toggleArticleTop(currentTopPanelCategoryId, articleId);
  };

  const handleClose = () => {
    onClose();
  };

  const handleMaskClick = (e) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  if (!visible || !category) {
    return null;
  }

  const renderArticleItem = (article: Article, isTop: boolean) => (
    <View key={article.id} className={styles.articleItem}>
      <Image className={styles.articleCover} src={article.coverImage} mode="aspectFill" />
      <View className={styles.articleInfo}>
        <Text className={styles.articleTitle} numberOfLines={1}>{article.title}</Text>
        <Text className={styles.articleDesc} numberOfLines={1}>{article.summary}</Text>
        <View className={styles.articleMeta}>
          <Text className={styles.articleDate}>{article.updatedAt.slice(5, 16)}</Text>
          <Text className={styles.articleViews}>👁 {article.views}</Text>
        </View>
      </View>
      <Button
        className={classnames(
          styles.topBtn,
          isTop ? styles.topBtnActive : styles.topBtnNormal
        )}
        onClick={() => handleToggleTop(article.id)}
      >
        <Text className={styles.topBtnText}>
          {isTop ? '取消置顶' : '设为置顶'}
        </Text>
      </Button>
    </View>
  );

  return (
    <View className={styles.mask} onClick={handleMaskClick}>
      <View className={styles.panel}>
        <View className={styles.panelHeader}>
          <View className={styles.headerInfo}>
            <Text className={styles.panelTitle}>管理置顶文章</Text>
            <Text className={styles.panelSubtitle}>栏目：{category.name} · 已置顶 {topArticles.length} 篇</Text>
          </View>
          <Button className={styles.closeBtn} onClick={handleClose}>
            <Text className={styles.closeIcon}>×</Text>
          </Button>
        </View>

        <ScrollView className={styles.panelContent} scrollY>
          {topArticles.length > 0 && (
            <View className={styles.section}>
              <View className={styles.sectionHeader}>
                <Text className={styles.sectionTitle}>📌 已置顶</Text>
                <Text className={styles.sectionCount}>{topArticles.length} 篇</Text>
              </View>
              <View className={styles.articleList}>
                {topArticles.map(article => renderArticleItem(article, true))}
              </View>
            </View>
          )}

          {normalArticles.length > 0 && (
            <View className={styles.section}>
              <View className={styles.sectionHeader}>
                <Text className={styles.sectionTitle}>📄 可置顶</Text>
                <Text className={styles.sectionCount}>{normalArticles.length} 篇</Text>
              </View>
              <View className={styles.articleList}>
                {normalArticles.map(article => renderArticleItem(article, false))}
              </View>
            </View>
          )}

          {categoryArticles.length === 0 && (
            <View className={styles.emptyState}>
              <Text className={styles.emptyIcon}>📄</Text>
              <Text className={styles.emptyText}>该栏目暂无已发布文章</Text>
              <Text className={styles.emptyDesc}>文章发布后可在此设置置顶</Text>
            </View>
          )}
        </ScrollView>

        <View className={styles.panelFooter}>
          <Button className={styles.confirmBtn} onClick={handleClose}>
            <Text className={styles.confirmBtnText}>完成</Text>
          </Button>
        </View>
      </View>
    </View>
  );
};

export default TopArticlePanel;
