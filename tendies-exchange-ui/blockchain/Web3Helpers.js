import Web3 from 'web3';
import NameHash from 'eth-ens-namehash';

const ERC20_ABI = require('../abi/ERC20_ABI.json');
const EMP_ABI = require('../abi/ExpiringMultiParty.json');
// const GAS_PRICE = 50 * 1e9; // 50 gwei

const CONFIRMATION_NUMBER = 2; // web3 0-indexes confirmation numbers

const fetchCurrentAddress = async (web3) => (await web3.eth.getAccounts())[0];

// might return null
const fetchENSName = async (address, web3) => {
  const lookup = `${address.toLowerCase().substr(2)}.addr.reverse`;
  const namehash = NameHash.hash(lookup);
  try {
    const resolverContract = await web3.eth.ens.getResolver(lookup);
    const name = await resolverContract.methods.name(namehash).call();
    return name;
  } catch (e) {
    return null;
  }
};

const getIsCollateralApproved = async (address, web3, emp) => {
  const collateral = new web3.eth.Contract(ERC20_ABI, emp.collateral.address);
  try {
    const allowance = await collateral.methods.allowance(address, emp.address).call();
    return allowance > 1e9 * emp.collateral.decimals;
  } catch (e) {
    return false;
  }
};

const getIsTokenApproved = async (address, web3, emp) => {
  const token = new web3.eth.Contract(ERC20_ABI, emp.token.address);
  try {
    const allowance = await token.methods.allowance(address, emp.address).call();
    return allowance > 1e9 * emp.token.decimals;
  } catch (e) {
    return false;
  }
};

const sendTransaction = async (tx, setPendingTransaction, address) => {
  const gasLimit = Math.floor(1.1 * await tx.estimateGas({ from: address }));
  const receipt = await tx.send({ from: address, gas: gasLimit })
    .on('transactionHash', (hash) => {
      setPendingTransaction((oldTransactions) => ({
        ...oldTransactions,
        [hash]: null, // success is null since transaction not mined yet
      }));
    });

  // add receipt success/failure to pending transactions atom
  setPendingTransaction((oldTransactions) => ({
    ...oldTransactions,
    [receipt.transactionHash]: receipt.status,
  }));
};

const depositToExistingPosition = async (address, web3, amount, setPendingTransaction, emp) => {
  const contract = new web3.eth.Contract(EMP_ABI, emp.address);
  const amountScaled = amount * emp.collateral.decimals;
  const input = { rawValue: amountScaled.toString() };
  const tx = contract.methods.deposit(input);
  sendTransaction(tx, setPendingTransaction, address);
};

const instantWithdrawFromExistingPosition = async (
  address, web3, amount, setPendingTransaction, emp,
) => {
  const contract = new web3.eth.Contract(EMP_ABI, emp.address);
  const amountScaled = amount * emp.collateral.decimals;
  const input = { rawValue: amountScaled.toString() };
  const tx = contract.methods.withdraw(input);
  sendTransaction(tx, setPendingTransaction, address);
};

const requestSlowWithdrawFromExistingPosition = async (
  address, web3, amount, setPendingTransaction, emp,
) => {
  const contract = new web3.eth.Contract(EMP_ABI, emp.address);
  const amountScaled = amount * emp.collateral.decimals;
  const input = { rawValue: amountScaled.toString() };
  const tx = contract.methods.requestWithdrawal(input);
  sendTransaction(tx, setPendingTransaction, address);
};

const completeSlowWithdrawFromExistingPosition = async (
  address, web3, setPendingTransaction, emp,
) => {
  const contract = new web3.eth.Contract(EMP_ABI, emp.address);
  const tx = contract.methods.withdrawPassedRequest();
  sendTransaction(tx, setPendingTransaction, address);
};

const approveCollateralTransfers = async (address, web3, setPendingTransaction, emp) => {
  const collateral = new web3.eth.Contract(ERC20_ABI, emp.collateral.address);
  const decimals = new web3.utils.BN(emp.collateral.decimals.toString());
  const allowanceAmount = new web3.utils.BN(1e10).mul(decimals).toString();
  const tx = collateral.methods.approve(emp.address, allowanceAmount);
  sendTransaction(tx, setPendingTransaction, address);
};

const approveTokenTransfers = async (address, web3, setPendingTransaction, emp) => {
  const token = new web3.eth.Contract(ERC20_ABI, emp.token.address);
  const decimals = new web3.utils.BN(emp.token.decimals.toString());
  const allowanceAmount = (new web3.utils.BN(1e10)).mul(decimals).toString();
  const tx = token.methods.approve(emp.address, allowanceAmount);
  sendTransaction(tx, setPendingTransaction, address);
};
const mintCarTokens = async (address, web3, collateral, tokens, setPendingTransaction, emp) => {
  const contract = new web3.eth.Contract(EMP_ABI, emp.address);
  const input1 = { rawValue: (collateral * emp.collateral.decimals).toString() };
  const input2 = { rawValue: (tokens * emp.token.decimals).toString() };
  contract.handleRevert = true;
  const tx = contract.methods.create(input1, input2);
  sendTransaction(tx, setPendingTransaction, address);
};

const redeemTokens = (address, web3, amount, setPendingTransaction, emp) => {
  const contract = new web3.eth.Contract(EMP_ABI, emp.address);
  const input = { rawValue: (amount * emp.token.decimals).toString() };
  const tx = contract.methods.redeem(input);
  sendTransaction(tx, setPendingTransaction, address);
};

const createWeb3 = (provider) => {
  const web3 = new Web3(provider);
  web3.eth.Contract.transactionConfirmationBlocks = CONFIRMATION_NUMBER;
  return web3;
};

export {
  fetchCurrentAddress,
  fetchENSName,
  createWeb3,
  mintCarTokens,
  depositToExistingPosition,
  approveCollateralTransfers,
  approveTokenTransfers,
  getIsCollateralApproved,
  instantWithdrawFromExistingPosition,
  requestSlowWithdrawFromExistingPosition,
  completeSlowWithdrawFromExistingPosition,
  getIsTokenApproved,
  redeemTokens,
};
