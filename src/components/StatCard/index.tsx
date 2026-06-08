import React from 'react';
import { View, Text } from '@tarojs/components';
import classnames from 'classnames';
import styles from './index.module.scss';

export interface StatCardProps {
  title: string;
  value: string | number;
  unit?: string;
  trend?: number;
  type?: 'primary' | 'success' | 'warning' | 'error';
  onClick?: () => void;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  unit,
  trend,
  type = 'primary',
  onClick
}) => {
  const formatValue = (val: string | number) => {
    if (typeof val === 'number' && val >= 10000) {
      return (val / 10000).toFixed(1) + '万';
    }
    return val.toString();
  };

  const formatTrend = (trend: number) => {
    const sign = trend >= 0 ? '+' : '';
    return `${sign}${trend}%`;
  };

  return (
    <View 
      className={classnames(styles.card, styles[type])}
      onClick={onClick}
    >
      <Text className={styles.title}>{title}</Text>
      <View className={styles.valueRow}>
        <Text className={styles.value}>{formatValue(value)}</Text>
        {unit && <Text className={styles.unit}>{unit}</Text>}
      </View>
      {trend !== undefined && (
        <View className={classnames(styles.trend, trend >= 0 ? styles.up : styles.down)}>
          <Text className={styles.trendIcon}>{trend >= 0 ? '↑' : '↓'}</Text>
          <Text className={styles.trendText}>{formatTrend(trend)}</Text>
        </View>
      )}
    </View>
  );
};

export default StatCard;
