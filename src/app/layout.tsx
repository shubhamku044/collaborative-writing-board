import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import RecoilContextProvider from './recoilContextProvider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Collaborative writing board - by shubham',
  description: 'Collaborative writing board using nextjs',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <RecoilContextProvider>{children}</RecoilContextProvider>
      </body>
    </html>
  );
}
