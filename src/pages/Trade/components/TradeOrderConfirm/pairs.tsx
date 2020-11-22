import React from 'react'
import Token from 'components/Token'
import { PairsContainer } from './styled'
import { ReactComponent as PairArrow } from '../../../../assets/svg/pair-arrow.svg'

export const Pairs = ({ pairs }: { pairs: [string, string] }) => {
  const [p1, p2] = pairs
  return (
    <PairsContainer>
      <div className="pairs">
        <Token tokenName={p1} />
        <span className="svg">
          <PairArrow />
        </span>
        <Token tokenName={p2} />
      </div>
    </PairsContainer>
  )
}
