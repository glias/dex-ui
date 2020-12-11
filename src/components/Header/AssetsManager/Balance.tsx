import { Amount } from '@lay2/pw-core'
import BigNumber from 'bignumber.js'
import React from 'react'
import styled from 'styled-components'

interface BalanceStyledProps {
  size?: number
  unitSize?: number
}

// interface FixedTo {
//   decimalPlaces: number
// }

// function isFixedToConfig(x: unknown): x is FixedTo {
//   return typeof x === 'object'
// }

export interface BalanceProps extends BalanceStyledProps {
  value: BigNumber.Value | Amount
  decimal?: number
  suffix?: string
  /**
   * max decimal places, defaults to 4
   */
  maxDecimalPlaces?: number
}

const BalanceWrapper = styled.div<Required<BalanceStyledProps>>`
  display: inline-block;
  font-size: ${props => `${props.size}px`};

  .balance-value {
  }

  .balance-decimals {
    font-size: 80%;
    color: #666;
  }

  .balance-unit {
    margin-left: 4px;
    color: #888888;
    font-size: ${props => `${props.unitSize}px`};
  }
`

export const Balance: React.FC<BalanceProps> = (props: BalanceProps) => {
  const { value, suffix: type, size = 14, maxDecimalPlaces: fixedTo, unitSize = 14, decimal = 0 } = props

  const balanceNum = new BigNumber(value instanceof Amount ? value.toString() : value).div(10 ** decimal).abs()
  const decimalPlaces = balanceNum.decimalPlaces()
  const balance: string = (() => {
    if (fixedTo !== undefined) return balanceNum.toFormat(Math.min(fixedTo, decimalPlaces))
    if (decimalPlaces >= 4) return balanceNum.toFormat(4)
    return balanceNum.toFormat()
  })()

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
