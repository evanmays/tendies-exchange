/* eslint-disable react/jsx-props-no-spreading */
import '../styles.css';
import { useSetRecoilState, RecoilRoot } from 'recoil';
import WalletConnectProvider from '@walletconnect/web3-provider';
import Web3Modal from 'web3modal';
import React, { useState, useEffect } from 'react';
import { isMobile } from 'react-device-detect';
import { ToastProvider, useToasts } from 'react-toast-notifications';
import { LayoutContainer } from '../components/Layout';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Web3Context from '../blockchain/Web3Context';
import { fetchCurrentAddress, createWeb3 } from '../blockchain/Web3Helpers';
import currentUserAtom from '../atoms/currentUser';
import TransactionPendingToastController from '../components/TransactionPendingToastController';

const AppWrapper = ({ children }) => {
  const [web3Context, setWeb3Context] = useState(null);
  const [loadWeb3Modal, setLoadWeb3Modal] = useState(null);
  const [logoutOfWeb3Modal, setLogoutOfWeb3Modal] = useState(null);

  const setCurrentUser = useSetRecoilState(currentUserAtom);

  const { addToast } = useToasts();

  useEffect(() => {
    // Web3 modal login
    const web3Modal = new Web3Modal({
      network: 'mainnet',
      cacheProvider: true,
      providerOptions: {
        walletconnect: {
          package: WalletConnectProvider,
          options: {
            infuraId: '52a383e497764cdc8b6ebad66e8d8c34',
            // rpc: {1: "http://localhost:7545", 5: "http://localhost:7545"}, //ganache
          },
        },
      },
    });

    web3Modal.on('connect', async (provider) => {
      const web3 = createWeb3(provider);
      const address = await fetchCurrentAddress(web3);
      setCurrentUser(address);
      setWeb3Context(web3);
      provider.on('connect', () => { // takes in data object
        addToast('Successfully Connected', {
          appearance: 'info',
          autoDismiss: true,
        });
      });
      provider.on('chainChanged', (chainId) => {
        if (chainId !== 1) {
          addToast(`You must use mainnet. You are currently on chain ${chainId}, this is probably a testnet.`, {
            appearance: 'warning',
            autoDismiss: true,
          });
        }
      });
      provider.on('disconnect', async (error) => {
        web3Modal.clearCachedProvider();
        localStorage.removeItem('walletconnect');
        addToast(`Wallet disconnected with error ${error}`, {
          appearance: 'error',
          autoDismiss: true,
        });
      });
      provider.on('accountsChanged', async (accounts) => {
        const newAddress = accounts[0];
        addToast(`Account changed to ${newAddress}`, {
          appearance: 'info',
          autoDismiss: true,
        });
        setCurrentUser(newAddress);
      });
    });

    if (web3Modal.cachedProvider) {
      web3Modal.connect();
    }

    // we have an *extra* () => becausse react hook thinks we want a
    // function that changes state based on the prevous state.
    // Like setNewStateObj((oldState) => oldState + 1) <- this is an increment state operation
    setLoadWeb3Modal(() => web3Modal.connect);
    setLogoutOfWeb3Modal(() => async () => {
      web3Modal.clearCachedProvider();
      localStorage.removeItem('walletconnect');
      setTimeout(() => {
        window.location.reload();
      }, 1);
    }, []);
  }, []);
  return (
    <LayoutContainer>
      <Web3Context.Provider value={web3Context}>
        <Header loadWeb3Modal={loadWeb3Modal} logoutOfWeb3Modal={logoutOfWeb3Modal} />
        {children}
      </Web3Context.Provider>
      <Footer />
    </LayoutContainer>
  );
};

const App = ({ Component, pageProps }) => (
  <RecoilRoot>
    <ToastProvider>
      <TransactionPendingToastController />
      {isMobile
        ? (
          <div style={{
            margin: 0, padding: 6, background: '#2172E5', color: 'white', fontSize: 11, textAlign: 'center',
          }}
          >
            ALPHA VERSION - tendies.exchange isn&apos;t optimized for mobile yet.
          </div>
        )
        : (
          <div style={{
            margin: 0, padding: 6, background: '#2172E5', color: 'white', fontSize: 11, textAlign: 'center',
          }}
          >
            Welcome to the Alpha release, Caveat Emptor
          </div>
        )}
      <AppWrapper>
        <Component {...pageProps} />
      </AppWrapper>
    </ToastProvider>
  </RecoilRoot>
);

export default App;
