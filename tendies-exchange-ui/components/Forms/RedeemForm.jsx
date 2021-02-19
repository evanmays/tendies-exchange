import React, { useState, useContext, useEffect } from 'react';
import { useSetRecoilState, useRecoilValue } from 'recoil';
import { useToasts } from 'react-toast-notifications';
import {
  Formik, Form, ErrorMessage, useFormikContext,
} from 'formik';
import Web3Context from '../../blockchain/Web3Context';
import TokenIcon from '../Icons';
import { currentSyntheticAtom } from '../../atoms/currentSynthetic';
import currentUserAtom from '../../atoms/currentUser';
import pendingTransactionAtom from '../../atoms/pendingTransaction';
import { redeemTokens, approveTokenTransfers, getIsTokenApproved } from '../../blockchain/Web3Helpers';
import { currentAddressSponsorPositionSelector, currentTokenStatsSelector } from '../../atoms/selectors';
import { getCollateralizationRatio, getCollateralAmount } from '../../math';
import {
  labelStyle, ExpirationRow, errorStyle, NumberRow,
} from './FormElements';

const SubmitButtons = ({ isApproved }) => {
  const { isSubmitting } = useFormikContext();
  return (
    <>
      <button type="submit" disabled={isSubmitting || isApproved}>Approve</button>
      &nbsp;
      <button type="submit" disabled={isSubmitting || !isApproved}>Redeem</button>
    </>
  );
};

const StatsRow = ({ collateralSymbol }) => {
  const { collateral, tokens } = useRecoilValue(currentAddressSponsorPositionSelector);
  const { empPrice } = useRecoilValue(currentTokenStatsSelector);
  const { values: { tokenAmount } } = useFormikContext();
  const ratio = getCollateralizationRatio(collateral, tokens, empPrice);
  const newTokenAmount = tokens - tokenAmount;
  const newCollateralAmount = getCollateralAmount(newTokenAmount, ratio, empPrice);
  const collateralReceived = collateral - newCollateralAmount;
  return (
    <>
      <div style={labelStyle}>
        <span>
          Collateral
          {' '}
          <TokenIcon symbol={collateralSymbol} />
          {' '}
          you&apos;ll receive
        </span>
        {collateralReceived.toFixed(4)}
      </div>
      <div style={labelStyle}>
        <span>
          New position collateral
          {' '}
          <TokenIcon symbol={collateralSymbol} />
          {' '}
          balance
        </span>
        {newCollateralAmount.toFixed(4)}
      </div>
      <div style={labelStyle}>
        <span>
          New position token balance
        </span>
        {newTokenAmount.toFixed(4)}
      </div>
    </>
  );
};
const TokenAmountField = () => (
  <>
    <label style={labelStyle} htmlFor="tokenAmount">
      <span>
        Token Amount:&nbsp;
        <ErrorMessage name="tokenAmount" component="span" style={errorStyle} />
      </span>
      <NumberRow name="tokenAmount" min={0} />
    </label>
  </>
);

const RedeemForm = () => {
  // Check if user approved EMP to transfer their collateral
  const [isApproved, setIsApproved] = useState(true);
  const userAddress = useRecoilValue(currentUserAtom);
  const web3 = useContext(Web3Context);
  const emp = useRecoilValue(currentSyntheticAtom);

  useEffect(() => {
    if (userAddress && web3) {
      getIsTokenApproved(userAddress, web3, emp).then(setIsApproved);
    }
  }, [userAddress, web3, emp]);

  // Form validation & submission
  const { tokens } = useRecoilValue(currentAddressSponsorPositionSelector);
  const validate = ({ tokenAmount }) => {
    if (isApproved) {
      if (tokenAmount < 0.0) {
        return { tokenAmount: "Can't be negative" };
      } if (tokenAmount > tokens) {
        return { tokenAmount: 'Can\'t be greater than your position' };
      }
    }
    return {};
  };
  const { addToast } = useToasts();
  const setPendingTransaction = useSetRecoilState(pendingTransactionAtom);
  const handleSubmit = ({ tokenAmount }, { setSubmitting }) => {
    if (isApproved) {
      addToast(
        `${tokenAmount.toFixed(2)} ${emp.token.symbol} redeemed for ${emp.collateral.symbol}.`,
        { appearance: 'info', autoDismiss: true },
      );
      redeemTokens(userAddress, web3, tokenAmount, setPendingTransaction, emp);
    } else {
      addToast(
        `Expiring multiparty approved to withdraw ${emp.token.symbol} for redemption of collateral`,
        { appearance: 'info', autoDismiss: true },
      );
      approveTokenTransfers(userAddress, web3, setPendingTransaction, emp);
    }
    setSubmitting(false);
  };

  return (
    <Formik
      onSubmit={handleSubmit}
      initialValues={{ tokenAmount: 0.0 }}
      validate={validate}
    >
      <Form>
        <ExpirationRow date={emp.expiration} />
        <TokenAmountField />
        <StatsRow collateralSymbol={emp.collateral.symbol} />
        <SubmitButtons isApproved={isApproved} />
      </Form>
    </Formik>
  );
};

export default RedeemForm;
