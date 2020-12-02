import { ButtonProps } from 'antd/lib/button'
import React from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'
import { Button as AntButton } from 'antd'

const ButtonWrapper = styled(AntButton)`
  display: inline-block;
  background: #5c61da;
  color: #fff;
  border-radius: 16px;
  text-align: center;
  cursor: pointer;
  transition: background 0.25s;
  width: ${props => (props.block ? '100%' : '100px')};
  border: none;
  outline: none;

  ${({ disabled, loading }) => {
    if (loading) return `background: #b8b9d6`
    if (disabled) return `color: #888; background: #ddd;`
    return `:hover { background: rgba(92, 97, 218, 0.6); color: #fff }`
  }}
`

export const Button: React.FC<ButtonProps> = (props: ButtonProps) => {
  const { children, loading } = props
  const { t } = useTranslation()

  const child = loading ? `${t('Loading')}...` : children

  return <ButtonWrapper {...props}>{child}</ButtonWrapper>
}
