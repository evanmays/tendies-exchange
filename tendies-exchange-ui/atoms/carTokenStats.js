import { atom } from 'recoil';
import CacheServer from '../cacheserver/CacheServer';

const DEFAULT_CAR_TOKEN_STATS = {
  globalRatio: 0.0,
  empPrice: 0.0, // from the UMIP price identifier
  tradingPrice: 0.0, // from the market
  tradingPriceUnits: 'loading', // from the market, depends on what AMM pool is being used
  totalMintedTokens: 0.0,
  totalCollateralSupplied: 0.0,
  blockNumber: 0,
  uniswapPoolTotalLiquidity: 0.0
};

const carTokenStatsAtom = atom({
  key: 'carTokenStats',
  default: {
    '0x0': DEFAULT_CAR_TOKEN_STATS,
  },
  effects_UNSTABLE: [
    ({ setSelf }) => {
      const tokenStatsCache = new CacheServer(setSelf, 'car');
      tokenStatsCache.startPolling();
      return tokenStatsCache.stopPolling;
    },
  ],
});

export { DEFAULT_CAR_TOKEN_STATS };
export default carTokenStatsAtom;
