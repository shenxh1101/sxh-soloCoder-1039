export default defineAppConfig({
  pages: [
    'pages/article-list/index',
    'pages/editor/index',
    'pages/review/index',
    'pages/category/index',
    'pages/publish-record/index',
    'pages/article-detail/index',
    'pages/version-diff/index',
    'pages/image-picker/index'
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#FFFFFF',
    navigationBarTitleText: '内容管理',
    navigationBarTextStyle: 'black',
    backgroundColor: '#F7F8FA'
  },
  tabBar: {
    color: '#86909C',
    selectedColor: '#165DFF',
    backgroundColor: '#FFFFFF',
    borderStyle: 'white',
    list: [
      {
        pagePath: 'pages/article-list/index',
        text: '稿件',
        selectedIconPath: '',
        iconPath: ''
      },
      {
        pagePath: 'pages/editor/index',
        text: '编辑',
        selectedIconPath: '',
        iconPath: ''
      },
      {
        pagePath: 'pages/review/index',
        text: '审核',
        selectedIconPath: '',
        iconPath: ''
      },
      {
        pagePath: 'pages/category/index',
        text: '栏目',
        selectedIconPath: '',
        iconPath: ''
      },
      {
        pagePath: 'pages/publish-record/index',
        text: '记录',
        selectedIconPath: '',
        iconPath: ''
      }
    ]
  }
})
