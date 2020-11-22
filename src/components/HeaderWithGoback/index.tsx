import React from 'react'
import { HeaderContainer } from './styled'
import { ReactComponent as BackSVG } from '../../assets/svg/back.svg'

export interface HeaderWithGobackProps {
  // eslint-disable-next-line
  onClick: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void
  title: string
}

const HeaderWithGoback = ({ onClick, title }: HeaderWithGobackProps) => {
  return (
    <HeaderContainer>
      <button type="button" onClick={onClick}>
        <BackSVG />
      </button>
      <span>{title}</span>
    </HeaderContainer>
  )
}

export default HeaderWithGoback
