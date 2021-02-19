import React from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Account from './Account';

const Header = ({ loadWeb3Modal, logoutOfWeb3Modal }) => {
  const router = useRouter();
  return (
    <div id="root">
      <img
        src="/tendiesmeme.jpg"
        alt="Tendies Exchange Logo"
        className="logo"
        width={200}
        height={80}
      />
      <span>
        <Link href="/" selected={router.pathname === '/'}><a>Home</a></Link>
        <Link href="/mint" selected={router.pathname === '/mint'}><a>Mint</a></Link>
        <Link href="/trade" selected={router.pathname === '/trade'}><a>Trade</a></Link>
      </span>
      {
        loadWeb3Modal && logoutOfWeb3Modal
          && (
          <Account
            loadWeb3Modal={loadWeb3Modal}
            logoutOfWeb3Modal={logoutOfWeb3Modal}
          />
          )
      }
      <style jsx>
        {`
        div#root {
          display: flex;
          flex-direction: row;
          justify-content: space-between;
          width: 100%;
          flex:1;
          align-items: center;
          flex-wrap: wrap;
        }
        a {
          margin-right: 20px;
          border-bottom: 2px solid #F1E8B8;
          text-decoration: none;
          font-size: 24px;
        }
      `}
      </style>
    </div>
  );
};

export default Header;
