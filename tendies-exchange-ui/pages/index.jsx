import {
  useRecoilValue,
} from 'recoil';
import { currentTokenStatsSelector } from '../atoms/selectors';
const LiquidityMiningProgressBar = () => {
  const { uniswapPoolTotalLiquidity } = useRecoilValue(currentTokenStatsSelector);
  const targetTotalLiquidity = 100e3;
  let percentComplete = Math.max(1.0, uniswapPoolTotalLiquidity / targetTotalLiquidity * 100);
  const containerStyle = {
    border: '3px solid #F1E8B8',
    borderRadius: '20px',
    padding:40,
    background:"black",
    margin: "40px 0px"
  };
  const outerStyle = {
    height: 30,
    width: "100%",
    background: "#191919",
    borderRadius: 25,
    padding: 10,
    marginBottom: 12
  }
  const innerStyle = {
    height: "100%",
    width: parseFloat(percentComplete) + "%",
    background: "#F1E8B8",
    borderTopRightRadius: 8,
    borderBottomRightRadius: 8,
    borderTopLeftRadius: 20,
    borderBottomLeftRadius: 20,
    overflow: "visible"
  }
  const spaceBetweenStyle = {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  };
  return (
    <div style={containerStyle}>
      <div style={outerStyle}>
        <div style={innerStyle} />
      </div>
      <div style={spaceBetweenStyle}>
        <span>Current: ${uniswapPoolTotalLiquidity.toLocaleString('en-US', { maximumFractionDigits: 0 })} USD</span>
        <span>Target: ${(targetTotalLiquidity).toLocaleString('en-US', { maximumFractionDigits: 0 })} USD</span>
      </div>
    </div>
  )
}
export default function Home() {
  const readMore = <p><a href="https://evanmays.com/tendiesexchange.html">Read more here</a></p>
  return (
    <>
      <h1>Welcome Home&#8230;</h1>
      <p>
        CAR-USDC-MAR21 is a synthetic future,&nbsp;
        <a href="https://umaproject.org/">built on UMA</a>
        , allowing you to hedge on the APR borrow-rates for USDC from Compound.
        On March 28th, the token resolves to March&apos;s average
        borrowing rate.
      </p>
      <p>
        You can use CAR tokens to hedge or speculate on interest rates.
        If you&apos;d like a near perfect hedge, buy or mint $X USD worth of CAR tokens
        where X is the amount you expect to pay or earn in interest during march.
      </p>
      {readMore}
      <h2>Alpha User Yield Farming</h2>
      <p>
        The first $100,000 worth of liquidity miners will earn all
        of my UMA developer mining rewards for the lifetime of CAR-USDC-MAR21. I expect this is somewhere
        around 100% APY although I can&apos;t be sure.
      </p>
      <LiquidityMiningProgressBar />
      <p>
        There may or may not be an NFT
        airdropped to your address that guarantees this benefit on
        liquidity provided to future Tendies Exchange projects.
        If such an NFT were to theoretically come into existance,
        it would have a reference to the amount of liquidity you provided in this
        alpha program. It would also be transferable/sellable.
      </p>
      <p>
        Eligibility Steps:
      </p>
      <ol>
        <li>Mint CAR tokens</li>
        <li>Provide liquidity to the CAR/USDC pool on Uniswap</li>
        <li>Be among the first $100,000 worth of people to do so</li>
        <li>Optional: Let me know if you find any bugs! (via Twitter or UMA Discord)</li>
      </ol>
      {readMore}
    </>
  );
}
