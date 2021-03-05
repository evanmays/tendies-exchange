
class UniswapPoolClient {
  constructor(
    logger,
    uniswapAbi,
    erc20Abi,
    web3,
    uniswapAddress,
    shouldUseTokenZero = True,
    blocks = {}
  ) {
    this.logger = logger;
    this.web3 = web3;

    // Create Uniswap contract
    this.uniswap = new web3.eth.Contract(uniswapAbi, uniswapAddress);

    this.erc20Abi = erc20Abi;

    this.uuid = `Uniswap-${uniswapAddress}`;

    this.shouldUseTokenZero = shouldUseTokenZero;

    // Helper functions from web3.
    this.toBN = this.web3.utils.toBN;
    this.toWei = this.web3.utils.toWei;
    this.blocks = blocks;

    // Random initializations
    this.events = [];
    this.fromBlock = 11500000; // Dec-22-2020
  }

  getCurrentLiquidity() {
    return this.currentLiquidity;
  }

  async update() {
    // Read token from Uniswap contract if not already cached:
    if (!this.tokenPrecision) {
      const [token0Address, token1Address] = await Promise.all([
        this.uniswap.methods.token0().call(),
        this.uniswap.methods.token1().call()
      ]);
      const token0 = new this.web3.eth.Contract(this.erc20Abi, token0Address);
      const token1 = new this.web3.eth.Contract(this.erc20Abi, token1Address);
      const [token0Precision, token1Precision] = await Promise.all([
        token0.methods.decimals().call(),
        token1.methods.decimals().call()
      ]);
      if (this.shouldUseTokenZero) {
        this.tokenPrecision = token0Precision;
        this.token = token0;
      } else {
        this.tokenPrecision = token1Precision;
        this.token = token1;
      }
    }

    const latestBlockNumber = (await this.web3.eth.getBlock("latest")).number;

    const events = (await this._getSortedSyncEvents(this.fromBlock))
    .map(event => (
      { blockNumber: event.blockNumber, currentLiquidity: this._getLiquidityFromSyncEvent(event) }
    )) // Note: blockNumber isn't unique per event. Some events may have the same block number.
    .filter(e => e.currentLiquidity !== null) // Filter out events where price is null.

    // Update internal state
    this.events = this.events.concat(events);

    // If there are still no prices, return null to allow the user to handle the absence of data.
    if (this.events.length === 0) {
      this.currentLiquidity = null;
      return;
    }


    // Liquidity at the end of the most recent block.
    this.currentLiquidity = this.events[this.events.length - 1].currentLiquidity;

    // On next update, start from one block after where this update ended
    this.fromBlock = this.events[this.events.length - 1].blockNumber + 1

    this.logger.debug({message: "Uniswap Pool state updated", lastUpdateLiquidity: this.currentLiquidity});
  }

  async _getSortedSyncEvents(fromBlock) {
    const events = await this.uniswap.getPastEvents("Sync", { fromBlock: fromBlock });

    // Primary sort on block number. Secondary sort on transactionIndex. Tertiary sort on logIndex.
    events.sort((a, b) => {
      if (a.blockNumber !== b.blockNumber) {
        return a.blockNumber - b.blockNumber;
      }

      if (a.transactionIndex !== b.transactionIndex) {
        return a.transactionIndex - b.transactionIndex;
      }

      return a.logIndex - b.logIndex;
    });

    return events;
  }

  _getLiquidityFromSyncEvent(event) {
    const reserve0 = this.toBN(event.returnValues.reserve0);
    const reserve1 = this.toBN(event.returnValues.reserve1);

    if (reserve1.isZero() || reserve0.isZero()) return null;

    const halfLiquidity = this.shouldUseTokenZero ? reserve0 : reserve1;
    const liquidity = halfLiquidity.mul(this.toBN("2"));
    return liquidity.toNumber() / Math.pow(10, this.tokenPrecision);
  }
}
module.exports = {default: UniswapPoolClient};
