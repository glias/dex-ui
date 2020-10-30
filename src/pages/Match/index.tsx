import React from 'react'
import { MatchContainer } from './styled'
import i18n from '../../utils/i18n'

export default function MatchPage() {
  return (
    <MatchContainer>
      <div className="match-main">{i18n.t(`pool.comingSoon`)}</div>
    </MatchContainer>
  )
}
