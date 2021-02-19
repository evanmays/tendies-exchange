// Most math comes from this formula

/*
* Collaterlization Ratio
*
*     =    total value of collateral in position
*           --------------------------------
*           total value of tokens in position
*
*
*     =     collateral * USD per Collateral
*          --------------------------------
*               tokens * USD per token
*
*

* since the price identifier of XY is X measured in Y
* for COMPUSDC-APR-FEB28/USDC it is the APR measured in USDC.
* This is number of USDC collateral tokens per 1 APR synth token
* The price variable we pass in to these functions is the # of collateral tokens per synth token

* now, we know
*      (USD per token) / (USD per Collateral) = Collateral tokens per synth token = price

* Back to our starting equation.
*     =         collateral
*          -----------------------
*             tokens * price

* put another way, our formula is Collaterlization Ratio * tokens * price = collateral

*/
const getCollateralizationRatio = (collateral, tokens, price) => collateral / (price * tokens);

const getTokenAmount = (collateral, ratio, price) => collateral / (price * ratio);

const getCollateralAmount = (tokens, ratio, price) => ratio * price * tokens;

/*
* What price will make our ratio < collateralRequirement (often 1.25)
* Algebra:
* ratio = collateral / (price * tokens) < collateralRequirement
* collateral / tokens < price * collateralRequirement
* collateral / (tokens * collateralRequirement) < price
*/
const getLiquidationPrice = (tokens, collateral, collateralRequirement, invertLiquidationPrice) => {
  const liqPrice = collateral / (tokens * collateralRequirement);
  return invertLiquidationPrice
    ? 1 / liqPrice
    : liqPrice;
};

export {
  getCollateralizationRatio, getTokenAmount, getCollateralAmount, getLiquidationPrice,
};
