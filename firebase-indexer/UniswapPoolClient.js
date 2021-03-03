
class UniswapPoolClient {
  constructor(
    logger,
    uniswapAbi,
    erc20Abi,
    web3,
    uniswapAddress,
    getTime,
    shouldUseTokenZero = True,
    blocks = {}
  ) {
    this.logger = logger;
    this.web3 = web3;
    this.getTime = getTime;

    // Create Uniswap contract
    this.uniswap = new web3.eth.Contract(uniswapAbi, uniswapAddress);

    this.erc20Abi = erc20Abi;

    this.uuid = `Uniswap-${uniswapAddress}`;

    this.shouldUseTokenZero = shouldUseTokenZero;

    // Helper functions from web3.
    this.toBN = this.web3.utils.toBN;
    this.toWei = this.web3.utils.toWei;
    this.blocks = blocks;
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

    const currentTime = await this.getTime();
    const latestBlockNumber = (await this.web3.eth.getBlock("latest")).number;

    const fromBlock = 11500000; // Dec-22-2020

    const events = await this._getSortedSyncEvents(fromBlock).then(newEvents => {
      // Grabs the timestamps for all blocks, but avoids re-querying by .then-ing any cached blocks.
      return Promise.all(
        newEvents.map(event => {
          // If there is nothing in the cache for this block number, add a new promise that will resolve to the block.
          if (!this.blocks[event.blockNumber]) {
            this.blocks[event.blockNumber] = this.web3.eth
              .getBlock(event.blockNumber)
              .then(block => ({ timestamp: block.timestamp, number: block.number }));
          }

          // Add a .then to the promise that sets the timestamp (and price) for this event after the promise resolves.
          return this.blocks[event.blockNumber].then(block => {
            event.timestamp = block.timestamp;
            event.currentLiquidity = this._getLiquidityFromSyncEvent(event);
            return event;
          });
        })
      );
    });

    // If there are still no prices, return null to allow the user to handle the absence of data.
    if (events.length === 0) {
      this.currentLiquidity = null;
      this.events = [];
      return;
    }

    // Filter out events where price is null.
    this.events = events.filter(e => e.price !== null);

    // Liquidity at the end of the most recent block.
    this.currentLiquidity = this.events[this.events.length - 1].currentLiquidity;

    this.lastUpdateTime = currentTime;
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
