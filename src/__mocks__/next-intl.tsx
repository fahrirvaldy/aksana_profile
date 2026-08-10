
import React from 'react';

// src/__mocks__/next-intl.tsx

export const useTranslations = (namespace: string) => (key: string) => `${namespace}.${key}`;

export const createNavigation = () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  }),
  usePathname: () => '/mock-path',
  Link: (props: React.PropsWithChildren<Record<string, unknown>>) => <a>{props.children}</a>,
});

export const defineRouting = (config: Record<string, unknown>) => config;
