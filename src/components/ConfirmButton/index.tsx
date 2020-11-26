import React from 'react'
import { Button } from 'antd'
import { ButtonContainer } from './styled'

export interface ConfirmButtonProps {
  bgColor?: string
  text: string
  disabled?: boolean
  // eslint-disable-next-line
  onClick?: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void
  loading?: boolean
  htmlType?: 'button' | 'submit' | 'reset'
}

export default function ConfirmButton({
  bgColor,
  text,
  disabled = false,
  onClick,
  loading,
  htmlType = 'submit',
}: ConfirmButtonProps) {
  return (
    <ButtonContainer bgColor={bgColor}>
      <Button htmlType={htmlType} size="large" type="text" disabled={disabled} onClick={onClick} loading={loading}>
        {text}
      </Button>
    </ButtonContainer>
  )
}
