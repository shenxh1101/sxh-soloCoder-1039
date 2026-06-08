import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, Text, Button } from '@tarojs/components';
import Taro, { usePullDownRefresh, useDidShow } from '@tarojs/taro';
import { Category } from '@/types/category';
import { useAppStore } from '@/store';
import CategoryItem from '@/components/CategoryItem';
import TopArticlePanel from '@/components/TopArticlePanel';
import styles from './index.module.scss';

const CategoryPage: React.FC = () => {
  const { 
    categories, 
    currentTopPanelCategoryId,
    setCurrentTopPanelCategoryId,
    moveCategory, 
    toggleCategoryRecommend,
    updateCategory
  } = useAppStore();
  
  const [loading, setLoading] = useState(false);
  const [showTopPanel, setShowTopPanel] = useState(false);

  const sortedCategories = useMemo(() => {
    return [...categories].sort((a, b) => a.sort - b.sort);
  }, [categories]);

  const loadData = useCallback(() => {
    setLoading(true);
    console.log('[Category] 加载栏目数据');
    
    setTimeout(() => {
      setLoading(false);
      Taro.stopPullDownRefresh();
    }, 500);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useDidShow(() => {
    console.log('[Category] 页面显示');
  });

  useEffect(() => {
    if (currentTopPanelCategoryId) {
      setShowTopPanel(true);
    }
  }, [currentTopPanelCategoryId]);

  usePullDownRefresh(() => {
    console.log('[Category] 下拉刷新');
    loadData();
  });

  const handleSortUp = (index: number) => {
    if (index === 0) return;
    const category = sortedCategories[index];
    console.log('[Category] 上移栏目:', category.name);
    moveCategory(category.id, 'up');
    Taro.showToast({ title: '已上移', icon: 'success' });
  };

  const handleSortDown = (index: number) => {
    if (index === sortedCategories.length - 1) return;
    const category = sortedCategories[index];
    console.log('[Category] 下移栏目:', category.name);
    moveCategory(category.id, 'down');
    Taro.showToast({ title: '已下移', icon: 'success' });
  };

  const handleToggleRecommend = (index: number) => {
    const category = sortedCategories[index];
    console.log('[Category] 切换推荐位:', category.name, !category.isRecommended);
    toggleCategoryRecommend(category.id);
    Taro.showToast({ 
      title: category.isRecommended ? '已取消推荐' : '已设为推荐', 
      icon: 'success' 
    });
  };

  const handleCloseTopPanel = () => {
    setShowTopPanel(false);
    setCurrentTopPanelCategoryId(null);
  };

  const handleEdit = (category: Category) => {
    console.log('[Category] 编辑栏目:', category.name);
    Taro.showActionSheet({
      itemList: ['编辑栏目信息', '管理置顶文章', '删除栏目'],
      success: (res) => {
        if (res.tapIndex === 0) {
          Taro.showToast({ title: '编辑栏目', icon: 'none' });
        } else if (res.tapIndex === 1) {
          console.log('[Category] 打开置顶管理面板:', category.id);
          setCurrentTopPanelCategoryId(category.id);
          setShowTopPanel(true);
        } else if (res.tapIndex === 2) {
          Taro.showModal({
            title: '删除确认',
            content: `确定要删除栏目「${category.name}」吗？该操作不可恢复。`,
            confirmColor: '#F53F3F',
            success: (modalRes) => {
              if (modalRes.confirm) {
                console.log('[Category] 删除栏目:', category.id);
                updateCategory(category.id, { ...category, articleCount: 0 });
                Taro.showToast({ title: '已删除', icon: 'success' });
              }
            }
          });
        }
      }
    });
  };

  const handleAdd = () => {
    console.log('[Category] 新建栏目');
    Taro.showToast({ title: '新建栏目功能开发中...', icon: 'none' });
  };

  return (
    <View className={styles.page}>
      <View className={styles.header}>
        <Text className={styles.headerTitle}>栏目管理</Text>
        <Text className={styles.headerDesc}>拖拽调整顺序，设置推荐位和置顶内容</Text>
      </View>
      
      <View className={styles.listContainer}>
        {sortedCategories.length > 0 ? (
          <View className={styles.list}>
            {sortedCategories.map((category, index) => (
              <CategoryItem
                key={category.id}
                category={category}
                isFirst={index === 0}
                isLast={index === sortedCategories.length - 1}
                onSortUp={() => handleSortUp(index)}
                onSortDown={() => handleSortDown(index)}
                onToggleRecommend={() => handleToggleRecommend(index)}
                onEdit={() => handleEdit(category)}
              />
            ))}
          </View>
        ) : (
          <View className={styles.empty}>
            <Text className={styles.emptyIcon}>📁</Text>
            <Text className={styles.emptyText}>暂无栏目</Text>
          </View>
        )}
        
        {loading && (
          <View className={styles.loading}>
            <Text className={styles.loadingText}>加载中...</Text>
          </View>
        )}
      </View>
      
      <Button className={styles.addBtn} onClick={handleAdd}>
        <Text className={styles.addBtnIcon}>+</Text>
      </Button>

      <TopArticlePanel
        visible={showTopPanel}
        onClose={handleCloseTopPanel}
      />
    </View>
  );
};

export default CategoryPage;
