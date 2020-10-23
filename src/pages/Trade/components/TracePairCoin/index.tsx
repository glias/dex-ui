import React from 'react'
import {
  TracePairLine
} from './styled'

export default ({ currentPair }: { currentPair: String }) => {
  return (
    <TracePairLine>
    <span>{currentPair}</span>
    <span>
      <i
        className="ai-right-circle"
        style={{
          color: 'rgba(0, 106, 151, 1)',
        }}
      />
    </span>
    <span>CKB</span>
  </TracePairLine>
  )
}

