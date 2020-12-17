import { Menu } from 'antd'
import React from 'react'
import { useHistory, useLocation } from 'react-router-dom'
import styled from 'styled-components'
import i18n from 'utils/i18n'

const NavigatorMenuWrapper = styled.div`
  box-shadow: 3px 3px 8px rgba(0, 0, 0, 0.08);

  .ant-menu {
    background-color: #5c61da;
    color: #ffffff;
    text-align: center;
  }
  .ant-menu-horizontal {
    border-bottom: none;
  }

  .ant-menu-horizontal:not(.ant-menu-dark) > .ant-menu-item:hover,
  .ant-menu-horizontal:not(.ant-menu-dark) > .ant-menu-submenu:hover,
  .ant-menu-horizontal:not(.ant-menu-dark) > .ant-menu-item-active,
  .ant-menu-horizontal:not(.ant-menu-dark) > .ant-menu-submenu-active,
  .ant-menu-horizontal:not(.ant-menu-dark) > .ant-menu-item-open,
  .ant-menu-horizontal:not(.ant-menu-dark) > .ant-menu-submenu-open,
  .ant-menu-horizontal:not(.ant-menu-dark) > .ant-menu-item-selected,
  .ant-menu-horizontal:not(.ant-menu-dark) > .ant-menu-submenu-selected {
    color: #ffffff;
    font-weight: 600;
    border-bottom: 4px solid #ffffff;
  }
`

export const NavigationMenu = () => {
  const { pathname } = useLocation()
  const history = useHistory()

  return (
    <NavigatorMenuWrapper>
      <Menu
        defaultSelectedKeys={[pathname.substring(1) || 'trade']}
        mode="horizontal"
        className="menu"
        onClick={e => history.push(`/${e.key}`)}
      >
        <Menu.Item key="trade">{i18n.t(`header.Trade`)}</Menu.Item>
        <Menu.Item key="pool">{i18n.t(`header.Pool`)}</Menu.Item>
        <Menu.Item key="match">{i18n.t(`header.Match`)}</Menu.Item>
      </Menu>
    </NavigatorMenuWrapper>
  )
}
