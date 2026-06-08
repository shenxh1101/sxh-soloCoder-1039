import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, ScrollView, Picker } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';
import classnames from 'classnames';
import { useAppStore } from '@/store';
import { ArticleVersion } from '@/types/article';
import styles from './index.module.scss';

type DiffType = 'unchanged' | 'added' | 'removed' | 'modified';

interface DiffSegment {
  type: DiffType;
  oldContent: string;
  newContent: string;
}

interface DiffBlock {
  type: DiffType;
  segments: DiffSegment[];
  label?: string;
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
  const versionCount = versions.length;

  if (versionCount === 0) {
    return (
      <View className={styles.page}>
        <View className={styles.emptyState}>
          <Text className={styles.emptyIcon}>📊</Text>
          <Text className={styles.emptyTitle}>暂无历史版本</Text>
          <Text className={styles.emptyDesc}>
            该文章还没有保存过历史版本。
            {"\n"}
            保存草稿或提交审核后会自动生成版本记录。
          </Text>
        </View>
      </View>
    );
  }

  if (versionCount === 1) {
    return (
      <View className={styles.page}>
        <View className={styles.emptyState}>
          <Text className={styles.emptyIcon}>📊</Text>
          <Text className={styles.emptyTitle}>暂时无法对比</Text>
          <Text className={styles.emptyDesc}>
            该文章目前只有 {versionCount} 个版本，无法进行版本对比。
            {"\n"}
            当文章有 2 个及以上版本时，您可以在此处查看不同版本的差异。
          </Text>
        </View>
      </View>
    );
  }

  const versionOptions = versions.map((v, i) => `版本 ${v.version} (${v.createdAt.slice(5, 16)})`);

  const findCommonSubstrings = (s1: string, s2: string): string[] => {
    const common: string[] = [];
    const minLen = Math.min(s1.length, s2.length);
    
    let i = 0;
    while (i < minLen) {
      let maxLen = 0;
      let maxI = i;
      let maxJ = 0;
      
      for (let j = 0; j < s2.length; j++) {
        let len = 0;
        while (i + len < s1.length && j + len < s2.length && s1[i + len] === s2[j + len]) {
          len++;
        }
        if (len > maxLen) {
          maxLen = len;
          maxI = i;
          maxJ = j;
        }
      }
      
      if (maxLen >= 2) {
        if (maxI > i) {
          common.push('');
        }
        common.push(s1.substr(maxI, maxLen));
        i = maxI + maxLen;
      } else {
        i++;
      }
    }
    
    return common.filter(s => s.length > 0);
  };

  const computeSmartDiff = (oldText: string, newText: string): DiffSegment[] => {
    if (!oldText && !newText) return [];
    if (!oldText) return [{ type: 'added', oldContent: '', newContent: newText }];
    if (!newText) return [{ type: 'removed', oldContent: oldText, newContent: '' }];
    if (oldText === newText) return [{ type: 'unchanged', oldContent, newContent }];

    const commonParts = findCommonSubstrings(oldText, newText);
    
    if (commonParts.length === 0) {
      return [
        { type: 'removed', oldContent: oldText, newContent: '' },
        { type: 'added', oldContent: '', newContent: newText }
      ];
    }

    const segments: DiffSegment[] = [];
    let oldPos = 0;
    let newPos = 0;
    let commonIndex = 0;

    const addModifiedSegment = (oldPart: string, newPart: string) => {
      if (oldPart || newPart) {
        segments.push({
          type: 'modified',
          oldContent: oldPart,
          newContent: newPart
        });
      }
    };

    while (commonIndex < commonParts.length) {
      const common = commonParts[commonIndex];
      const oldCommonPos = oldText.indexOf(common, oldPos);
      const newCommonPos = newText.indexOf(common, newPos);

      if (oldCommonPos > oldPos || newCommonPos > newPos) {
        const oldDiff = oldText.substring(oldPos, oldCommonPos);
        const newDiff = newText.substring(newPos, newCommonPos);
        addModifiedSegment(oldDiff, newDiff);
      }

      segments.push({
        type: 'unchanged',
        oldContent: common,
        newContent: common
      });

      oldPos = oldCommonPos + common.length;
      newPos = newCommonPos + common.length;
      commonIndex++;
    }

    if (oldPos < oldText.length || newPos < newText.length) {
      const oldDiff = oldText.substring(oldPos);
      const newDiff = newText.substring(newPos);
      addModifiedSegment(oldDiff, newDiff);
    }

    return segments;
  };

  const splitIntoBlocks = (oldText: string, newText: string): DiffBlock[] => {
    const oldLines = oldText.split('\n');
    const newLines = newText.split('\n');
    const blocks: DiffBlock[] = [];
    
    const maxLines = Math.max(oldLines.length, newLines.length);
    
    let i = 0;
    while (i < maxLines) {
      const oldLine = oldLines[i] || '';
      const newLine = newLines[i] || '';
      
      if (oldLine === newLine) {
        const unchangedSegments: DiffSegment[] = [];
        while (i < maxLines && oldLines[i] === newLines[i]) {
          unchangedSegments.push({
            type: 'unchanged',
            oldContent: oldLines[i] || '',
            newContent: newLines[i] || ''
          });
          i++;
        }
        blocks.push({ type: 'unchanged', segments: unchangedSegments });
      } else {
        const modifiedSegments: DiffSegment[] = [];
        let blockOld = '';
        let blockNew = '';
        
        while (i < maxLines && oldLines[i] !== newLines[i]) {
          if (blockOld) blockOld += '\n';
          if (blockNew) blockNew += '\n';
          blockOld += oldLines[i] || '';
          blockNew += newLines[i] || '';
          i++;
        }
        
        const segments = computeSmartDiff(blockOld, blockNew);
        blocks.push({ 
          type: 'modified', 
          segments,
          label: '修改段落'
        });
      }
    }
    
    return blocks;
  };

  const oldVersion = versions[oldVersionIndex];
  const newVersion = versions[newVersionIndex];

  const titleDiff = useMemo(() => 
    computeSmartDiff(oldVersion.title || '', newVersion.title || ''),
    [oldVersion, newVersion]
  );
  
  const summaryDiff = useMemo(() => 
    computeSmartDiff(oldVersion.summary || '', newVersion.summary || ''),
    [oldVersion, newVersion]
  );
  
  const contentBlocks = useMemo(() => 
    splitIntoBlocks(oldVersion.content || '', newVersion.content || ''),
    [oldVersion, newVersion]
  );

  const hasTitleChanges = titleDiff.some(s => s.type !== 'unchanged');
  const hasSummaryChanges = summaryDiff.some(s => s.type !== 'unchanged');
  const hasContentChanges = contentBlocks.some(b => b.type !== 'unchanged');

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

  const renderDiffSegments = (segments: DiffSegment[], showInline: boolean = true) => {
    return segments.map((segment, index) => {
      if (segment.type === 'unchanged') {
        return (
          <Text key={index} className={styles.diffUnchanged}>
            {segment.newContent}
          </Text>
        );
      }
      
      if (segment.type === 'removed') {
        return (
          <Text key={index} className={styles.diffRemoved}>
            {segment.oldContent}
          </Text>
        );
      }
      
      if (segment.type === 'added') {
        return (
          <Text key={index} className={styles.diffAdded}>
            {segment.newContent}
          </Text>
        );
      }
      
      if (segment.type === 'modified') {
        if (showInline) {
          return (
            <View key={index} className={styles.modifiedInline}>
              {segment.oldContent && (
                <View className={styles.modifiedOldRow}>
                  <Text className={styles.modifiedLabel}>旧</Text>
                  <Text className={styles.diffRemoved}>{segment.oldContent}</Text>
                </View>
              )}
              {segment.newContent && (
                <View className={styles.modifiedNewRow}>
                  <Text className={styles.modifiedLabel}>新</Text>
                  <Text className={styles.diffAdded}>{segment.newContent}</Text>
                </View>
              )}
            </View>
          );
        } else {
          return (
            <View key={index} className={styles.modifiedBlock}>
              {segment.oldContent && (
                <View className={styles.modifiedOld}>
                  <Text className={styles.blockLabel}>删除内容</Text>
                  <Text className={styles.diffRemoved}>{segment.oldContent}</Text>
                </View>
              )}
              {segment.newContent && (
                <View className={styles.modifiedNew}>
                  <Text className={styles.blockLabel}>新增内容</Text>
                  <Text className={styles.diffAdded}>{segment.newContent}</Text>
                </View>
              )}
            </View>
          );
        }
      }
      
      return null;
    });
  };

  const renderContentBlocks = () => {
    return contentBlocks.map((block, blockIndex) => {
      if (block.type === 'unchanged') {
        return (
          <View key={blockIndex} className={styles.unchangedBlock}>
            {block.segments.map((seg, segIndex) => (
              <Text key={segIndex} className={styles.diffUnchanged}>
                {seg.newContent}
                {segIndex < block.segments.length - 1 ? '\n' : ''}
              </Text>
            ))}
          </View>
        );
      }
      
      if (block.type === 'modified') {
        return (
          <View key={blockIndex} className={styles.modifiedSection}>
            {block.label && (
              <View className={styles.sectionBadge}>
                <Text className={styles.badgeText}>{block.label}</Text>
              </View>
            )}
            <View className={styles.modifiedContent}>
              {renderDiffSegments(block.segments, false)}
            </View>
          </View>
        );
      }
      
      return null;
    });
  };

  return (
    <View className={styles.page}>
      <View className={styles.articleInfo}>
        <Text className={styles.articleTitle}>{article.title}</Text>
        <Text className={styles.articleMeta}>共 {versionCount} 个历史版本</Text>
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
          <View className={classnames(styles.legendBox, styles.legendModified)} />
          <Text className={styles.legendText}>修改</Text>
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
            {renderDiffSegments(titleDiff, true)}
          </View>
        </View>

        <View className={styles.diffSection}>
          <View className={styles.sectionHeader}>
            <Text className={styles.sectionTitle}>摘要</Text>
            {!hasSummaryChanges && <Text className={styles.sectionNoChange}>（无变化）</Text>}
          </View>
          <View className={styles.diffBox}>
            {(oldVersion.summary || newVersion.summary) 
              ? renderDiffSegments(summaryDiff, true)
              : <Text className={styles.emptyText}>无摘要</Text>
            }
          </View>
        </View>

        <View className={styles.diffSection}>
          <View className={styles.sectionHeader}>
            <Text className={styles.sectionTitle}>正文</Text>
            {!hasContentChanges && <Text className={styles.sectionNoChange}>（无变化）</Text>}
          </View>
          <View className={styles.diffBox}>
            {renderContentBlocks()}
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
