import React from 'react'
import { Popover } from 'antd'

const Popver = ({ visible, className }: { visible: boolean; className: string; handleClose?: () => void }) => {
  return <Popover visible={visible} className={className} />
}

export default Popver
