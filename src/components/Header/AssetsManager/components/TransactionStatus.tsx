import { ArrowDownOutlined, ArrowUpOutlined } from '@ant-design/icons'
import React, { HTMLAttributes } from 'react'
import styled from 'styled-components'
import { TransactionDirection, TransactionStatus } from '../api'

interface TransactionDirectionStatusProps extends HTMLAttributes<HTMLDivElement> {
  status: TransactionStatus
  direction: TransactionDirection
  width?: number
  height?: number
  filled?: boolean
}

const TransactionStatusIconWrapper = styled.div<{ status: string; width?: number; height?: number; filled?: boolean }>`
  display: inline-flex;
  border-radius: 50%;
  justify-content: center;
  align-items: center;
  padding: ${props => (props.width || 18) + 4};
  ${({ status, filled }) => {
    const color = status === TransactionStatus.Committed ? '#72D1A4' : '#FF9C72'

    if (filled) return `background: ${color}; color: #fff`
    return `color: ${color}; border: 4px solid ${color}`
  }}
`

export const TransactionStatusIcon: React.FC<TransactionDirectionStatusProps> = (
  props: TransactionDirectionStatusProps,
) => {
  const { status, direction, width, height, filled } = props

  return (
    <TransactionStatusIconWrapper filled={filled} status={status} width={width || height} height={height || width}>
      {(direction === 'in' && <ArrowDownOutlined style={{ fontSize: width || height }} translate="in" />) ||
        (direction === 'out' && <ArrowUpOutlined style={{ fontSize: width || height }} translate="out" />)}
    </TransactionStatusIconWrapper>
  )
}
