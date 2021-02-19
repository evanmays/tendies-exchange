import { atom } from 'recoil';

const pendingTransactionAtom = atom({
  key: 'pendingTransaction',
  default: {},
});

/*
Object with hashes as keys and success as value.
success value is null if no receipt. true if success, false if EVM failure.
{
  hash: success,
  0x001: true,
  0x002: false,
  0x003: null
}
*/

export default pendingTransactionAtom;
