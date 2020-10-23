import React from 'react'
import { useHistory } from 'react-router-dom'
import { connect } from 'react-redux'
import { Button, Popover, Menu, Badge } from 'antd'
import popoverContent from './HeaderPopoverContent'
import walletBox from './HeaderWalletBox'
import i18n from '../../utils/i18n'
import MetaMaskpng from '../../assets/img/wallet/metamask.png'
import outlined from '../../assets/img/outlined.png'
import { HeaderBox, HeaderPanel, HeaderLogoBox, MenuLiText, HeaderMeta, UserMeta } from './styled'

const mapStateToProps = (state: State.WalletState) => {
  return {
    ...state,
  }
}

export default connect(mapStateToProps)(
  ({
    walletConnectStatus,
    currentSelectedAddress,
  }: {
    walletConnectStatus: string
    currentSelectedAddress: string
  }) => {
    const history = useHistory()

    const truncatureStr = (str: string): string => {
      return str?.length >= 5 ? `${str.slice(0, 5)}...${str.slice(-5)}` : ''
    }

    return (
      <HeaderBox className="header-box">
        <HeaderPanel>
          <div className="panel-nav">
            <HeaderLogoBox>CKB DEX</HeaderLogoBox>
            <Menu mode="horizontal" onClick={e => history.push(`/${e.key}`)}>
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
          </div>
          <HeaderMeta id="headerMeta">
            {walletConnectStatus !== 'success' ? (
              <Popover placement="bottomRight" trigger="click" content={popoverContent}>
                <Button className="collect-btn">{i18n.t('header.wallet')}</Button>
              </Popover>
            ) : (
              <>
                <UserMeta>
                  <img src={MetaMaskpng} alt="metaMask" />
                  {truncatureStr(currentSelectedAddress)}
                </UserMeta>
                <Popover
                  placement="bottomRight"
                  title=""
                  overlayClassName="no-arrorPoint"
                  trigger="click"
                  content={walletBox}
                >
                  <Badge count="">
                    <img src={outlined} alt="account" className="account-btn" />
                    {/* <Button className="account-btn" icon={ <AlignCenterOutlined /> }></Button> */}
                  </Badge>
                </Popover>
              </>
            )}
          </HeaderMeta>
        </HeaderPanel>
      </HeaderBox>
    )
  },
)
