import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, Input, Textarea, Button, Image, Switch, Picker } from '@tarojs/components';
import Taro, { useDidShow, useDidHide } from '@tarojs/taro';
import classnames from 'classnames';
import { CreateArticleForm, Article, ArticleStatus, ArticleVersion } from '@/types/article';
import { ReviewRecord, ReviewStatus } from '@/types/review';
import { useAppStore } from '@/store';
import styles from './index.module.scss';

const EditorPage: React.FC = () => {
  const { 
    articles, 
    categories, 
    currentEditingArticleId, 
    setCurrentEditingArticleId,
    addArticle, 
    updateArticle,
    submitArticleForReview
  } = useAppStore();

  const [form, setForm] = useState<CreateArticleForm>({
    title: '',
    summary: '',
    content: '',
    coverImage: '',
    images: [],
    tags: [],
    categoryId: '',
    scheduledPublishTime: ''
  });
  
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);
  const [enableSchedule, setEnableSchedule] = useState(false);
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTime, setScheduleTime] = useState('');
  const [newTag, setNewTag] = useState('');
  const [categoryName, setCategoryName] = useState('请选择栏目');

  const categoryRange = categories.map(c => c.name);

  const loadEditingArticle = useCallback(() => {
    if (!currentEditingArticleId) {
      console.log('[Editor] 新建稿件，清空表单');
      setEditingArticle(null);
      resetForm();
      return;
    }

    const article = articles.find(a => a.id === currentEditingArticleId);
    if (!article) {
      console.log('[Editor] 未找到文章:', currentEditingArticleId);
      setCurrentEditingArticleId(null);
      resetForm();
      return;
    }

    console.log('[Editor] 加载文章:', article.id, article.title);
    setEditingArticle(article);
    setForm({
      title: article.title,
      summary: article.summary,
      content: article.content,
      coverImage: article.coverImage,
      images: article.images,
      tags: article.tags,
      categoryId: article.categoryId,
      scheduledPublishTime: article.scheduledPublishTime || ''
    });

    const category = categories.find(c => c.id === article.categoryId);
    if (category) {
      setCategoryName(category.name);
    }

    if (article.scheduledPublishTime) {
      setEnableSchedule(true);
      const [date, time] = article.scheduledPublishTime.split(' ');
      setScheduleDate(date);
      setScheduleTime(time.slice(0, 5));
    }
  }, [currentEditingArticleId, articles, categories, setCurrentEditingArticleId]);

  const resetForm = () => {
    setForm({
      title: '',
      summary: '',
      content: '',
      coverImage: '',
      images: [],
      tags: [],
      categoryId: '',
      scheduledPublishTime: ''
    });
    setEditingArticle(null);
    setEnableSchedule(false);
    setScheduleDate('');
    setScheduleTime('');
    setNewTag('');
    setCategoryName('请选择栏目');
  };

  useDidShow(() => {
    console.log('[Editor] 页面显示');
    loadEditingArticle();
  });

  useDidHide(() => {
    console.log('[Editor] 页面隐藏');
  });

  useEffect(() => {
    console.log('[Editor] 页面初始化');
  }, []);

  const handleTitleChange = (e) => {
    const value = e.detail.value;
    if (value.length <= 50) {
      setForm(prev => ({ ...prev, title: value }));
    }
  };

  const handleSummaryChange = (e) => {
    const value = e.detail.value;
    if (value.length <= 200) {
      setForm(prev => ({ ...prev, summary: value }));
    }
  };

  const handleContentChange = (e) => {
    setForm(prev => ({ ...prev, content: e.detail.value }));
  };

  const handleChooseCover = () => {
    console.log('[Editor] 选择封面');
    Taro.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const coverUrl = res.tempFilePaths[0] || `https://picsum.photos/id/${Math.floor(Math.random() * 100)}/750/500`;
        setForm(prev => ({ ...prev, coverImage: coverUrl }));
        console.log('[Editor] 封面已设置:', coverUrl);
      },
      fail: (err) => {
        console.error('[Editor] 选择封面失败:', err);
        const mockCover = `https://picsum.photos/id/${Math.floor(Math.random() * 100)}/750/500`;
        setForm(prev => ({ ...prev, coverImage: mockCover }));
      }
    });
  };

  const handleAddImage = () => {
    console.log('[Editor] 添加图片');
    Taro.chooseImage({
      count: 9,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const newImages = res.tempFilePaths || 
          [`https://picsum.photos/id/${Math.floor(Math.random() * 100)}/750/500`];
        setForm(prev => ({ 
          ...prev, 
          images: [...prev.images, ...newImages].slice(0, 9) 
        }));
        console.log('[Editor] 已添加图片:', newImages.length, '张');
      },
      fail: (err) => {
        console.error('[Editor] 添加图片失败:', err);
        const mockImage = `https://picsum.photos/id/${Math.floor(Math.random() * 100)}/750/500`;
        setForm(prev => ({ ...prev, images: [...prev.images, mockImage] }));
      }
    });
  };

  const handleDeleteImage = (index: number) => {
    console.log('[Editor] 删除图片:', index);
    setForm(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleAddTag = () => {
    const tag = newTag.trim();
    if (tag && !form.tags.includes(tag) && form.tags.length < 10) {
      setForm(prev => ({ ...prev, tags: [...prev.tags, tag] }));
      setNewTag('');
      console.log('[Editor] 添加标签:', tag);
    }
  };

  const handleDeleteTag = (tag: string) => {
    console.log('[Editor] 删除标签:', tag);
    setForm(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag)
    }));
  };

  const handleTagInput = (e) => {
    setNewTag(e.detail.value);
  };

  const handleTagConfirm = () => {
    handleAddTag();
  };

  const handleCategoryChange = (e) => {
    const index = parseInt(e.detail.value);
    const category = categories[index];
    setForm(prev => ({ ...prev, categoryId: category.id }));
    setCategoryName(category.name);
    console.log('[Editor] 选择栏目:', category.name);
  };

  const handleScheduleToggle = (e) => {
    const checked = e.detail.value;
    setEnableSchedule(checked);
    if (!checked) {
      setForm(prev => ({ ...prev, scheduledPublishTime: '' }));
      setScheduleDate('');
      setScheduleTime('');
    }
    console.log('[Editor] 定时发布:', checked);
  };

  const handleDateChange = (e) => {
    const date = e.detail.value;
    setScheduleDate(date);
    updateScheduleTime(date, scheduleTime);
  };

  const handleTimeChange = (e) => {
    const time = e.detail.value;
    setScheduleTime(time);
    updateScheduleTime(scheduleDate, time);
  };

  const updateScheduleTime = (date: string, time: string) => {
    if (date && time) {
      const datetime = `${date} ${time}:00`;
      setForm(prev => ({ ...prev, scheduledPublishTime: datetime }));
      console.log('[Editor] 定时发布时间:', datetime);
    }
  };

  const createArticleFromForm = (status: ArticleStatus): Article => {
    const now = new Date().toISOString().replace('T', ' ').slice(0, 19);
    const initialVersion: ArticleVersion = {
      id: `v${Date.now()}`,
      version: (editingArticle?.versions.length || 0) + 1,
      title: form.title,
      summary: form.summary,
      content: form.content,
      createdAt: now,
      operator: '当前用户',
      remark: status === 'draft' ? '保存草稿' : '提交审核'
    };

    return {
      id: editingArticle?.id || `a${Date.now()}`,
      title: form.title,
      summary: form.summary,
      content: form.content,
      coverImage: form.coverImage,
      images: form.images,
      tags: form.tags,
      categoryId: form.categoryId,
      categoryName: categories.find(c => c.id === form.categoryId)?.name || '',
      status,
      author: '当前用户',
      views: editingArticle?.views || 0,
      shares: editingArticle?.shares || 0,
      comments: editingArticle?.comments || 0,
      scheduledPublishTime: form.scheduledPublishTime,
      createdAt: editingArticle?.createdAt || now,
      updatedAt: now,
      publishedAt: editingArticle?.publishedAt,
      versions: editingArticle ? [...editingArticle.versions, initialVersion] : [initialVersion],
      isTop: editingArticle?.isTop || false
    };
  };

  const createReviewRecord = (article: Article): ReviewRecord => {
    const now = new Date().toISOString().replace('T', ' ').slice(0, 19);
    return {
      id: `r${Date.now()}`,
      articleId: article.id,
      articleTitle: article.title,
      articleCover: article.coverImage,
      submitter: article.author,
      submitTime: now,
      version: article.versions.length,
      status: 'pending' as ReviewStatus,
      reviewer: undefined,
      reviewTime: undefined,
      reviewComment: undefined
    };
  };

  const handleSaveDraft = () => {
    console.log('[Editor] 保存草稿');
    if (!form.title.trim()) {
      Taro.showToast({ title: '请输入文章标题', icon: 'none' });
      return;
    }
    
    Taro.showLoading({ title: '保存中...' });
    
    setTimeout(() => {
      try {
        const article = createArticleFromForm('draft');
        
        if (editingArticle) {
          console.log('[Editor] 更新现有草稿:', article.id);
          updateArticle(article.id, article);
        } else {
          console.log('[Editor] 创建新草稿:', article.id);
          addArticle(article);
        }
        
        Taro.hideLoading();
        Taro.showToast({ title: '草稿已保存', icon: 'success' });
        console.log('[Editor] 草稿保存成功', article);
        
        setTimeout(() => {
          setCurrentEditingArticleId(null);
          Taro.switchTab({ url: '/pages/article-list/index' });
        }, 1000);
      } catch (error) {
        console.error('[Editor] 保存失败:', error);
        Taro.hideLoading();
        Taro.showToast({ title: '保存失败，请重试', icon: 'none' });
      }
    }, 500);
  };

  const handleSubmitReview = () => {
    console.log('[Editor] 提交审核');
    if (!form.title.trim()) {
      Taro.showToast({ title: '请输入文章标题', icon: 'none' });
      return;
    }
    if (!form.summary.trim()) {
      Taro.showToast({ title: '请输入文章摘要', icon: 'none' });
      return;
    }
    if (!form.content.trim()) {
      Taro.showToast({ title: '请输入文章内容', icon: 'none' });
      return;
    }
    if (!form.coverImage) {
      Taro.showToast({ title: '请设置文章封面', icon: 'none' });
      return;
    }
    if (!form.categoryId) {
      Taro.showToast({ title: '请选择所属栏目', icon: 'none' });
      return;
    }
    
    Taro.showModal({
      title: '确认提交',
      content: '提交后将进入审核流程，确定提交吗？',
      success: (res) => {
        if (res.confirm) {
          Taro.showLoading({ title: '提交中...' });
          
          setTimeout(() => {
            try {
              const article = createArticleFromForm('pending');
              const review = createReviewRecord(article);
              
              console.log('[Editor] 提交审核:', article.id, article.title);
              submitArticleForReview(article, review);
              
              Taro.hideLoading();
              Taro.showToast({ title: '已提交审核', icon: 'success' });
              console.log('[Editor] 已提交审核', article);
              
              setTimeout(() => {
                setCurrentEditingArticleId(null);
                Taro.switchTab({ url: '/pages/review/index' });
              }, 1500);
            } catch (error) {
              console.error('[Editor] 提交失败:', error);
              Taro.hideLoading();
              Taro.showToast({ title: '提交失败，请重试', icon: 'none' });
            }
          }, 500);
        }
      }
    });
  };

  return (
    <View className={styles.page}>
      <View className={styles.form}>
        <View className={styles.section}>
          <Text className={styles.sectionTitle}>文章标题</Text>
          <Input
            className={styles.titleInput}
            placeholder="请输入文章标题"
            placeholderClass="placeholder"
            value={form.title}
            onInput={handleTitleChange}
            maxlength={50}
          />
          <Text className={styles.titleCount}>{form.title.length}/50</Text>
        </View>

        <View className={styles.section}>
          <Text className={styles.sectionTitle}>文章摘要</Text>
          <Textarea
            className={styles.summaryTextarea}
            placeholder="请输入文章摘要（建议100字以内）"
            placeholderClass="placeholder"
            value={form.summary}
            onInput={handleSummaryChange}
            maxlength={200}
            autoHeight
          />
          <View className={styles.countInfo}>
            <Text className={styles.hint}>好的摘要能提高文章点击率</Text>
            <Text>{form.summary.length}/200</Text>
          </View>
        </View>

        <View className={styles.section}>
          <Text className={styles.sectionTitle}>文章正文</Text>
          <Textarea
            className={styles.contentTextarea}
            placeholder="开始创作你的精彩内容..."
            placeholderClass="placeholder"
            value={form.content}
            onInput={handleContentChange}
            autoHeight
          />
        </View>

        <View className={styles.section}>
          <Text className={styles.sectionTitle}>设置封面</Text>
          <View className={styles.coverSection}>
            <View className={styles.coverPreview} onClick={handleChooseCover}>
              {form.coverImage ? (
                <>
                  <Image 
                    className={styles.coverImage} 
                    src={form.coverImage} 
                    mode="aspectFill" 
                  />
                  <View className={styles.coverChange}>
                    <Text className={styles.coverChangeText}>更换封面</Text>
                  </View>
                </>
              ) : (
                <View className={styles.coverPlaceholder}>
                  <Text className={styles.coverIcon}>📷</Text>
                  <Text className={styles.coverText}>点击设置封面</Text>
                </View>
              )}
            </View>
            <Text className={styles.hint}>建议尺寸：750×500像素，支持JPG、PNG格式</Text>
          </View>
        </View>

        <View className={styles.section}>
          <Text className={styles.sectionTitle}>正文图片（{form.images.length}/9）</Text>
          <View className={styles.imagesSection}>
            <View className={styles.imagesList}>
              {form.images.map((img, index) => (
                <View key={index} className={styles.imageItem}>
                  <Image className={styles.image} src={img} mode="aspectFill" />
                  <View 
                    className={styles.imageDelete}
                    onClick={() => handleDeleteImage(index)}
                  >
                    <Text className={styles.imageDeleteText}>×</Text>
                  </View>
                </View>
              ))}
              {form.images.length < 9 && (
                <Button className={styles.addImageBtn} onClick={handleAddImage}>
                  <Text className={styles.addImageIcon}>+</Text>
                  <Text className={styles.addImageText}>添加图片</Text>
                </Button>
              )}
            </View>
          </View>
        </View>

        <View className={styles.section}>
          <Text className={styles.sectionTitle}>话题标签（{form.tags.length}/10）</Text>
          <View className={styles.tagsSection}>
            {form.tags.length > 0 && (
              <View className={styles.tagsList}>
                {form.tags.map((tag, index) => (
                  <View key={index} className={styles.tagItem}>
                    <Text className={styles.tagText}>#{tag}</Text>
                    <Text 
                      className={styles.tagDelete}
                      onClick={() => handleDeleteTag(tag)}
                    >
                      ×
                    </Text>
                  </View>
                ))}
              </View>
            )}
            <View className={styles.tagInputRow}>
              <Input
                className={styles.tagInput}
                placeholder="输入标签，按回车添加"
                value={newTag}
                onInput={handleTagInput}
                onConfirm={handleTagConfirm}
                maxlength={20}
              />
              <Button 
                className={styles.addTagBtn}
                onClick={handleAddTag}
                disabled={!newTag.trim() || form.tags.length >= 10}
              >
                <Text className={styles.addTagText}>添加</Text>
              </Button>
            </View>
            <Text className={styles.hint}>标签有助于提高文章曝光率，多个标签用回车分隔</Text>
          </View>
        </View>

        <View className={styles.section}>
          <Text className={styles.sectionTitle}>发布设置</Text>
          
          <Picker 
            mode="selector" 
            range={categoryRange}
            onChange={handleCategoryChange}
          >
            <View className={styles.selectRow}>
              <Text className={styles.selectLabel}>所属栏目</Text>
              <View className={styles.selectValue}>
                <Text>{categoryName}</Text>
                <Text className={styles.selectArrow}>›</Text>
              </View>
            </View>
          </Picker>

          <View className={styles.switchRow}>
            <Text className={styles.switchLabel}>定时发布</Text>
            <Switch 
              checked={enableSchedule}
              onChange={handleScheduleToggle}
              color="#165DFF"
            />
          </View>

          {enableSchedule && (
            <>
              <Picker 
                mode="date" 
                value={scheduleDate}
                onChange={handleDateChange}
              >
                <View className={styles.selectRow}>
                  <Text className={styles.selectLabel}>发布日期</Text>
                  <View className={styles.selectValue}>
                    <Text>{scheduleDate || '请选择日期'}</Text>
                    <Text className={styles.selectArrow}>›</Text>
                  </View>
                </View>
              </Picker>
              
              <Picker 
                mode="time" 
                value={scheduleTime}
                onChange={handleTimeChange}
              >
                <View className={styles.selectRow}>
                  <Text className={styles.selectLabel}>发布时间</Text>
                  <View className={styles.selectValue}>
                    <Text>{scheduleTime || '请选择时间'}</Text>
                    <Text className={styles.selectArrow}>›</Text>
                  </View>
                </View>
              </Picker>
            </>
          )}
        </View>
      </View>

      <View className={styles.bottomBar}>
        <Button 
          className={classnames(styles.btn, styles.btnSecondary)}
          onClick={handleSaveDraft}
        >
          <Text className={styles.btnText}>保存草稿</Text>
        </Button>
        <Button 
          className={classnames(styles.btn, styles.btnPrimary)}
          onClick={handleSubmitReview}
        >
          <Text className={styles.btnTextPrimary}>提交审核</Text>
        </Button>
      </View>
    </View>
  );
};

export default EditorPage;
