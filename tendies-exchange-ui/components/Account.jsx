import { useRecoilValue } from 'recoil';
import { useState, useContext, useEffect } from 'react';
import { fetchENSName } from '../blockchain/Web3Helpers';
import Web3Context from '../blockchain/Web3Context';
import currentUserAtom from '../atoms/currentUser';

export default function Account({ loadWeb3Modal, logoutOfWeb3Modal }) {
  const address = useRecoilValue(currentUserAtom);
  const web3 = useContext(Web3Context);
  const [ens, setEns] = useState(null);
  useEffect(() => {
    fetchENSName(address, web3).then(setEns);
  }, [address, web3]);

  let button = <></>;
  if (address !== '0x0') {
    button = (
      <button
        key="logoutbutton"
        style={{ verticalAlign: 'top', marginLeft: 8, marginTop: 4 }}
        type="button"
        onClick={logoutOfWeb3Modal}
      >
        logout
      </button>
    );
  } else {
    button = (
      <button
        key="loginbutton"
        style={{ verticalAlign: 'top', marginLeft: 8, marginTop: 4 }}
        type="button"
        onClick={loadWeb3Modal}
      >
        connect
      </button>
    );
  }

  return (
    <div>
      <span>
        {address === '0x0' ? '' : (ens || address)}
      </span>
      {button}
      <style jsx>
        {`
        span {
          display: inline-block;
          width: 100px;
          text-overflow: ellipsis;
          white-space: nowrap;
          overflow: hidden;
        }
      `}
      </style>
    </div>
  );
}
