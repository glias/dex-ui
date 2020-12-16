import { ArrowDownOutlined, ArrowUpOutlined, QuestionOutlined } from '@ant-design/icons'
import Icon from '@ant-design/icons/es/components/Icon'
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

const PendingSvg = () => (
  <svg viewBox="0 0 61 61" width="1em" height="1em" fill="currentColor">
    <path d="M24.6172 49.2376L25.7587 49.5494C27.6735 50.0091 29.6444 50.1687 31.5969 50.0295L32.3804 60.9105L30.7999 60.9818C27.636 61.0415 24.463 60.6038 21.408 59.6664L24.6172 49.2376ZM42.2728 45.8056L49.1525 54.2733L47.8701 55.2615C45.2642 57.1596 42.4184 58.5871 39.4515 59.542L36.0962 49.1595L37.1889 48.7709C38.9935 48.0664 40.7113 47.0775 42.2728 45.8056ZM15.1664 42.7149L15.7312 43.4049C16.1201 43.858 16.5336 44.2969 16.9718 44.72C18.0427 45.7542 19.2033 46.6381 20.4276 47.3723L14.827 56.7368L13.6844 56.0161C12.1778 55.0175 10.7406 53.868 9.39367 52.5674C8.36062 51.5698 7.41462 50.5159 6.55584 49.4154L15.1664 42.7149ZM8.65322 10.1475C20.1627 -1.77095 39.1547 -2.10246 51.0731 9.40701L54.8777 5.46723L55.2186 20.9492L39.7342 21.1488L43.495 17.2543L42.7711 16.5898C35.1599 9.95053 23.5959 10.3781 16.5006 17.7255C10.9256 23.4986 9.71634 31.8797 12.8016 38.7838L2.84303 43.2446L2.3804 42.152C-1.8741 31.5206 0.183089 18.9185 8.65322 10.1475Z" />
  </svg>
)

// @ts-ignore
const PendingIcon: typeof Icon = props => <Icon {...props} component={PendingSvg} translate="pending" />

const TransactionStatusIconWrapper = styled.div<{
  direction: TransactionDirection
  status: string
  width?: number
  height?: number
  filled?: boolean
}>`
  display: inline-flex;
  border-radius: 50%;
  justify-content: center;
  align-items: center;
  padding: 3px;
  ${({ status, filled, direction }) => {
    let color: string = ''
    if (status !== TransactionStatus.Committed) color = '#FF9C72'
    else if (direction === TransactionDirection.In) color = '#72D1A4'
    else color = '#57C2FF'

    if (filled) return `background: ${color}; color: #fff`
    return `color: ${color}; border: 4px solid ${color}`
  }};
`

export const TransactionStatusIcon: React.FC<TransactionDirectionStatusProps> = (
  props: TransactionDirectionStatusProps,
) => {
  const { status, direction, width = 18, height = 18, filled } = props

  let IconComponent = QuestionOutlined
  if (status !== TransactionStatus.Committed) IconComponent = PendingIcon
  else if (direction === TransactionDirection.In) IconComponent = ArrowDownOutlined
  else if (direction === TransactionDirection.Out) IconComponent = ArrowUpOutlined

  return (
    <TransactionStatusIconWrapper
      direction={direction}
      filled={filled}
      status={status}
      width={width || height}
      height={height || width}
    >
      <IconComponent style={{ fontSize: `${(width || height) - 6}px` }} translate={direction} />
    </TransactionStatusIconWrapper>
  )
}
