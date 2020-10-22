import React from 'react'
import { Popover as AntPopover } from 'antd'

const Popover = ({ visible, className }: { visible: boolean; className: string }) => {
  return <AntPopover visible={visible} className={className} />
}

export default Popover
