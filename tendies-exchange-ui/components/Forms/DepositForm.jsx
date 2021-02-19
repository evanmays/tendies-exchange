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
import { depositToExistingPosition, approveCollateralTransfers, getIsCollateralApproved } from '../../blockchain/Web3Helpers';
import { currentAddressSponsorPositionSelector, currentTokenStatsSelector } from '../../atoms/selectors';
import { getLiquidationPrice, getCollateralizationRatio } from '../../math';
import {
  labelStyle, ExpirationRow, errorStyle, NumberRow,
} from './FormElements';

const SubmitButtons = ({ isApproved }) => {
  const { isSubmitting } = useFormikContext();
  return (
    <>
      <button type="submit" disabled={isSubmitting || isApproved}>Approve</button>
      &nbsp;
      <button type="submit" disabled={isSubmitting || !isApproved}>Deposit</button>
    </>
  );
};

const RatioRow = ({ empPrice, startingTokenAmount, startingCollateralAmount }) => {
  const { values: { collateralAmount } } = useFormikContext();
  const ratio = getCollateralizationRatio(
    startingCollateralAmount + collateralAmount,
    startingTokenAmount, // ratio might be NaN if tokenAmount == 0
    empPrice,
  );
  return (
    <>
      <div style={labelStyle}>
        <span>New Collateralization Ratio:</span>
        {ratio ? ratio.toFixed(4) : 0.0}
      </div>

    </>
  );
};

const LiquidationPriceRow = ({
  startingTokenAmount,
  startingCollateralAmount,
  invertLiquidationPrice,
  liquidationPriceUnits,
  collateralRequirement,
}) => {
  const { values: { collateralAmount } } = useFormikContext();
  const liqPrice = getLiquidationPrice(
    startingTokenAmount,
    startingCollateralAmount + collateralAmount,
    collateralRequirement,
    invertLiquidationPrice,
  );
  return (
    <>
      <div style={labelStyle}>
        <span>
          New Liquidation Price (
          {liquidationPriceUnits}
          ):
        </span>
        {liqPrice}
      </div>

    </>
  );
};

const CollateralAmountField = ({ symbol }) => (
  <label style={labelStyle} htmlFor="collateralAmount">
    <span>
      Collateral&nbsp;
      <TokenIcon symbol={symbol} />
      &nbsp;Increase Amount:&nbsp;
      <ErrorMessage name="collateralAmount" component="span" style={errorStyle} />
    </span>
    <NumberRow name="collateralAmount" />
  </label>
);

const DepositForm = () => {
  // Check if user approved EMP to transfer their collateral
  const [isApproved, setIsApproved] = useState(true);
  const userAddress = useRecoilValue(currentUserAtom);
  const web3 = useContext(Web3Context);
  const emp = useRecoilValue(currentSyntheticAtom);

  useEffect(() => {
    if (userAddress && web3) {
      getIsCollateralApproved(userAddress, web3, emp).then(setIsApproved);
    }
  }, [userAddress, web3, emp]);

  // Form validation & submission
  const validate = ({ collateralAmount }) => (
    isApproved && collateralAmount < 0.0
      ? { collateralAmount: "Can't be negative." }
      : {}
  );
  const { collateral, tokens } = useRecoilValue(currentAddressSponsorPositionSelector);
  const { empPrice } = useRecoilValue(currentTokenStatsSelector);
  const { addToast } = useToasts();
  const setPendingTransaction = useSetRecoilState(pendingTransactionAtom);
  const handleSubmit = ({ collateralAmount }, { setSubmitting }) => {
    if (isApproved) {
      addToast(
        `${collateralAmount.toFixed(2)} USDC collateral deposited to ${emp.token.symbol}.`,
        { appearance: 'info', autoDismiss: true },
      );
      depositToExistingPosition(userAddress, web3, collateralAmount, setPendingTransaction, emp);
    } else {
      addToast(
        `Expiring multiparty approved to withdraw ${emp.collateral.symbol} for collateral`,
        { appearance: 'info', autoDismiss: true },
      );
      approveCollateralTransfers(userAddress, web3, setPendingTransaction, emp);
    }
    setSubmitting(false);
  };

  return (
    <Formik
      onSubmit={handleSubmit}
      initialValues={{ collateralAmount: 0 }}
      validate={validate}
    >
      <Form>
        <ExpirationRow date={emp.expiration} />
        <CollateralAmountField symbol={emp.collateral.symbol} />
        <RatioRow
          startingTokenAmount={tokens}
          startingCollateralAmount={collateral}
          empPrice={empPrice}
        />
        <LiquidationPriceRow
          startingTokenAmount={tokens}
          startingCollateralAmount={collateral}
          invertLiquidationPrice={emp.invertLiquidationPrice}
          liquidationPriceUnits={emp.liquidationPriceUnits}
          collateralRequirement={emp.collateralRequirement}
        />
        <SubmitButtons isApproved={isApproved} />
      </Form>
    </Formik>
  );
};

export default DepositForm;
