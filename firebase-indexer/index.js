const admin = require('firebase-admin');
const {
  ExpiringMultiPartyClient,
  Logger,
  Networker,
  createReferencePriceFeedForEmp,
  delay
} = require("@uma/financial-templates-lib")
const Web3 = require('web3');
const uma = require("@studydefi/money-legos/uma");
const serviceAccount = require("./serviceAccountKey.json");
const {
  deepEqual,
  myParseInt,
  myParseUrl,
  myParseAddress,
  getSponsors,
  getStats,
  pollSaveToDisk,
  pollUpdates,
  createTokenTradingPricePriceFeed
} = require("./helpers.js")
const DiscordTransport = require('winston-discord-transport').default; //It's an ES module or whatever
const options = require('./options-processing.js')

/*
* Setup constants
*/
const COLLATERAL_DECIMALS = options.collateralDecimals
const ONE_SECOND_DELAY = 1
let web3 = new Web3(options.node);

if (options.discordWebhook){
  Logger.add(
    new DiscordTransport({
      webhook: options.discordWebhook,
      defaultMeta: { service: 'sponsors_indexer' },
      level: 'warn'
    })
  );
}
Logger.on('finish', function (info) {
  process.exit()
});
const endProcess = () => {
    Logger.end()
}


admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://tendiesexchange-default-rtdb.firebaseio.com"
});
const db = admin.database();
const sponsorsDbRef = db.ref("sponsors").child(options.empAddress.toLowerCase());
const carDbRef = db.ref("car").child(options.empAddress.toLowerCase());
const empClient = new ExpiringMultiPartyClient(Logger, uma.expiringMultiParty.abi, web3, options.empAddress, options.collateralDecimals, options.tokenDecimals);
const getTime = () => Math.round(new Date().getTime() / 1000);

/*
* Start Server
*/
const main = async () => {
  Logger.debug("Starting Script");

  let priceIdentifierPriceFeed = null;
  let tradingPricePriceFeed = null;
  try {
    priceIdentifierPriceFeed = await createReferencePriceFeedForEmp(Logger, web3, new Networker(Logger), getTime, options.empAddress);
    tradingPricePriceFeed = await createTokenTradingPricePriceFeed(Logger, web3, new Networker(Logger), getTime, options.empAddress)
  } catch (e) {
    Logger.error(JSON.stringify(e));
    Logger.error("Price feed(s) failed to initialize ");
    endProcess();
  }

  pollUpdates(empClient.update.bind(empClient), Logger, web3, options.node, ONE_SECOND_DELAY, endProcess, 'Sponsor positions emp');
  pollUpdates(priceIdentifierPriceFeed.update.bind(priceIdentifierPriceFeed), Logger, web3, options.node, ONE_SECOND_DELAY, endProcess, 'Price identifier price');
  pollUpdates(tradingPricePriceFeed.update.bind(tradingPricePriceFeed), Logger, web3, options.node, ONE_SECOND_DELAY, endProcess, 'Token trading price');
  await delay(3 * ONE_SECOND_DELAY); //Avoid saving empty data to disk with this delay
  pollSaveToDisk(sponsorsDbRef, () => getSponsors(empClient, options.tokenDecimals, options.collateralDecimals), Logger, ONE_SECOND_DELAY, 'Sponsors Stats');
  pollSaveToDisk(carDbRef, () => getStats(empClient, priceIdentifierPriceFeed, tradingPricePriceFeed, options.tokenDecimals, options.collateralDecimals), Logger, ONE_SECOND_DELAY, 'Token Stats');
}

main()