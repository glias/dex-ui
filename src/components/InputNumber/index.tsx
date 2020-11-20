import React from 'react'
import { Input } from 'antd'
import { InputProps } from 'antd/lib/input'
import { InputContainer } from './styled'

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default function InputNumber({ children: _, ...props }: InputProps) {
  return (
    <InputContainer>
      <Input {...props} />
    </InputContainer>
  )
}
