import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Language = 'en' | 'es' | 'fr' | 'de' | 'it' | 'pt' | 'ru' | 'zh' | 'ja' | 'ko';

interface ThemeContextType {
  darkMode: boolean;
  toggleDarkMode: () => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const translations: Record<Language, Record<string, string>> = {
  en: {
    'Categories': 'Categories',
    'Latest Products': 'Latest Products',
    'See All': 'See All',
    'Settings': 'Settings',
    'Profile': 'Profile',
    'Messages': 'Messages',
    'Notifications': 'Notifications',
    'Dark Mode': 'Dark Mode',
    'Language': 'Language',
    'Email Notifications': 'Email Notifications',
    'Phone Notifications': 'Phone Notifications',
    'Privacy & Security': 'Privacy & Security',
    'My Listings': 'My Listings',
    'Favorites': 'Favorites',
    'Home': 'Home',
    'Search': 'Search',
    'Sell': 'Sell',
    'Reels': 'Reels',
    'Hi sujatha! 👋': 'Hi sujatha! 👋',
    'Search products, sellers...': 'Search products, sellers...',
    'Items Sold': 'Items Sold',
    'Rating': 'Rating',
    'Reviews': 'Reviews',
    'Followers': 'Followers',
    'Following': 'Following',
    'Recent Activity': 'Recent Activity',
    'Account': 'Account'
  },
  es: {
    'Categories': 'Categorías',
    'Latest Products': 'Últimos Productos',
    'See All': 'Ver Todo',
    'Settings': 'Configuración',
    'Profile': 'Perfil',
    'Messages': 'Mensajes',
    'Notifications': 'Notificaciones',
    'Dark Mode': 'Modo Oscuro',
    'Language': 'Idioma',
    'Email Notifications': 'Notificaciones por Email',
    'Phone Notifications': 'Notificaciones por Teléfono',
    'Privacy & Security': 'Privacidad y Seguridad',
    'My Listings': 'Mis Anuncios',
    'Favorites': 'Favoritos',
    'Home': 'Inicio',
    'Search': 'Buscar',
    'Sell': 'Vender',
    'Reels': 'Reels',
    'Hi sujatha! 👋': '¡Hola sujatha! 👋',
    'Search products, sellers...': 'Buscar productos, vendedores...',
    'Items Sold': 'Artículos Vendidos',
    'Rating': 'Calificación',
    'Reviews': 'Reseñas',
    'Followers': 'Seguidores',
    'Following': 'Siguiendo',
    'Recent Activity': 'Actividad Reciente',
    'Account': 'Cuenta'
  },
  fr: {
    'Categories': 'Catégories',
    'Latest Products': 'Derniers Produits',
    'See All': 'Voir Tout',
    'Settings': 'Paramètres',
    'Profile': 'Profil',
    'Messages': 'Messages',
    'Notifications': 'Notifications',
    'Dark Mode': 'Mode Sombre',
    'Language': 'Langue',
    'Email Notifications': 'Notifications Email',
    'Phone Notifications': 'Notifications Téléphone',
    'Privacy & Security': 'Confidentialité et Sécurité',
    'My Listings': 'Mes Annonces',
    'Favorites': 'Favoris',
    'Home': 'Accueil',
    'Search': 'Rechercher',
    'Sell': 'Vendre',
    'Reels': 'Reels',
    'Hi sujatha! 👋': 'Salut sujatha! 👋',
    'Search products, sellers...': 'Rechercher produits, vendeurs...',
    'Items Sold': 'Articles Vendus',
    'Rating': 'Note',
    'Reviews': 'Avis',
    'Followers': 'Abonnés',
    'Following': 'Abonnements',
    'Recent Activity': 'Activité Récente',
    'Account': 'Compte'
  },
  de: {
    'Categories': 'Kategorien',
    'Latest Products': 'Neueste Produkte',
    'See All': 'Alle Anzeigen',
    'Settings': 'Einstellungen',
    'Profile': 'Profil',
    'Messages': 'Nachrichten',
    'Notifications': 'Benachrichtigungen',
    'Dark Mode': 'Dunkler Modus',
    'Language': 'Sprache',
    'Email Notifications': 'E-Mail-Benachrichtigungen',
    'Phone Notifications': 'Telefon-Benachrichtigungen',
    'Privacy & Security': 'Datenschutz und Sicherheit',
    'My Listings': 'Meine Anzeigen',
    'Favorites': 'Favoriten',
    'Home': 'Startseite',
    'Search': 'Suchen',
    'Sell': 'Verkaufen',
    'Reels': 'Reels',
    'Hi sujatha! 👋': 'Hallo sujatha! 👋',
    'Search products, sellers...': 'Produkte, Verkäufer suchen...',
    'Items Sold': 'Verkaufte Artikel',
    'Rating': 'Bewertung',
    'Reviews': 'Bewertungen',
    'Followers': 'Follower',
    'Following': 'Folge ich',
    'Recent Activity': 'Letzte Aktivität',
    'Account': 'Konto'
  },
  it: {
    'Categories': 'Categorie',
    'Latest Products': 'Ultimi Prodotti',
    'See All': 'Vedi Tutto',
    'Settings': 'Impostazioni',
    'Profile': 'Profilo',
    'Messages': 'Messaggi',
    'Notifications': 'Notifiche',
    'Dark Mode': 'Modalità Scura',
    'Language': 'Lingua',
    'Email Notifications': 'Notifiche Email',
    'Phone Notifications': 'Notifiche Telefono',
    'Privacy & Security': 'Privacy e Sicurezza',
    'My Listings': 'I Miei Annunci',
    'Favorites': 'Preferiti',
    'Home': 'Home',
    'Search': 'Cerca',
    'Sell': 'Vendi',
    'Reels': 'Reels',
    'Hi sujatha! 👋': 'Ciao sujatha! 👋',
    'Search products, sellers...': 'Cerca prodotti, venditori...',
    'Items Sold': 'Articoli Venduti',
    'Rating': 'Valutazione',
    'Reviews': 'Recensioni',
    'Followers': 'Follower',
    'Following': 'Seguiti',
    'Recent Activity': 'Attività Recente',
    'Account': 'Account'
  },
  pt: {
    'Categories': 'Categorias',
    'Latest Products': 'Últimos Produtos',
    'See All': 'Ver Tudo',
    'Settings': 'Configurações',
    'Profile': 'Perfil',
    'Messages': 'Mensagens',
    'Notifications': 'Notificações',
    'Dark Mode': 'Modo Escuro',
    'Language': 'Idioma',
    'Email Notifications': 'Notificações por Email',
    'Phone Notifications': 'Notificações por Telefone',
    'Privacy & Security': 'Privacidade e Segurança',
    'My Listings': 'Meus Anúncios',
    'Favorites': 'Favoritos',
    'Home': 'Início',
    'Search': 'Buscar',
    'Sell': 'Vender',
    'Reels': 'Reels',
    'Hi sujatha! 👋': 'Oi sujatha! 👋',
    'Search products, sellers...': 'Buscar produtos, vendedores...',
    'Items Sold': 'Itens Vendidos',
    'Rating': 'Avaliação',
    'Reviews': 'Avaliações',
    'Followers': 'Seguidores',
    'Following': 'Seguindo',
    'Recent Activity': 'Atividade Recente',
    'Account': 'Conta'
  },
  ru: {
    'Categories': 'Категории',
    'Latest Products': 'Последние Товары',
    'See All': 'Показать Все',
    'Settings': 'Настройки',
    'Profile': 'Профиль',
    'Messages': 'Сообщения',
    'Notifications': 'Уведомления',
    'Dark Mode': 'Тёмный Режим',
    'Language': 'Язык',
    'Email Notifications': 'Email Уведомления',
    'Phone Notifications': 'Телефонные Уведомления',
    'Privacy & Security': 'Конфиденциальность и Безопасность',
    'My Listings': 'Мои Объявления',
    'Favorites': 'Избранное',
    'Home': 'Главная',
    'Search': 'Поиск',
    'Sell': 'Продать',
    'Reels': 'Reels',
    'Hi sujatha! 👋': 'Привет sujatha! 👋',
    'Search products, sellers...': 'Поиск товаров, продавцов...',
    'Items Sold': 'Проданные Товары',
    'Rating': 'Рейтинг',
    'Reviews': 'Отзывы',
    'Followers': 'Подписчики',
    'Following': 'Подписки',
    'Recent Activity': 'Последняя Активность',
    'Account': 'Аккаунт'
  },
  zh: {
    'Categories': '分类',
    'Latest Products': '最新产品',
    'See All': '查看全部',
    'Settings': '设置',
    'Profile': '个人资料',
    'Messages': '消息',
    'Notifications': '通知',
    'Dark Mode': '深色模式',
    'Language': '语言',
    'Email Notifications': '邮件通知',
    'Phone Notifications': '电话通知',
    'Privacy & Security': '隐私与安全',
    'My Listings': '我的列表',
    'Favorites': '收藏',
    'Home': '首页',
    'Search': '搜索',
    'Sell': '出售',
    'Reels': 'Reels',
    'Hi sujatha! 👋': '你好 sujatha! 👋',
    'Search products, sellers...': '搜索产品，卖家...',
    'Items Sold': '已售商品',
    'Rating': '评分',
    'Reviews': '评论',
    'Followers': '粉丝',
    'Following': '关注',
    'Recent Activity': '最近活动',
    'Account': '账户'
  },
  ja: {
    'Categories': 'カテゴリー',
    'Latest Products': '最新商品',
    'See All': 'すべて見る',
    'Settings': '設定',
    'Profile': 'プロフィール',
    'Messages': 'メッセージ',
    'Notifications': '通知',
    'Dark Mode': 'ダークモード',
    'Language': '言語',
    'Email Notifications': 'メール通知',
    'Phone Notifications': '電話通知',
    'Privacy & Security': 'プライバシーとセキュリティ',
    'My Listings': 'マイリスト',
    'Favorites': 'お気に入り',
    'Home': 'ホーム',
    'Search': '検索',
    'Sell': '売る',
    'Reels': 'Reels',
    'Hi sujatha! 👋': 'こんにちは sujatha! 👋',
    'Search products, sellers...': '商品、売り手を検索...',
    'Items Sold': '販売済み商品',
    'Rating': '評価',
    'Reviews': 'レビュー',
    'Followers': 'フォロワー',
    'Following': 'フォロー中',
    'Recent Activity': '最近のアクティビティ',
    'Account': 'アカウント'
  },
  ko: {
    'Categories': '카테고리',
    'Latest Products': '최신 상품',
    'See All': '모두 보기',
    'Settings': '설정',
    'Profile': '프로필',
    'Messages': '메시지',
    'Notifications': '알림',
    'Dark Mode': '다크 모드',
    'Language': '언어',
    'Email Notifications': '이메일 알림',
    'Phone Notifications': '전화 알림',
    'Privacy & Security': '개인정보 및 보안',
    'My Listings': '내 목록',
    'Favorites': '즐겨찾기',
    'Home': '홈',
    'Search': '검색',
    'Sell': '판매',
    'Reels': 'Reels',
    'Hi sujatha! 👋': '안녕하세요 sujatha! 👋',
    'Search products, sellers...': '상품, 판매자 검색...',
    'Items Sold': '판매된 상품',
    'Rating': '평점',
    'Reviews': '리뷰',
    'Followers': '팔로워',
    'Following': '팔로잉',
    'Recent Activity': '최근 활동',
    'Account': '계정'
  }
};

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [darkMode, setDarkMode] = useState(false);
  const [language, setLanguage] = useState<Language>('en');

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <ThemeContext.Provider value={{ darkMode, toggleDarkMode, language, setLanguage, t }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};