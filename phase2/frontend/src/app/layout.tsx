import React from 'react';
import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'TaskMaster - Todo App',
  description: 'Modern Multi-User Todo Web Application',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className="bg-background text-foreground min-h-screen">
        {children}
      </body>
    </html>
  );
}