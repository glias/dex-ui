import React from 'react'
import { PageBox } from './styled'

export default ({ children, style }: { children: any; style?: object }) => {
  return <PageBox style={style}>{children}</PageBox>
}
