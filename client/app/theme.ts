import type { ThemeConfig } from 'antd';

const theme: ThemeConfig = {
  token: {
    // Основной синий (как в логотипах многих инженерных компаний)
    colorPrimary: '#1677ff',
    // Фон страниц
    colorBgLayout: '#f5f5f5',
    // Скругления (делаем чуть больше стандартных 6px)
    borderRadius: 8,
    // Семейство шрифтов (системный стек для лучшей производительности)
    fontFamily: `-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif`,
    // Тени для карточек
    boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.03), 0 1px 6px -1px rgba(0, 0, 0, 0.02), 0 2px 4px 0 rgba(0, 0, 0, 0.02)',
  },
  components: {
    Card: {
      // Увеличим padding в карточках
      paddingLG: 24,
    },
    Button: {
      // Скругления кнопок
      borderRadius: 6,
      // Тень при наведении
      boxShadow: '0 2px 0 rgba(0, 0, 0, 0.015)',
    },
    Table: {
      // Чистые таблицы без лишних границ
      borderColor: '#f0f0f0',
    },
  },
};

export default theme;