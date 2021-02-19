import { atom } from 'recoil';
import CacheServer from '../cacheserver/CacheServer';

const carSponsorPositionStatsAtom = atom({
  key: 'carSponsorPositionStats',
  default: {
    '0x0': {
      '0x0': {
        collateral: 0.0,
        tokens: 0.0,
      },
    },
  },
  effects_UNSTABLE: [
    ({ setSelf }) => {
      const sponsorPositionStatsCache = new CacheServer(setSelf, 'sponsors');
      sponsorPositionStatsCache.startPolling();
      return sponsorPositionStatsCache.stopPolling;
    },
  ],
});

export default carSponsorPositionStatsAtom;
