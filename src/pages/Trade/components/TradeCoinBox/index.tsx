import React from 'react'
import { PairBox, PairSpace } from './styled'
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
export default TradeCoinBox


