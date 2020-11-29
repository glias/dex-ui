import React from 'react'
import styled from 'styled-components'
import { TransactionStatus, TransferDirection } from '../api'

interface TransactionDirectionStatus {
  status: TransactionStatus
  direction: TransferDirection
}

const TransactionStatusIconWrapper = styled.div<{ status: string }>`
  border-radius: 50%;
  width: 18px;
  height: 18px;
  padding: 2px;
  display: flex;
  color: #fff;
  justify-content: center;
  align-items: center;
  background: ${({ status }) => {
    if (status === 'pending') return `#FF9C72`
    if (status === 'failed') return `#F35252`
    if (status === 'success') return `#72D1A4`
    return '#888'
  }};
`

export const TransactionStatusIcon: React.FC<TransactionDirectionStatus> = (props: TransactionDirectionStatus) => {
  const { status, direction } = props

  return (
    <TransactionStatusIconWrapper status={status}>
      {(direction === 'in' && '↓') || (direction === 'out' && '↑')}
    </TransactionStatusIconWrapper>
  )
}
