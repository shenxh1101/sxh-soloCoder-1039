import { Category } from '@/types/category';

export const mockCategories: Category[] = [
  {
    id: '1',
    name: '行业分析',
    description: '新媒体行业动态、趋势分析、数据报告',
    sort: 1,
    articleCount: 45,
    isRecommended: true,
    topArticleIds: ['1', '8'],
    createdAt: '2024-01-01 00:00:00',
    updatedAt: '2024-06-01 10:00:00'
  },
  {
    id: '2',
    name: '运营技巧',
    description: '平台运营、用户增长、数据分析技巧',
    sort: 2,
    articleCount: 68,
    isRecommended: true,
    topArticleIds: ['6'],
    createdAt: '2024-01-01 00:00:00',
    updatedAt: '2024-06-02 14:30:00'
  },
  {
    id: '3',
    name: '内容创作',
    description: '文案写作、视频脚本、设计灵感',
    sort: 3,
    articleCount: 52,
    isRecommended: true,
    topArticleIds: [],
    createdAt: '2024-01-01 00:00:00',
    updatedAt: '2024-06-03 09:00:00'
  },
  {
    id: '4',
    name: '案例研究',
    description: '成功案例分析、失败案例复盘',
    sort: 4,
    articleCount: 36,
    isRecommended: false,
    topArticleIds: [],
    createdAt: '2024-01-15 00:00:00',
    updatedAt: '2024-05-20 16:00:00'
  },
  {
    id: '5',
    name: '工具推荐',
    description: '好用的新媒体工具、效率软件推荐',
    sort: 5,
    articleCount: 28,
    isRecommended: false,
    topArticleIds: [],
    createdAt: '2024-02-01 00:00:00',
    updatedAt: '2024-05-15 11:00:00'
  },
  {
    id: '6',
    name: '政策法规',
    description: '互联网政策、广告法规、合规指南',
    sort: 6,
    articleCount: 15,
    isRecommended: false,
    topArticleIds: [],
    createdAt: '2024-02-15 00:00:00',
    updatedAt: '2024-04-10 08:00:00'
  }
];
