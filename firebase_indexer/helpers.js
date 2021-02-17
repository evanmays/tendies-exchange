const { delay, createPriceFeed } = require("@uma/financial-templates-lib");

const isObject = (object) => {
  return object != null && typeof object === 'object';
}

const deepEqual = (object1, object2) => {
  const keys1 = Object.keys(object1);
  const keys2 = Object.keys(object2);

  if (keys1.length !== keys2.length) {
    return false;
  }

  for (const key of keys1) {
    const val1 = object1[key];
    const val2 = object2[key];
    const areObjects = isObject(val1) && isObject(val2);
    if (
      areObjects && !deepEqual(val1, val2) ||
      !areObjects && val1 !== val2
    ) {
      return false;
    }
  }

  return true;
}

const config = {
  ["0xE4256C47a3b27a969F25de8BEf44eCA5F2552bD5".toLowerCase()]: {
    type: "balancer",
    balancerTokenIn: "0x90f802C7E8fb5D40B0De583e34C065A3bd2020D8",
    balancerTokenOut: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
    lookback: 1,
    twapLength: 1,//7200
    balancerAddress: "0x5e065d534d1daaf9e6222afa1d09e7dac6cbd0f7"
  },
  ["0x14a046c066266da6b8b8C4D2de4AfBEeCd53a262".toLowerCase()]: {
     type: "uniswap",
     uniswapAddress: "0xd8ecab1d50c3335d01885c17b1ce498105238f24",
     twapLength: 7200,
     lookback: 0
   },
  "0x0": { // example
    type: "uniswap",
    twapLength: 2, // Essentially turns the TWAP off since block times are >> 2 seconds.
    lookback: 0,//7200, //disabled we dont need it i think
    invertPrice: true,
    uniswapAddress: "0x0"
  }
}

const createTokenTradingPricePriceFeed = (logger, web3, networker, getTime, empAddress) => {
    return createPriceFeed(logger, web3, networker, getTime, config[empAddress.toLowerCase()]);
}

// If we don't want to use firebase, we can write to disk, then serve the disk
// file over nginx
const writeToDisk_BACKUP = (obj) => {
  const jsonString = JSON.stringify(obj, null, 4)
  fs.writeFile(FILE_PATH, jsonString, e => {
      if (e) {
          Logger.error(JSON.stringify(e));
      } else {
          Logger.debug("Successfully saving to disk");
      }
  });
}

const pollSaveToDisk = async (dbRef, getData, Logger, delayTime, key) => {
  let curr = {}
  let next = {}
  for (;;) {
    next = getData();
    if (!deepEqual(next, curr)) {
      dbRef.update(next);
      curr = next;
      Logger.debug(`Successfully ${key} saving to disk`);
    }
    await delay(delayTime);
  }
}

const pollUpdates = async (updateFunc, Logger, web3, node, delayTime, endProcess, key) => {
  for (;;) {
    try {
      await updateFunc();
    } catch (e) {
      Logger.error(JSON.stringify(e));
      Logger.error(`Failed to connect to node ${node} on key ${key}`);
      endProcess();
    }
    await delay(delayTime);
  }
}

const getSponsors = (empClient, tokenDecimals, collateralDecimals) => {
  const keyValueTuples = empClient.getAllPositions().map(item => [item.sponsor.toLowerCase(), {tokens: parseInt(item.numTokens)/Math.pow(10, tokenDecimals), collateral: parseInt(item.amountCollateral)/Math.pow(10, collateralDecimals)}]);
  return Object.fromEntries(keyValueTuples);
}

const getStats = (empClient, priceIdentifierPriceFeed, tradingPricePriceFeed, tokenDecimals, collateralDecimals) => {
  const empPrice = priceIdentifierPriceFeed.getCurrentPrice()?.toNumber() / Math.pow(10, collateralDecimals); //collateralDecimals instead of priceIdentifierPriceFeed.getPriceFeedDecimals()
  const totalMintedTokens = empClient.getAllPositions()
    .map(item => parseInt(item.numTokens))
    .map(a => a / Math.pow(10, tokenDecimals))
    .reduce((a, b) => a + b);
  const totalCollateralSupplied = empClient.getAllPositions()
    .map(item => parseInt(item.amountCollateral))
    .map(a => a / Math.pow(10, collateralDecimals))
    .reduce((a, b) => a + b);
  const globalRatio = empPrice ? totalCollateralSupplied / (empPrice * totalMintedTokens) : 0.0
  const tradingPrice = tradingPricePriceFeed.getCurrentPrice()?.toNumber() / Math.pow(10, collateralDecimals) || 0.0; //collateralDecimals instead of Math.pow(10, tradingPricePriceFeed.getPriceFeedDecimals())
  const stats = {
    globalRatio,
    empPrice, // from the UMIP price identifier
    tradingPrice, // from the market
    tradingPriceUnits: 'USD', // from the market, depends on what AMM pool is being used
    totalMintedTokens,
    totalCollateralSupplied,
    blockNumber: 0,
  }
  return stats;
}

module.exports = {deepEqual, writeToDisk_BACKUP, getSponsors, getStats, pollSaveToDisk, pollUpdates, createTokenTradingPricePriceFeed}
