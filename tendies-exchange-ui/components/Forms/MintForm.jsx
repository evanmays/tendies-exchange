import React, { useState, useContext, useEffect } from 'react';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { useToasts } from 'react-toast-notifications';
import {
  Formik, Form, Field, ErrorMessage, useFormikContext,
} from 'formik';
import Web3Context from '../../blockchain/Web3Context';
import TokenIcon from '../Icons';
import { currentSyntheticAtom } from '../../atoms/currentSynthetic';
import currentUserAtom from '../../atoms/currentUser';
import pendingTransactionAtom from '../../atoms/pendingTransaction';
import { mintCarTokens, approveCollateralTransfers, getIsCollateralApproved } from '../../blockchain/Web3Helpers';
import { currentTokenStatsSelector } from '../../atoms/selectors';
import { getCollateralizationRatio, getTokenAmount, getCollateralAmount } from '../../math';
import {
  labelStyle, ExpirationRow, NumberRow, errorStyle,
} from './FormElements';

const RatioRow = () => {
  const { empPrice } = useRecoilValue(currentTokenStatsSelector);
  const {
    values: {
      ratio, collateralAmount, tokenAmount, isCollateralizationLocked,
    },
    setFieldValue,
    setFieldTouched,
  } = useFormikContext();

  useEffect(() => {
    if (!isCollateralizationLocked) {
      const newRatio = getCollateralizationRatio(
        collateralAmount,
        tokenAmount, // newRatio might be NaN if tokenAmount == 0
        empPrice,
      );
      setFieldValue('ratio', newRatio || 0.0);
      setFieldTouched('ratio', true);
    }
  }, [tokenAmount, collateralAmount, empPrice]);
  return (
    <>
      <div style={labelStyle}>
        <span>
          Collateralization Ratio:&nbsp;
          <ErrorMessage name="ratio" component="span" style={errorStyle} />
        </span>
        {ratio.toFixed(2)}
      </div>

    </>
  );
};

const TokenAmountField = () => {
  const { minimumMintAmount } = useRecoilValue(currentSyntheticAtom);
  const { empPrice } = useRecoilValue(currentTokenStatsSelector);
  const {
    values: {
      ratio, collateralAmount, isCollateralizationLocked,
    },
    setFieldValue,
  } = useFormikContext();

  useEffect(() => {
    if (isCollateralizationLocked) {
      const newTokenAmount = getTokenAmount(
        collateralAmount,
        ratio,
        empPrice,
      );
      setFieldValue('tokenAmount', newTokenAmount);
    }
  }, [collateralAmount]);

  return (
    <>
      <label style={labelStyle} htmlFor="tokenAmount">
        <span>
          Token Amount:&nbsp;
          <ErrorMessage name="tokenAmount" component="span" style={errorStyle} />
        </span>
        <NumberRow name="tokenAmount" min={minimumMintAmount} />
      </label>
    </>
  );
};

const CollateralAmountField = ({ symbol }) => {
  const { empPrice } = useRecoilValue(currentTokenStatsSelector);
  const {
    values: {
      ratio, tokenAmount, isCollateralizationLocked,
    },
    setFieldValue,
  } = useFormikContext();

  useEffect(() => {
    if (isCollateralizationLocked) {
      const newCollateralAmount = getCollateralAmount(
        tokenAmount,
        ratio,
        empPrice,
      );
      setFieldValue('collateralAmount', newCollateralAmount);
    }
  }, [tokenAmount]);

  return (
    <label style={labelStyle} htmlFor="collateralAmount">
      <span>
        Collateral&nbsp;
        <TokenIcon symbol={symbol} />
        &nbsp;Amount:&nbsp;
        <ErrorMessage name="collateralAmount" component="span" style={errorStyle} />
      </span>
      <NumberRow name="collateralAmount" />
    </label>
  );
};

const LockRatioField = () => (
  <label style={labelStyle} htmlFor="isCollateralizationLocked">
    Lock Collateralization Ratio:
    <Field type="checkbox" name="isCollateralizationLocked" />
  </label>
);

const SubmitButtons = ({ isApproved }) => {
  const { isSubmitting } = useFormikContext();
  return (
    <>
      <button type="submit" disabled={isSubmitting || isApproved}>Approve</button>
      &nbsp;
      <button type="submit" disabled={isSubmitting || !isApproved}>Mint</button>
    </>
  );
};

const MintForm = () => {
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

  // Set Initial Form Values
  const { globalRatio } = useRecoilValue(currentTokenStatsSelector);

  const initialValues = {
    tokenAmount: emp.minimumMintAmount,
    collateralAmount: 0.0,
    ratio: 0.0,
  };

  // Form validation & submission
  const validate = (values) => {
    const errors = {};
    if (!isApproved) {
      return errors;
    }
    if (values.ratio < globalRatio) {
      errors.ratio = `Must be larger than ${globalRatio.toFixed(3)} GCR`;
    }
    if (values.tokenAmount < emp.minimumMintAmount) {
      errors.tokenAmount = `Must be larger than ${emp.minimumMintAmount} ${emp.token.symbol}`;
    }
    if (values.collateralAmount < 0.0) {
      errors.collateralAmount = "Can't be negative.";
    }
    return errors;
  };

  const { addToast } = useToasts();
  const setPendingTransaction = useSetRecoilState(pendingTransactionAtom);
  const handleSubmit = ({ tokenAmount, collateralAmount }, { setSubmitting }) => {
    if (userAddress === '0x0') {
      addToast("Wallet not connected", {
        appearance: 'error',
        autoDismiss: true,
      });
    } else if (isApproved) {
      addToast(
        `${tokenAmount.toFixed(2)} CAR minted with expiration date
          ${emp.expiration} and
          ${collateralAmount.toFixed(2)} USDC collateral`,
        {
          appearance: 'info',
          autoDismiss: true,
        },
      );
      mintCarTokens(userAddress, web3, collateralAmount, tokenAmount, setPendingTransaction, emp);
    } else {
      addToast(`Expiring multiparty approved to withdraw ${emp.collateral.symbol} for collateral`, {
        appearance: 'info',
        autoDismiss: true,
      });
      approveCollateralTransfers(userAddress, web3, setPendingTransaction, emp);
    }
    setSubmitting(false);
  };

  return (
    <Formik
      onSubmit={handleSubmit}
      initialValues={initialValues}
      validate={validate}
    >
      <Form>
        <ExpirationRow date={emp.expiration} />
        <CollateralAmountField symbol={emp.collateral.symbol} />
        <TokenAmountField />
        <RatioRow />
        <LockRatioField />
        <SubmitButtons isApproved={isApproved} />
      </Form>
    </Formik>
  );
};

export default MintForm;
