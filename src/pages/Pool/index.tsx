import React from 'react'
import { PoolContainer } from './styled'
import i18n from '../../utils/i18n'

export default function PoolPage() {
  return (
    <PoolContainer>
      <div className="pool-main">{i18n.t(`pool.comingSoon`)}</div>
    </PoolContainer>
  )
}
