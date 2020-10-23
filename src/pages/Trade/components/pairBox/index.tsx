import React from 'react'
import { PairBox } from './styled'
import { PairList } from '../../../../utils/const'
import TradeCoinBox from '../TracePairCoin'

export const PairTraceOption = () => {
  return (
    <PairBox>
      {PairList.map(item => (
        <li className="pairTraceList" key={item.name}>
          <TradeCoinBox />
          <div className="decollect">/</div>
          <TradeCoinBox />
        </li>
      )).slice(1)}
    </PairBox>
  )
}

export default PairTraceOption
