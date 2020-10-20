
import React from 'react'
import popoverContent from './HeaderPopoverContent'
import walletBox from './HeaderWalletBox'
import i18n from '../../utils/i18n'
import { useAppState } from '../../contexts/providers'
import MetaMaskpng from '../../assets/img/wallet/metamask.png'
import { 
  HeaderBox,
  HeaderPanel,
  HeaderLogoBox, 
  MenuLiText,
  HeaderMeta,
  UserMeta,
} from './styled'
import { 
  Button, 
  Popover, 
  Menu, 
  Badge 
} from 'antd'
import {
  AlignCenterOutlined
} from '@ant-design/icons'

export default () => { 
  const { 
    app: { 
      hasConnectWallet,
      address
    } 
  } = useAppState()

  const truncatureStr = (str: string): string => {
    return str.slice(0, 5) + '...' + str.slice(-5)
  }

  return ( 
    <HeaderBox className="header-box">
      <HeaderPanel>
        <HeaderLogoBox>CKB DEX</HeaderLogoBox>
        <Menu mode="horizontal">
          <Menu.Item key="trade">
            <MenuLiText>{i18n.t(`header.Trade`)}</MenuLiText>
          </Menu.Item>
          <Menu.Item key="pool">
            <MenuLiText>{i18n.t(`header.Pool`)}</MenuLiText>
          </Menu.Item>
          <Menu.Item key="match">
            <MenuLiText>{i18n.t(`header.Match`)}</MenuLiText>
          </Menu.Item>
        </Menu>
        <HeaderMeta id="headerMeta">
          { !hasConnectWallet ? (
            <Popover 
              placement="bottomRight"  
              trigger="click" 
              content={ popoverContent } 
              className="arrowPopver xxx"
            >
              <Button className="collect-btn">
                {i18n.t('header.wallet')}
              </Button>
            </Popover>
            ) : (
              <>
                <UserMeta>
                  <img src={ MetaMaskpng } alt="metaMask" />
                  {truncatureStr(address)}
                </UserMeta>
                <Popover 
                  placement="bottomRight" 
                  title="" 
                  overlayClassName="no-arrorPoint"
                  trigger="click" 
                  content={ walletBox }
                >
                  <Badge count="">
                    <Button className="account-btn" icon={ <AlignCenterOutlined /> }></Button>
                  </Badge>
                </Popover>
              </>
            )
          }
        </HeaderMeta>
      </HeaderPanel>
    </HeaderBox>
  )
}
