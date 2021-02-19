const usdcIcon = (
  <img
    src="/usdc.svg"
    alt="U.S.D.C. Logo"
    width={15}
    height={15}
  />
);

const TokenIcon = ({ symbol }) => {
  switch (symbol) {
    case 'USDC':
      return usdcIcon;
    case 'ETH':
      return <>Ξ</>;
    default:
      return <></>;
  }
};

export default TokenIcon;
