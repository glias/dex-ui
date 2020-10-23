import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Button, Menu, Popover } from 'antd'
import { useHistory } from 'react-router-dom'
import { walletState } from '../../context/reducers/wallet'
import { CONNECT_WALLET } from '../../context/actions/types'
import metamask from '../../assets/img/wallet/metamask.png'
import i18n from '../../utils/i18n'
import { HeaderBox, HeaderPanel, HeaderLogoBox, MenuLiText, HeaderMeta } from './styled'

const HeaderContainer = () => {
  const dispatch = useDispatch()
  const walletConnectStatus = useSelector(({ wallet }: { wallet: walletState }) => wallet.walletConnectStatus)
  const currentSelectedAddress = useSelector(({ wallet }: { wallet: walletState }) => wallet.currentSelectedAddress)
  const history = useHistory()
  const walletBalance = (
    <div className="popover-wallet-box">
      {/* <div className="wallet-list"></div> */}
      <div className="balances">
        <h4>Balances</h4>
        <ul>
          <li>CKB</li>
        </ul>
      </div>
    </div>
  )
  const openSideBar = () => {}

  const handleConnect = () => {
    dispatch({
      type: CONNECT_WALLET,
      payload: {
        walletConnectStatus: 'success',
      },
    })
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
        <HeaderMeta id="header-meta">
          {!walletConnectStatus ? (
            <Button
              className="collect-btn"
              onClick={() => handleConnect()}
              style={{
                borderRadius: '10px',
              }}
            >
              {i18n.t('header.wallet')}
            </Button>
          ) : (
            <span className="wallet-box">
              <img src={metamask} alt="wallet type" />
              <span>{currentSelectedAddress}</span>
              <Popover
                placement="bottomRight"
                title=""
                content={walletBalance}
                trigger="click"
                getPopupContainer={() => document.getElementById('header-meta') as HTMLElement}
              >
                <Button size="middle">
                  <i className="ai-bars" />
                </Button>
              </Popover>
            </span>
          )}
          <Button
            onClick={() => openSideBar()}
            type="primary"
            style={{
              borderRadius: '10px',
            }}
          >
            <i className="ai-ellipsis" />
          </Button>
        </HeaderMeta>
      </HeaderPanel>
    </HeaderBox>
  )
}

export default HeaderContainer
