import { ReviewRecord } from '@/types/review';

export const mockReviews: ReviewRecord[] = [
  {
    id: 'r1',
    articleId: '2',
    articleTitle: '如何打造10万+爆款文章：实战技巧分享',
    articleCover: 'https://picsum.photos/id/3/750/500',
    status: 'pending',
    submitter: '李华',
    submitTime: '2024-06-05 16:45:00',
    version: 1
  },
  {
    id: 'r2',
    articleId: '7',
    articleTitle: '私域流量运营实战手册',
    articleCover: 'https://picsum.photos/id/201/750/500',
    status: 'pending',
    submitter: '吴磊',
    submitTime: '2024-06-08 18:30:00',
    version: 1
  },
  {
    id: 'r3',
    articleId: '3',
    articleTitle: '微信公众号改版后的运营策略调整',
    articleCover: 'https://picsum.photos/id/6/750/500',
    status: 'rejected',
    submitter: '王芳',
    submitTime: '2024-06-08 11:30:00',
    reviewer: '张主管',
    reviewTime: '2024-06-08 17:00:00',
    reviewComment: '内容分析不够深入，缺少具体数据支撑；建议补充2024年最新的运营案例。另外，第3部分的策略建议过于笼统，请细化到可执行的操作步骤。',
    version: 2
  },
  {
    id: 'r4',
    articleId: '1',
    articleTitle: '2024年新媒体运营趋势分析报告',
    articleCover: 'https://picsum.photos/id/1/750/500',
    status: 'approved',
    submitter: '张明',
    submitTime: '2024-06-01 14:20:00',
    reviewer: '李总编',
    reviewTime: '2024-06-01 14:50:00',
    reviewComment: '数据详实，分析到位，建议发布后作为重点推荐内容。',
    version: 1
  },
  {
    id: 'r5',
    articleId: '8',
    articleTitle: '抖音算法推荐机制深度解析',
    articleCover: 'https://picsum.photos/id/8/750/500',
    status: 'approved',
    submitter: '郑凯',
    submitTime: '2024-05-25 15:40:00',
    reviewer: '张主管',
    reviewTime: '2024-05-25 15:55:00',
    reviewComment: '内容专业，逻辑清晰，符合发布标准。',
    version: 1
  },
  {
    id: 'r6',
    articleId: '6',
    articleTitle: '小红书内容运营从入门到精通',
    articleCover: 'https://picsum.photos/id/160/750/500',
    status: 'approved',
    submitter: '周婷',
    submitTime: '2024-05-29 09:30:00',
    reviewer: '王副主编',
    reviewTime: '2024-05-29 09:50:00',
    reviewComment: '实用性强，适合新手阅读，同意发布。',
    version: 1
  },
  {
    id: 'r7',
    articleId: '10',
    articleTitle: 'AIGC在内容创作中的应用探索',
    articleCover: 'https://picsum.photos/id/11/750/500',
    status: 'approved',
    submitter: '刘洋',
    submitTime: '2024-05-20 12:30:00',
    reviewer: '李总编',
    reviewTime: '2024-05-20 12:55:00',
    reviewComment: '前沿话题，观点新颖，建议头条推荐。',
    version: 1
  }
];
