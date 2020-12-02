import { Amount } from '@lay2/pw-core'
import BigNumber from 'bignumber.js'
import React from 'react'
import styled from 'styled-components'

interface BalanceStyledProps {
  size?: number
  unitSize?: number
}

export interface BalanceProps extends BalanceStyledProps {
  value: BigNumber.Value | Amount
  decimal?: number
  type?: string
  fixedTo?: number
}

const BalanceWrapper = styled.div<Required<BalanceStyledProps>>`
  display: inline-block;
  font-size: ${props => `${props.size}px`};

  .balance-value {
  }

  .balance-decimals {
    font-size: 80%;
    color: #aaa;
  }

  .balance-unit {
    margin-left: 4px;
    color: #888888;
    font-size: ${props => `${props.unitSize}px`};
  }
`

export const Balance: React.FC<BalanceProps> = (props: BalanceProps) => {
  const { value, type, size = 14, fixedTo, unitSize = 14, decimal = 0 } = props

  const balance = new BigNumber(value instanceof Amount ? value.toString() : value)
    .div(10 ** decimal)
    .abs()
    .toFormat(fixedTo)

  const [integers, decimals] = balance.split('.')

  const balanceNode = (
    <>
      <span className="balance-value">{integers}</span>
      {decimals && '.'}
      {decimals && <small className="balance-decimals">{decimals}</small>}
    </>
  )

  const unitNode = type && <span className="balance-unit">{type}</span>

  return (
    <BalanceWrapper size={size} unitSize={unitSize}>
      {balanceNode}
      {unitNode}
    </BalanceWrapper>
  )
}
