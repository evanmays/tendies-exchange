/* This file has selectors that are used by multiple other files
* it's generally preferable to have selctors as close to where they are being userAddress
*/
import {
  selector,
} from 'recoil';
import currentUserAtom from './currentUser';
import carSponsorPositionStatsAtom from './carSponsorPositionStats';
import carTokenStatsAtom, { DEFAULT_CAR_TOKEN_STATS } from './carTokenStats';
import { currentSyntheticAtom } from './currentSynthetic';

const currentAddressSponsorPositionSelector = selector({
  key: 'currentAddressSponsorPosition',
  get: ({ get }) => {
    const user = get(currentUserAtom);
    const { address: synth } = get(currentSyntheticAtom);
    const data = get(carSponsorPositionStatsAtom);
    const defaultPosition = { tokens: 0.0, collateral: 0.0 };
    try {
      // Throws exception when data isn't loaded yet
      // When user doesn't have a sponsor position, output stays null
      const position = data[synth.toLowerCase()][user.toLowerCase()];
      return position || defaultPosition;
    } catch (e) {
      return defaultPosition;
    }
  },
});

const currentTokenStatsSelector = selector({
  key: 'currentTokenStats',
  get: ({ get }) => {
    const { address } = get(currentSyntheticAtom);
    const data = get(carTokenStatsAtom);
    return data[address.toLowerCase()] || DEFAULT_CAR_TOKEN_STATS;
  },
});

export { currentAddressSponsorPositionSelector, currentTokenStatsSelector };
