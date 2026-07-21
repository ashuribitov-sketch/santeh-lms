import type { Metadata } from 'next';
import { AntdRegistry } from '@ant-design/nextjs-registry';
import { ConfigProvider, App } from 'antd';
import theme from './theme';

export const metadata: Metadata = {
  title: 'Грамотный сантехник',
  description: 'Платформа обучения и аттестации',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru">
      <body>
        <AntdRegistry>
          <ConfigProvider theme={theme}>
            <App>
              {children}
            </App>
          </ConfigProvider>
        </AntdRegistry>
      </body>
    </html>
  );
}