import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, Button } from '@tarojs/components';
import Taro, { usePullDownRefresh } from '@tarojs/taro';
import { Category } from '@/types/category';
import { mockCategories } from '@/data/mockCategories';
import CategoryItem from '@/components/CategoryItem';
import styles from './index.module.scss';

const CategoryPage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);

  const loadData = useCallback(() => {
    setLoading(true);
    console.log('[Category] 加载栏目数据');
    
    setTimeout(() => {
      const sorted = [...mockCategories].sort((a, b) => a.sort - b.sort);
      setCategories(sorted);
      setLoading(false);
      Taro.stopPullDownRefresh();
    }, 800);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  usePullDownRefresh(() => {
    console.log('[Category] 下拉刷新');
    loadData();
  });

  const handleSortUp = (index: number) => {
    if (index === 0) return;
    console.log('[Category] 上移栏目:', categories[index].name);
    
    setCategories(prev => {
      const newList = [...prev];
      const temp = { ...newList[index], sort: newList[index - 1].sort };
      newList[index] = { ...newList[index - 1], sort: newList[index].sort };
      newList[index - 1] = temp;
      return newList.sort((a, b) => a.sort - b.sort);
    });
    
    Taro.showToast({ title: '已上移', icon: 'success' });
  };

  const handleSortDown = (index: number) => {
    if (index === categories.length - 1) return;
    console.log('[Category] 下移栏目:', categories[index].name);
    
    setCategories(prev => {
      const newList = [...prev];
      const temp = { ...newList[index], sort: newList[index + 1].sort };
      newList[index] = { ...newList[index + 1], sort: newList[index].sort };
      newList[index + 1] = temp;
      return newList.sort((a, b) => a.sort - b.sort);
    });
    
    Taro.showToast({ title: '已下移', icon: 'success' });
  };

  const handleToggleRecommend = (index: number) => {
    const category = categories[index];
    console.log('[Category] 切换推荐位:', category.name, !category.isRecommended);
    
    setCategories(prev => prev.map((cat, i) => 
      i === index ? { ...cat, isRecommended: !cat.isRecommended } : cat
    ));
    
    Taro.showToast({ 
      title: category.isRecommended ? '已取消推荐' : '已设为推荐', 
      icon: 'success' 
    });
  };

  const handleEdit = (category: Category) => {
    console.log('[Category] 编辑栏目:', category.name);
    Taro.showActionSheet({
      itemList: ['编辑栏目信息', '管理置顶文章', '删除栏目'],
      success: (res) => {
        if (res.tapIndex === 0) {
          Taro.showToast({ title: '编辑栏目', icon: 'none' });
        } else if (res.tapIndex === 1) {
          Taro.showToast({ title: '管理置顶', icon: 'none' });
        } else if (res.tapIndex === 2) {
          Taro.showModal({
            title: '删除确认',
            content: `确定要删除栏目「${category.name}」吗？该操作不可恢复。`,
            confirmColor: '#F53F3F',
            success: (modalRes) => {
              if (modalRes.confirm) {
                setCategories(prev => prev.filter(c => c.id !== category.id));
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
        {categories.length > 0 ? (
          <View className={styles.list}>
            {categories.map((category, index) => (
              <CategoryItem
                key={category.id}
                category={category}
                isFirst={index === 0}
                isLast={index === categories.length - 1}
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
    </View>
  );
};

export default CategoryPage;
