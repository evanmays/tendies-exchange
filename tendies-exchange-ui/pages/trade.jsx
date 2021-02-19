import React from 'react';
import { LayoutRow, LayoutBox } from '../components/Layout';
import { ALL_EMPS } from '../atoms/currentSynthetic';

export default function Trade() {
  const tokens = ALL_EMPS.map((emp) => (emp.token));
  return (
    <>
      <h1>Leaving Tendies Exchange</h1>
      <p>You are about to leave Tendies Exchange to trade on Uniswap</p>
      <LayoutRow>
        {
          tokens.map((token) => (
            <LayoutBox
              title={token.symbol}
              key={token.symbol}
              text={(
                <a href={token.tradesite.url}>
                  Go to&nbsp;
                  {token.tradesite.title}
                </a>
              )}
            />
          ))
        }
      </LayoutRow>
      <style jsx>
        {`
        * {
          display: flex;
          flex-direction: column;
          justify-content: flex-start;
          width: 100%;
          flex:1;
          align-items: center;
        }
        button {
          width:30%;
        }
      `}
      </style>
    </>
  );
}
