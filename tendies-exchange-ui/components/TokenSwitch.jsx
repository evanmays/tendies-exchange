import { useToasts } from 'react-toast-notifications';
import { useState } from 'react';
import {
  useSetRecoilState,
} from 'recoil';
import { currentSyntheticAtom, ALL_EMPS } from '../atoms/currentSynthetic';
import carTokenStatsAtom from '../atoms/carTokenStats';
import carSponsorPositionStatsAtom from '../atoms/carSponsorPositionStats';

const TokenSwitch = () => {
  const { addToast } = useToasts();
  const [selectedSynth, setSelectedSynth] = useState(0);
  const setCurrentSynthetic = useSetRecoilState(currentSyntheticAtom);
  const setCarTokenStats = useSetRecoilState(carTokenStatsAtom);
  const setCarSponsorPositionStats = useSetRecoilState(carSponsorPositionStatsAtom);
  const handler = (event) => {
    const row = event.target.value;
    setSelectedSynth(row);
    const newEMP = ALL_EMPS[row];
    setCurrentSynthetic(newEMP);
    setCarTokenStats((old) => ({ ...old, address_HACKY: newEMP.address }));
    setCarSponsorPositionStats((old) => ({ ...old, address_HACKY: newEMP.address }));
    addToast(
      `Switched to synthetic ${newEMP.token.symbol}`,
      {
        appearance: 'info',
        autoDismiss: true,
      },
    );
  };
  return (
    <select value={selectedSynth} onChange={handler}>
      {ALL_EMPS.map((emp, i) => <option value={i} key={emp.address}>{emp.token.symbol}</option>)}
    </select>
  );
};

export default TokenSwitch;
