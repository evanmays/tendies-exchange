import { useToasts } from 'react-toast-notifications';
import { useState, useEffect } from 'react';
import {
  useRecoilValue,
} from 'recoil';
import pendingTransactionAtom from '../atoms/pendingTransaction';

const TransactionPendingToastController = () => {
  const { addToast, removeToast } = useToasts();
  const [hashToPendingToastId, setHashToPendingToastId] = useState({});
  const [noLongerPending] = useState(new Set());
  const pendingTransactions = useRecoilValue(pendingTransactionAtom);

  useEffect(() => {
    Object.entries(pendingTransactions).forEach(([key, success]) => {
      const etherScanLink = (
        <a target="_blank" rel="noreferrer" style={{ color: 'blue' }} href={`https://etherscan.io/tx/${key}`}>
          {key.substring(0, 8)}
          ... (etherscan)
        </a>
      );
      if (key in hashToPendingToastId) {
        // check if transaction complete
        if (success !== null && !noLongerPending.has(key)) {
          // remove pending toast
          removeToast(hashToPendingToastId[key]);
          // Make transaction complete toast
          if (success) {
            addToast(
              <>
                Transaction Succeeded
                <br />
                {etherScanLink}
              </>,
              { appearance: 'success' },
            );
          } else {
            // EVM Reverted
            addToast(
              <>
                Transaction Failed
                <br />
                {etherScanLink}
              </>,
              { appearance: 'error' },
            );
          }
          noLongerPending.add(key);
        }
      } else {
        // make new pending toast
        addToast(
          <>
            Transaction Pending
            <br />
            {etherScanLink}
          </>,
          { appearance: 'warning' },
          (id) => { setHashToPendingToastId((old) => ({ ...old, [key]: id })); },
        );
      }
    });
  }, [pendingTransactions]);

  return <></>;
};

export default TransactionPendingToastController;
