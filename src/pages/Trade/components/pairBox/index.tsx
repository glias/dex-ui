import React from 'react'
import { PairSpace, PairBox } from './styled'
import { PairList } from '../../../../utils/const'

export const TradeCoinBox = ({ pair }: { pair: String }) => {
  let coinBox = PairList.find((item => pair === item.name))
  return (
    <PairBox>
      {
        coinBox ? (
          <PairSpace>
            <img src={coinBox.logo} alt="logo pair" />
            {coinBox.name}
          </PairSpace>
        ) : ''
      }
    </PairBox>
  )
}

export const PairTraceOption = () => {
  return (
    <PairBox>
      {PairList.map((item, index) => (
        <li className="pairTraceList" key={item.name}>
          <TradeCoinBox key={index} pair={item.name}></TradeCoinBox>
          <div className="decollect">/</div>
          <TradeCoinBox pair="CKB"></TradeCoinBox>
        </li>
      )).slice(1)}
    </PairBox>
  )
}

export default PairTraceOption
