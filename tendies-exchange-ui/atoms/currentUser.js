import { atom } from 'recoil';

const currentUserAtom = atom({
  key: 'currentUser',
  default: '0x0',
});

export default currentUserAtom;
