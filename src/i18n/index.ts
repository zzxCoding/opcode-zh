import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// 导入语言包
import en from './locales/en.json';
import zh from './locales/zh.json';

const resources = {
  en: {
    translation: en
  },
  zh: {
    translation: zh
  }
};

// 尝试从localStorage获取保存的语言偏好
const getSavedLanguage = () => {
  try {
    const saved = localStorage.getItem('language_preference');
    if (saved === 'en' || saved === 'zh') {
      return saved;
    }
  } catch (e) {
    // 忽略localStorage错误
  }
  
  // 尝试从浏览器语言设置中获取
  const browserLang = navigator.language.toLowerCase();
  if (browserLang.startsWith('zh')) {
    return 'zh';
  }
  
  return 'en'; // 默认英语
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: getSavedLanguage(), // 从保存的偏好或浏览器语言获取
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false // React已经处理了XSS
    }
  });

export default i18n;