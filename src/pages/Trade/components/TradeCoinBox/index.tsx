import React from 'react'
import { PairBox, PairSpace } from './styled'
import { PairList } from '../../../../constants'

interface IMenuListProps {
  pair: String
}

export const TradeCoinBox = (props: IMenuListProps) => {
  const coinBox = PairList.find(item => props.pair === item.name)
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
