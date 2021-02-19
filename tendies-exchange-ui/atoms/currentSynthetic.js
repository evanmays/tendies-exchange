import { atom } from 'recoil';

const CAR_USDC_MAR21 = {
  address: '0x14a046c066266da6b8b8C4D2de4AfBEeCd53a262',
  collateral: {
    address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
    decimals: 1e6,
    symbol: 'USDC',
  },
  token: {
    address: '0x89337bfb7938804c3776c9fb921eccaf5ab76758',
    decimals: 1e18,
    symbol: 'CAR-USDC-MAR21',
    tradesite: {
      title: 'Uniswap',
      url: 'https://app.uniswap.org/#/swap?inputCurrency=0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48&outputCurrency=0x89337bfb7938804c3776c9fb921eccaf5ab76758',
    },
  },
  description: 'Compound Annualized Rate tokens are futures that tracks the expected '
                + 'average rates to borrow USDC on Compound during March. '
                + 'This token expires on March 28th',
  expiration: 'March 31st 2021',
  priceIdentifier: 'COMPUSDC-APR-FEB28/USDC',
  collateralRequirement: 1.25,
  invertLiquidationPrice: false,
  liquidationPriceUnits: 'USD/CAR',
  minimumMintAmount: 20,
};

const YD_WETH_MAR21 = {
  address: '0xe4256c47a3b27a969f25de8bef44eca5f2552bd5',
  collateral: {
    address: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
    decimals: 1e18,
    symbol: 'ETH',
  },
  token: {
    address: '0x90f802c7e8fb5d40b0de583e34c065a3bd2020d8',
    decimals: 1e18,
    symbol: 'YD-ETH-MAR21',
    tradesite: {
      title: 'Balancer',
      url: 'https://balancer.exchange/#/swap/0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48/0x90f802C7E8fb5D40B0De583e34C065A3bd2020D8',
    },
  },
  description: 'Yield dollars let you borrow or lend at fixed rates '
                + 'This token expires on March 31st. To learn more about how '
                + 'Yield Dollars work, read this medium post.',
  expiration: 'March 31st 2021',
  priceIdentifier: 'USDETH',
  collateralRequirement: 1.25,
  invertLiquidationPrice: true,
  liquidationPriceUnits: 'USD/ETH',
  minimumMintAmount: 100,
};

const ALL_EMPS = [CAR_USDC_MAR21];

const currentSyntheticAtom = atom({
  key: 'currentSynthetic',
  default: ALL_EMPS[0],
});

export { currentSyntheticAtom, ALL_EMPS };
