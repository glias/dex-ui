import React from 'react'
import { PairSpace, PairBox } from './styled'
import { PairList } from '../../../../utils/const'

export const TradeCoinBox = ({ pair }: { pair: String }) => {
  const coinBox = PairList.find(item => pair === item.name)
  return (
    <PairBox>
      {coinBox ? (
        <PairSpace>
          <img src={coinBox.logo} alt="logo pair" />
          {coinBox.name}
        </PairSpace>
      ) : (
        ''
      )}
    </PairBox>
  )
}

export const PairTraceOption = () => {
  return (
    <PairBox>
      {PairList.map(item => (
        <li className="pairTraceList" key={item.name}>
          <TradeCoinBox pair={item.name} />
          <div className="decollect">/</div>
          <TradeCoinBox pair="CKB" />
        </li>
      )).slice(1)}
    </PairBox>
  )
}

export default PairTraceOption
