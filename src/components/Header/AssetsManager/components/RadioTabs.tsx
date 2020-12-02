import React, { HTMLAttributes } from 'react'
import styled from 'styled-components'

interface RadioItemProps {
  key: string
  activated?: boolean
  mode?: 'button' | 'underline'
}

export const RadioItem = styled.div<RadioItemProps>`
  cursor: pointer;
  text-align: center;
  flex: 1;
  padding: 4px;
  color: #8286f1;
  display: inline-flex;
  justify-content: center;
  align-items: center;

  ${({ mode, activated }) => {
    if (activated && mode === 'underline') return `border-bottom: 4px solid #8286f1;`
    if (activated && mode === 'button') return `background: #8286F1; color: #ffffff;`
    if (mode === 'button') return `background:#edebfb`
    return ''
  }}
`

interface RadioTabsProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> {
  value?: string
  mode?: 'button' | 'underline'
  // eslint-disable-next-line
  onChange?: (selected: string) => void
}

const RadioWrapper = styled.div<{ mode?: 'button' | 'underline' }>`
  display: flex;
  ${({ mode }) => mode === 'underline' && `box-shadow: 3px 3px 8px 0 rgba(0, 0, 0, 0.08);`}
`

export const RadioTabs: React.FC<RadioTabsProps> = (props: RadioTabsProps) => {
  const { children, mode, onChange, value, ...trailProps } = props

  const count = React.Children.count(children)
  if (count <= 0) return null

  const radioItemChildren = React.Children.map(children, child => {
    if (!child || typeof child !== 'object' || !('key' in child) || !child.key || child.type !== RadioItem) {
      throw new Error('Children in RadioTabs must be RadioItem with key')
    }

    return React.cloneElement(child, {
      activated: child.key === value,
      mode: mode || 'button',
      onClick() {
        if (onChange) onChange(child.key as string)
      },
    })
  })

  return (
    <RadioWrapper {...trailProps} mode={mode}>
      {radioItemChildren}
    </RadioWrapper>
  )
}
