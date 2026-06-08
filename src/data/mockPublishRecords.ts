import { PublishRecord, PublishStats, UnpublishedArticle } from '@/types/publish';

export const mockPublishRecords: PublishRecord[] = [
  {
    id: 'p1',
    articleId: '1',
    articleTitle: '2024年新媒体运营趋势分析报告',
    articleCover: 'https://picsum.photos/id/1/750/500',
    categoryName: '行业分析',
    publishTime: '2024-06-01 15:00:00',
    views: 12580,
    shares: 3420,
    comments: 156,
    status: 'published',
    operator: '李总编',
    isAbnormal: false
  },
  {
    id: 'p2',
    articleId: '8',
    articleTitle: '抖音算法推荐机制深度解析',
    articleCover: 'https://picsum.photos/id/8/750/500',
    categoryName: '行业分析',
    publishTime: '2024-05-25 16:00:00',
    views: 15680,
    shares: 4520,
    comments: 234,
    status: 'published',
    operator: '张主管',
    isAbnormal: false
  },
  {
    id: 'p3',
    articleId: '6',
    articleTitle: '小红书内容运营从入门到精通',
    articleCover: 'https://picsum.photos/id/160/750/500',
    categoryName: '运营技巧',
    publishTime: '2024-05-29 10:00:00',
    views: 8920,
    shares: 2150,
    comments: 89,
    status: 'published',
    operator: '王副主编',
    isAbnormal: false
  },
  {
    id: 'p4',
    articleId: '10',
    articleTitle: 'AIGC在内容创作中的应用探索',
    articleCover: 'https://picsum.photos/id/11/750/500',
    categoryName: '行业分析',
    publishTime: '2024-05-20 13:00:00',
    views: 23450,
    shares: 6780,
    comments: 456,
    status: 'published',
    operator: '李总编',
    isAbnormal: false
  },
  {
    id: 'p5',
    articleId: 'demo1',
    articleTitle: '2024年营销日历完整版',
    articleCover: 'https://picsum.photos/id/225/750/500',
    categoryName: '运营技巧',
    publishTime: '2024-01-10 09:00:00',
    views: 45230,
    shares: 12340,
    comments: 567,
    status: 'offline',
    operator: '张主管',
    isAbnormal: true,
    abnormalReason: '内容包含过时信息，已被系统自动下架'
  },
  {
    id: 'p6',
    articleId: 'demo2',
    articleTitle: '某平台运营策略深度解析',
    articleCover: 'https://picsum.photos/id/230/750/500',
    categoryName: '案例研究',
    publishTime: '2024-03-15 14:00:00',
    views: 0,
    shares: 0,
    comments: 0,
    status: 'failed',
    operator: '王芳',
    isAbnormal: true,
    abnormalReason: '发布失败：内容涉嫌违规，请修改后重新发布'
  },
  {
    id: 'p7',
    articleId: 'demo3',
    articleTitle: '短视频剪辑技巧100招',
    articleCover: 'https://picsum.photos/id/250/750/500',
    categoryName: '内容创作',
    publishTime: '2024-04-20 11:30:00',
    views: 6780,
    shares: 1890,
    comments: 78,
    status: 'published',
    operator: '李华',
    isAbnormal: false
  },
  {
    id: 'p8',
    articleId: 'demo4',
    articleTitle: '直播电商合规指南',
    articleCover: 'https://picsum.photos/id/582/750/500',
    categoryName: '政策法规',
    publishTime: '2024-05-10 08:00:00',
    views: 3450,
    shares: 920,
    comments: 45,
    status: 'published',
    operator: '张主管',
    isAbnormal: false
  },
  {
    id: 'p9',
    articleId: 'demo5',
    articleTitle: '公众号排版美学指南',
    articleCover: 'https://picsum.photos/id/598/750/500',
    categoryName: '内容创作',
    publishTime: '2024-06-03 16:00:00',
    views: 2180,
    shares: 650,
    comments: 32,
    status: 'published',
    operator: '周婷',
    isAbnormal: false
  },
  {
    id: 'p10',
    articleId: 'demo6',
    articleTitle: '社交媒体危机公关处理',
    articleCover: 'https://picsum.photos/id/431/750/500',
    categoryName: '案例研究',
    publishTime: '2024-06-05 10:00:00',
    views: 1560,
    shares: 420,
    comments: 28,
    status: 'published',
    operator: '吴磊',
    isAbnormal: false
  }
];

export const mockPublishStats: PublishStats = {
  totalPublished: 156,
  totalViews: 245680,
  totalShares: 67890,
  totalComments: 3456,
  todayPublished: 3,
  abnormalCount: 2,
  unpublishedCount: 5
};

export const mockUnpublishedArticles: UnpublishedArticle[] = [
  {
    id: '4',
    title: '短视频脚本撰写完全指南',
    status: 'draft',
    updatedAt: '2024-06-08 18:00:00'
  },
  {
    id: '5',
    title: '直播带货话术技巧大揭秘',
    status: 'draft',
    updatedAt: '2024-06-07 12:15:00'
  },
  {
    id: '9',
    title: '品牌内容营销案例分析',
    status: 'draft',
    updatedAt: '2024-06-09 14:00:00'
  },
  {
    id: '2',
    title: '如何打造10万+爆款文章：实战技巧分享',
    status: 'pending',
    updatedAt: '2024-06-05 16:45:00'
  },
  {
    id: '3',
    title: '微信公众号改版后的运营策略调整',
    status: 'rejected',
    updatedAt: '2024-06-09 10:30:00'
  }
];
