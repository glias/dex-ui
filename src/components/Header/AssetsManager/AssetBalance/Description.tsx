import React, { ReactNode, HTMLAttributes } from 'react'
import styled from 'styled-components'

interface DescriptionProps extends HTMLAttributes<HTMLDivElement> {
  label: ReactNode
}

const DescriptionWrapper = styled.div`
  text-align: center;

  .description-label {
    white-space: nowrap;
    font-weight: bold;
    color: #888;
    font-size: 12px;
  }

  .description-child {
    font-size: 12px;
    padding: 4px;
  }
`

export const Description: React.FC<DescriptionProps> = (props: DescriptionProps) => {
  const { label, children } = props

  return (
    <DescriptionWrapper>
      <div className="description-label">{label}</div>
      <div className="description-child">{children}</div>
    </DescriptionWrapper>
  )
}
