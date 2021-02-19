import {
  useRecoilValue,
} from 'recoil';
import { LayoutRow, LayoutBox } from '../components/Layout';
import TabContainer from '../components/TabContainer';
import {
  MintForm, DepositForm, WithdrawForm, RedeemForm,
} from '../components/Forms/index';
import TokenIcon from '../components/Icons';
import { currentSyntheticAtom } from '../atoms/currentSynthetic';
import currentUserAtom from '../atoms/currentUser';
import { currentAddressSponsorPositionSelector, currentTokenStatsSelector } from '../atoms/selectors';

import TokenSwitch from '../components/TokenSwitch';
import { getLiquidationPrice, getCollateralizationRatio } from '../math';

export default function Mint() {
  const { token: { symbol }, description } = useRecoilValue(currentSyntheticAtom);
  const spaceBetweenStyle = {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 2,
  };
  return (
    <>
      <div style={spaceBetweenStyle}>
        <h1 style={{ marginBottom: 0 }}>
          {symbol}
        </h1>
        <TokenSwitch />
      </div>
      <h2>About</h2>
      {description}
      <YourWallet />
      <h2 style={{ marginTop: 40 }}>Actions</h2>
      <MintTool />
      <SynthStats />
      {/* <TransactionPendingModal isOpen={isModalOpen} setIsOpen={setIsModalOpen} /> */}

    </>
  );
}

const YourWallet = () => {
  const {
    collateral: { symbol: collateralSymbol },
    collateralRequirement,
    invertLiquidationPrice,
    liquidationPriceUnits,
  } = useRecoilValue(currentSyntheticAtom);
  const { empPrice } = useRecoilValue(currentTokenStatsSelector);
  const { collateral, tokens } = useRecoilValue(currentAddressSponsorPositionSelector);
  const ratio = collateral && tokens && empPrice
    ? getCollateralizationRatio(collateral, tokens, empPrice)
    : 0.0;
  const liquidationPrice = tokens && collateral
    ? getLiquidationPrice(tokens, collateral, collateralRequirement, invertLiquidationPrice)
    : 0.0;
  const isWalletConnected = useRecoilValue(currentUserAtom) !== '0x0';
  return (
    <>
      <h2>
        Your Wallet
        {isWalletConnected || ' (Not connected)'}
      </h2>
      <LayoutRow>
        <LayoutBox
          title={(
            <>
              Locked Collateral&nbsp;
              <TokenIcon symbol={collateralSymbol} />
            </>
          )}
          text={collateral.toLocaleString('en-US', { minimumFractionDigits: 2 })}
        />
        <LayoutBox title="Minted Tokens" text={tokens} />
      </LayoutRow>
      <LayoutRow>
        <LayoutBox
          title="Collateralization Ratio"
          text={ratio.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 6 })}
        />
        <LayoutBox title={`Liquidation Price (${liquidationPriceUnits})`} text={liquidationPrice.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })} />
      </LayoutRow>
    </>
  );
};

const NoForm = ({ text }) => {
  const style = {
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
  };
  return (
    <div style={style}>
      <p>{text}</p>
    </div>
  );
};
const MintTool = () => {
  const { token: { symbol } } = useRecoilValue(currentSyntheticAtom);
  const mintTab = (
    <>
      <h3>
        Mint
        {symbol}
      </h3>
      <MintForm />
    </>
  );

  const { tokens } = useRecoilValue(currentAddressSponsorPositionSelector);
  const depositTab = tokens > 0.0
    ? (
      <>
        <h3>Add to position collateral</h3>
        <DepositForm />
      </>
    )
    : <NoForm text="You can't deposit until you create a new position by minting." />;
  const withdrawTab = tokens > 0.0
    ? (
      <>
        <h3>Remove from position collateral</h3>
        <WithdrawForm />
      </>
    )
    : <NoForm text="You can't withdraw from an empty position. Mint a new position first." />;
  const redeemTab = tokens > 0.0
    ? (
      <>
        <h3>
          Redeem&nbsp;
          {symbol}
&nbsp;for collateral
        </h3>
        <RedeemForm />
      </>
    )
    : <NoForm text="You can't redeem from an empty position. Mint a new position first." />;

  const tabContent = [mintTab, depositTab, withdrawTab, redeemTab];
  const tabTitles = ['Mint', 'Deposit', 'Withdraw', 'Redeem'];
  return (
    <TabContainer tabTitles={tabTitles} tabContent={tabContent} />
  );
};

const SynthStats = () => {
  const {
    globalRatio,
    tradingPrice,
    empPrice,
    totalCollateralSupplied,
    totalMintedTokens,
    cacheServerBlockNumber,
    tradingPriceUnits,
  } = useRecoilValue(currentTokenStatsSelector);
  const {
    collateral: { collateralSymbol },
    priceIdentifier,
  } = useRecoilValue(currentSyntheticAtom);
  const spaceBetweenStyle = {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
  };
  return (
    <>
      <span style={spaceBetweenStyle}>
        <h2>Data</h2>
        {' '}
        <span style={{ fontSize: '0.8em' }}>
          Last updated block #
          {cacheServerBlockNumber}
        </span>
      </span>
      <LayoutRow>
        <LayoutBox title="Global Collateralization Ratio" text={globalRatio.toLocaleString('en-US', { minimumFractionDigits: 0 })} />
        <LayoutBox title={`Token's Trading Price (${tradingPriceUnits})`} text="TODO" />
      </LayoutRow>
      <LayoutRow>
        <LayoutBox
          title={(
            <>
              Total Collateral Supplied&nbsp;
              <TokenIcon symbol={collateralSymbol} />
            </>
          )}
          text={totalCollateralSupplied.toLocaleString('en-US', { minimumFractionDigits: 0 })}
        />
        <LayoutBox title="Tokens Outstanding (CAR)" text={totalMintedTokens.toLocaleString('en-US', { minimumFractionDigits: 0 })} />
      </LayoutRow>
      <LayoutRow>
        <LayoutBox title={`Price Identifier Price (${priceIdentifier})`} text={empPrice.toLocaleString('en-US', { minimumFractionDigits: 8 })} />
      </LayoutRow>
    </>
  );
};
