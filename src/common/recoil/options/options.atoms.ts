import { atom } from 'recoil';
import type { CtxOptions } from '../../types/types';

export const optionsAtom = atom<CtxOptions>({
  key: 'options',
  default: {
    lineWidth: 5,
    lineColor: '#000',
  },
});
