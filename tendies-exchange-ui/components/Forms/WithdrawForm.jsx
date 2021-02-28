import React, { useContext, useEffect } from 'react';
import { useSetRecoilState, useRecoilValue } from 'recoil';
import { useToasts } from 'react-toast-notifications';
import {
  Formik, Form, Field, ErrorMessage, useFormikContext,
} from 'formik';
import Web3Context from '../../blockchain/Web3Context';
import TokenIcon from '../Icons';
import { currentSyntheticAtom } from '../../atoms/currentSynthetic';
import currentUserAtom from '../../atoms/currentUser';
import pendingTransactionAtom from '../../atoms/pendingTransaction';
import {
  instantWithdrawFromExistingPosition,
  requestSlowWithdrawFromExistingPosition,
  completeSlowWithdrawFromExistingPosition,
} from '../../blockchain/Web3Helpers';
import { currentAddressSponsorPositionSelector, currentTokenStatsSelector } from '../../atoms/selectors';
import { getCollateralizationRatio } from '../../math';
import {
  labelStyle, ExpirationRow, errorStyle, NumberRow,
} from './FormElements';

const CollateralAmountField = ({ symbol }) => (
  <label style={labelStyle} htmlFor="collateralAmount">
    <span>
      Collateral&nbsp;
      <TokenIcon symbol={symbol} />
      &nbsp;Withdraw Amount:&nbsp;
      <ErrorMessage name="collateralAmount" component="span" style={errorStyle} />
    </span>
    <NumberRow name="collateralAmount" />
  </label>
);

const WaitedTwoHoursField = () => (
  <label style={labelStyle} htmlFor="shouldCompleteSlowWithdraw">
    I requested slow withdraw over 2 hours ago:
    <Field type="checkbox" name="shouldCompleteSlowWithdraw" />
  </label>
);

const RatioRow = ({ startingCollateralAmount, startingTokenAmount, empPrice }) => {
  const {
    setFieldValue,
    setFieldTouched,
    values: { collateralAmount, ratio },
  } = useFormikContext();
  useEffect(() => {
    const newRatio = getCollateralizationRatio(
      startingCollateralAmount - collateralAmount,
      startingTokenAmount,
      empPrice,
    );
    setFieldValue('ratio', newRatio || 0.0);
    setFieldTouched('ratio', true);
  }, [startingTokenAmount, startingCollateralAmount, collateralAmount, empPrice]);
  return (
    <div style={labelStyle}>
      <span>
        New Collateralization Ratio:&nbsp;
        <ErrorMessage name="ratio" component="span" style={errorStyle} />
      </span>
      {ratio.toFixed(4)}
    </div>
  );
};

const SubmitButtons = ({ globalRatio }) => {
  const { isSubmitting, values: { shouldCompleteSlowWithdraw, ratio } } = useFormikContext();
  return (
    ratio > globalRatio
      ? <button type="submit" disabled={isSubmitting}>Instant Withdraw</button>
      : (
        <>
          <WaitedTwoHoursField />
          <button type="submit" disabled={isSubmitting || shouldCompleteSlowWithdraw}>Request Slow Withdraw</button>
          <button type="submit" disabled={isSubmitting || !shouldCompleteSlowWithdraw}>Complete Slow Withdraw</button>
          <p>
            Note: Because your resulting collaterlization ratio is below the
            GCR (
            {globalRatio.toFixed(3)}
            ), you must wait 2 hours.
            {' '}
            <a href="https://docs.umaproject.org/synthetic-tokens/expiring-synthetic-tokens#slow-withdrawal">Read more.</a>
          </p>
        </>
      )
  );
};

const WithdrawForm = () => {
  // Useful things to setup
  const userAddress = useRecoilValue(currentUserAtom);
  const web3 = useContext(Web3Context);
  const emp = useRecoilValue(currentSyntheticAtom);

  // Form validation & submission
  const { empPrice, globalRatio } = useRecoilValue(currentTokenStatsSelector);
  const { collateral, tokens } = useRecoilValue(currentAddressSponsorPositionSelector);
  const validate = ({ collateralAmount, ratio }) => {
    const errors = {};
    if (ratio < emp.collateralRequirement) {
      errors.ratio = `Can't be less than ${emp.collateralRequirement}`;
    }
    if (collateralAmount < 0.0) {
      errors.collateralAmount = "Can't be negative";
    } else if (collateralAmount > collateral) {
      errors.collateralAmount = 'Not enough collateral in position';
    }
    return errors;
  };

  const { addToast } = useToasts();
  const setPendingTransaction = useSetRecoilState(pendingTransactionAtom);
  const handleSubmit = ({ collateralAmount, shouldCompleteSlowWithdraw }, { setSubmitting }) => {
    const ratio = getCollateralizationRatio(
      collateral - collateralAmount,
      tokens,
      empPrice,
    );
    if (ratio > globalRatio) {
      addToast(
        `${collateralAmount.toFixed(2)}${emp.collateral.symbol} collateral withdrawn from ${emp.token.symbol} position.`,
        { appearance: 'info', autoDismiss: false },
      );
      instantWithdrawFromExistingPosition(
        userAddress,
        web3,
        collateralAmount,
        setPendingTransaction,
        emp,
      );
    } else if (shouldCompleteSlowWithdraw) {
      addToast(
        `Slow withdrawal completed from ${emp.token.symbol} position.`,
        { appearance: 'info', autoDismiss: false },
      );
      completeSlowWithdrawFromExistingPosition(
        userAddress,
        web3,
        setPendingTransaction,
        emp,
      );
    } else {
      addToast(
        `Slow withdrawal requested for ${collateralAmount.toFixed(2)}${emp.collateral.symbol} of collateral from ${emp.token.symbol} position.`,
        { appearance: 'info', autoDismiss: false },
      );
      requestSlowWithdrawFromExistingPosition(
        userAddress,
        web3,
        collateralAmount,
        setPendingTransaction,
        emp,
      );
    }
    setSubmitting(false);
  };
  return (
    <Formik
      onSubmit={handleSubmit}
      initialValues={{ collateralAmount: 0, shouldCompleteSlowWithdraw: false, ratio: 0.0 }}
      validate={validate}
    >
      <Form>
        <ExpirationRow date={emp.expiration} />
        <CollateralAmountField symbol={emp.collateral.symbol} />
        <RatioRow
          startingCollateralAmount={collateral}
          startingTokenAmount={tokens}
          empPrice={empPrice}
        />
        <SubmitButtons globalRatio={globalRatio} />
      </Form>
    </Formik>
  );
};

export default WithdrawForm;
