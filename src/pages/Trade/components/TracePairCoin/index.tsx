import React from 'react'
import { useSelector } from 'react-redux'
import { TracePairLine } from './styled'
import { traceState } from '../../../../context/reducers/trace'

const TracePairCoin = () => {
  const currentPair = useSelector(({ trace }: { trace: traceState }) => trace.currentPair)

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

export default TracePairCoin
