import React from 'react';
import { View, Text } from '@tarojs/components';
import classnames from 'classnames';
import styles from './index.module.scss';

export interface StatusTagProps {
  status: 'draft' | 'pending' | 'published' | 'rejected' | 'approved' | 'offline' | 'failed';
  text?: string;
  size?: 'sm' | 'md';
}

const statusMap: Record<string, { text: string; className: string }> = {
  draft: { text: '草稿', className: 'draft' },
  pending: { text: '待审核', className: 'pending' },
  published: { text: '已发布', className: 'published' },
  rejected: { text: '已退回', className: 'rejected' },
  approved: { text: '已通过', className: 'approved' },
  offline: { text: '已下架', className: 'offline' },
  failed: { text: '发布失败', className: 'failed' }
};

const StatusTag: React.FC<StatusTagProps> = ({ status, text, size = 'md' }) => {
  const config = statusMap[status] || { text: status, className: 'default' };
  
  return (
    <View className={classnames(
      styles.tag,
      styles[config.className],
      size === 'sm' && styles.sm
    )}>
      <Text className={styles.text}>{text || config.text}</Text>
    </View>
  );
};

export default StatusTag;
