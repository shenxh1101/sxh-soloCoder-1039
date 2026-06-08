import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, ScrollView, Picker } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';
import classnames from 'classnames';
import { useAppStore } from '@/store';
import { Article, ArticleVersion } from '@/types/article';
import styles from './index.module.scss';

interface DiffSegment {
  type: 'unchanged' | 'added' | 'removed';
  content: string;
}

const VersionDiffPage: React.FC = () => {
  const router = useRouter();
  const { articles } = useAppStore();
  
  const articleId = router.params.id as string;
  const article = useMemo(() => articles.find(a => a.id === articleId), [articles, articleId]);
  
  const [oldVersionIndex, setOldVersionIndex] = useState(0);
  const [newVersionIndex, setNewVersionIndex] = useState(1);

  useEffect(() => {
    console.log('[VersionDiff] 页面初始化，文章ID:', articleId);
    if (article && article.versions.length >= 2) {
      setOldVersionIndex(article.versions.length - 2);
      setNewVersionIndex(article.versions.length - 1);
    }
  }, [articleId, article]);

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

  const versions = article.versions;

  if (versions.length < 2) {
    return (
      <View className={styles.page}>
        <View className={styles.emptyState}>
          <Text className={styles.emptyIcon}>📊</Text>
          <Text className={styles.emptyTitle}>暂无历史版本</Text>
          <Text className={styles.emptyDesc}>
            该文章目前只有 1 个版本，无法进行版本对比。
            {"\n"}
            当文章有多个版本时，您可以在此处查看不同版本的差异。
          </Text>
        </View>
      </View>
    );
  }

  const versionOptions = versions.map((v, i) => `版本 ${v.version} (${v.createdAt.slice(5, 16)})`);

  const computeDiff = (oldText: string, newText: string): DiffSegment[] => {
    if (!oldText && !newText) return [];
    if (!oldText) return [{ type: 'added', content: newText }];
    if (!newText) return [{ type: 'removed', content: oldText }];

    const oldChars = oldText.split('');
    const newChars = newText.split('');
    
    const maxLen = Math.max(oldChars.length, newChars.length);
    const minLen = Math.min(oldChars.length, newChars.length);
    
    const result: DiffSegment[] = [];
    let currentSegment: DiffSegment | null = null;

    const flushSegment = () => {
      if (currentSegment) {
        result.push(currentSegment);
        currentSegment = null;
      }
    };

    for (let i = 0; i < maxLen; i++) {
      const oldChar = oldChars[i];
      const newChar = newChars[i];

      if (i < minLen && oldChar === newChar) {
        if (!currentSegment || currentSegment.type !== 'unchanged') {
          flushSegment();
          currentSegment = { type: 'unchanged', content: '' };
        }
        currentSegment.content += oldChar;
      } else {
        if (oldChar !== undefined) {
          if (!currentSegment || currentSegment.type !== 'removed') {
            flushSegment();
            currentSegment = { type: 'removed', content: '' };
          }
          currentSegment.content += oldChar;
        }
        if (newChar !== undefined && oldChar !== newChar) {
          if (i >= minLen || oldChar === undefined) {
            if (!currentSegment || currentSegment.type !== 'added') {
              flushSegment();
              currentSegment = { type: 'added', content: '' };
            }
            currentSegment.content += newChar;
          }
        }
      }
    }

    flushSegment();
    return result;
  };

  const oldVersion = versions[oldVersionIndex];
  const newVersion = versions[newVersionIndex];

  const titleDiff = computeDiff(oldVersion.title || '', newVersion.title || '');
  const contentDiff = computeDiff(oldVersion.content || '', newVersion.content || '');
  
  const oldSummary = article.summary;
  const newSummary = article.summary;
  const summaryDiff = computeDiff(oldSummary, newSummary);

  const hasTitleChanges = titleDiff.some(s => s.type !== 'unchanged');
  const hasSummaryChanges = summaryDiff.some(s => s.type !== 'unchanged');
  const hasContentChanges = contentDiff.some(s => s.type !== 'unchanged');

  const handleOldVersionChange = (e) => {
    const index = parseInt(e.detail.value);
    if (index < newVersionIndex) {
      setOldVersionIndex(index);
    } else {
      Taro.showToast({ title: '旧版本必须早于新版本', icon: 'none' });
    }
  };

  const handleNewVersionChange = (e) => {
    const index = parseInt(e.detail.value);
    if (index > oldVersionIndex) {
      setNewVersionIndex(index);
    } else {
      Taro.showToast({ title: '新版本必须晚于旧版本', icon: 'none' });
    }
  };

  const renderDiffSegments = (segments: DiffSegment[]) => {
    return segments.map((segment, index) => (
      <Text
        key={index}
        className={classnames({
          [styles.diffText]: true,
          [styles.diffAdded]: segment.type === 'added',
          [styles.diffRemoved]: segment.type === 'removed',
          [styles.diffUnchanged]: segment.type === 'unchanged'
        })}
      >
        {segment.content}
      </Text>
    ));
  };

  return (
    <View className={styles.page}>
      <View className={styles.articleInfo}>
        <Text className={styles.articleTitle}>{article.title}</Text>
        <Text className={styles.articleMeta}>共 {versions.length} 个版本</Text>
      </View>

      <View className={styles.versionSelector}>
        <View className={styles.selectorRow}>
          <Text className={styles.selectorLabel}>旧版本</Text>
          <Picker 
            mode="selector" 
            range={versionOptions}
            value={oldVersionIndex}
            onChange={handleOldVersionChange}
          >
            <View className={styles.pickerValue}>
              <Text>{versionOptions[oldVersionIndex]}</Text>
              <Text className={styles.pickerArrow}>›</Text>
            </View>
          </Picker>
        </View>
        <View className={styles.vsDivider}>
          <Text className={styles.vsText}>VS</Text>
        </View>
        <View className={styles.selectorRow}>
          <Text className={styles.selectorLabel}>新版本</Text>
          <Picker 
            mode="selector" 
            range={versionOptions}
            value={newVersionIndex}
            onChange={handleNewVersionChange}
          >
            <View className={styles.pickerValue}>
              <Text>{versionOptions[newVersionIndex]}</Text>
              <Text className={styles.pickerArrow}>›</Text>
            </View>
          </Picker>
        </View>
      </View>

      <View className={styles.legend}>
        <View className={styles.legendItem}>
          <View className={classnames(styles.legendBox, styles.legendAdded)} />
          <Text className={styles.legendText}>新增</Text>
        </View>
        <View className={styles.legendItem}>
          <View className={classnames(styles.legendBox, styles.legendRemoved)} />
          <Text className={styles.legendText}>删除</Text>
        </View>
        <View className={styles.legendItem}>
          <View className={classnames(styles.legendBox, styles.legendUnchanged)} />
          <Text className={styles.legendText}>未变化</Text>
        </View>
      </View>

      <ScrollView className={styles.diffContent} scrollY>
        <View className={styles.diffSection}>
          <View className={styles.sectionHeader}>
            <Text className={styles.sectionTitle}>标题</Text>
            {!hasTitleChanges && <Text className={styles.sectionNoChange}>（无变化）</Text>}
          </View>
          <View className={styles.diffBox}>
            {renderDiffSegments(titleDiff)}
          </View>
        </View>

        <View className={styles.diffSection}>
          <View className={styles.sectionHeader}>
            <Text className={styles.sectionTitle}>摘要</Text>
            {!hasSummaryChanges && <Text className={styles.sectionNoChange}>（无变化）</Text>}
          </View>
          <View className={styles.diffBox}>
            {oldSummary ? renderDiffSegments(summaryDiff) : <Text className={styles.emptyText}>无摘要</Text>}
          </View>
        </View>

        <View className={styles.diffSection}>
          <View className={styles.sectionHeader}>
            <Text className={styles.sectionTitle}>正文</Text>
            {!hasContentChanges && <Text className={styles.sectionNoChange}>（无变化）</Text>}
          </View>
          <View className={styles.diffBox}>
            {renderDiffSegments(contentDiff)}
          </View>
        </View>

        <View className={styles.versionInfo}>
          <View className={styles.versionDetail}>
            <Text className={styles.versionLabel}>旧版本信息</Text>
            <Text className={styles.versionText}>版本号：{oldVersion.version}</Text>
            <Text className={styles.versionText}>操作人：{oldVersion.operator}</Text>
            <Text className={styles.versionText}>时间：{oldVersion.createdAt}</Text>
            {oldVersion.remark && <Text className={styles.versionText}>备注：{oldVersion.remark}</Text>}
          </View>
          <View className={styles.versionDetail}>
            <Text className={styles.versionLabel}>新版本信息</Text>
            <Text className={styles.versionText}>版本号：{newVersion.version}</Text>
            <Text className={styles.versionText}>操作人：{newVersion.operator}</Text>
            <Text className={styles.versionText}>时间：{newVersion.createdAt}</Text>
            {newVersion.remark && <Text className={styles.versionText}>备注：{newVersion.remark}</Text>}
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default VersionDiffPage;
