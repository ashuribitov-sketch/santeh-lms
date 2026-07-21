import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'export',
  // Отключаем строгий режим для продакшена, чтобы избежать двойного рендера (необязательно)
  reactStrictMode: false,
  // Если понадобится обращаться к изображениям из папки public, оставляем как есть
  images: {
    unoptimized: true, // обязательно для статического экспорта
  },
};

export default nextConfig;