'use client';
import React from 'react';
import { RecoilRoot } from 'recoil';

export default function RecoilContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return <RecoilRoot>{children}</RecoilRoot>;
}
