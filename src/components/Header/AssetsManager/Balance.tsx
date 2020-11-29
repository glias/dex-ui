import { Amount } from '@lay2/pw-core'
import BigNumber from 'bignumber.js'
import React from 'react'
import styled from 'styled-components'

interface BalanceStyleProps {
  size?: number
  unitSize?: number
}

interface BalanceFormatProps {
  type?: string
  fixedTo?: number
}

interface BalanceValueProps {
  value: BigNumber.Value | Amount
  decimal?: number
}

interface BalanceProps extends BalanceStyleProps, BalanceFormatProps, BalanceValueProps {}

const BalanceValue = styled.span<BalanceStyleProps>`
  font-size: ${props => (props.size ? `${props.size}px` : '')};
`
const BalanceUnit = styled.span<BalanceStyleProps>`
  margin-left: 4px;
  font-size: ${props => (props.unitSize ? `${props.unitSize}px` : '')};
  color: #888888;
`

export const Balance: React.FC<BalanceProps> = (props: BalanceProps) => {
  const { value, type, size, fixedTo, unitSize: propUnitSize, decimal: amount } = props
  const unitSize = propUnitSize || size

  const str = value instanceof Amount ? value.toString() : new Amount(value.toString(), amount ?? 0).toString()
  const balance = new BigNumber(str).toFormat(fixedTo)
  const unit = type && <BalanceUnit unitSize={unitSize}>{type}</BalanceUnit>

  return (
    <BalanceValue size={size}>
      <span>{balance}</span>
      <span>{unit}</span>
    </BalanceValue>
  )
}
