import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Button, Menu, Popover, Tooltip } from 'antd'
import { useHistory } from 'react-router-dom'
import { walletState, balancesListType } from '../../context/reducers/wallet'
import { CONNECT_WALLET } from '../../context/actions/types'
import metamask from '../../assets/img/wallet/metamask.png'
import copypng from '../../assets/img/copy.png'
import toExplorer from '../../assets/img/toExplorer.png'
import i18n from '../../utils/i18n'
import { PairList } from '../../utils/const'
import { HeaderBox, HeaderPanel, HeaderLogoBox, MenuLiText, HeaderMeta } from './styled'

const HeaderContainer = () => {
  const dispatch = useDispatch()

  const { walletConnectStatus, currentSelectedAddress, addressList, balancesList, thirdPartyLinks } = useSelector(
    ({ wallet }: { wallet: walletState }) => wallet,
  )

  const truncatureStr = (str: string): string => {
    return str.length > 10 ? `${str.slice(0, 10)}...${str.slice(-10)}` : str
  }

  const balancesListWapper = balancesList.map(item => {
    const index: number = PairList.findIndex(pair => pair.name === item.name)

    return {
      ...item,
      logo: index >= 0 ? PairList[index].logo : null,
    }
  })

  const walletFlexBox = (item: balancesListType) => {
    if (item.name === 'CKB') {
      return (
        <>
          <div className="ckb-main-box">
            <div className="ckb-name">CKB</div>
            <div className="ckb-price">
              <div className="ckb-total">{item.total}</div>
              <div className="ckb-price">
                <span>$</span>
                {item.price}
              </div>
            </div>
          </div>
          <div className="ckb-use">
            <span>In Use</span>
            <span>{item.use}</span>
          </div>
          <div className="ckb-use">
            <span>Free</span>
            <span>{item.free}</span>
          </div>
        </>
      )
    }
    return (
      <div className="balance-item">
        <div className="balance-name">{item.name}</div>
        <div className="balance-price">
          <div className="total-num">{item.total}</div>
          <div className="price">
            <span>$</span>
            {item.price}
          </div>
        </div>
      </div>
    )
  }

  const history = useHistory()
  const walletBalance = (
    <div className="popover-wallet-box">
      {addressList.map(address => (
        <div className="wallet-list" key={address}>
          <span>
            <Tooltip placement="bottom" title={i18n.t('header.addressTooltip')}>
              {truncatureStr(address)}
            </Tooltip>
            <img src={copypng} alt="copy address" />
          </span>
          <i className="ai-question-circle-o" />
        </div>
      ))}
      <div className="balances">
        <h4>Balances</h4>
        <div className="divider" />
        <ul>
          {balancesListWapper.map(item => (
            <li key={item.name}>
              <div className="logo">{item.logo ? <img src={item.logo} alt="logo" /> : ''}</div>
              <div className="wallet-info">{walletFlexBox(item)}</div>
              <div className="explorer">
                <Button type="text" size="small">
                  <img src={toExplorer} alt="explorer" />
                </Button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
  const sideBarContent = (
    <div className="sidebar-content">
      <div className="sidebar-title">More</div>
      {thirdPartyLinks.map(item => (
        <Button type="text" onClick={() => window.open(item.link)} key={item.name}>
          {item.name}
        </Button>
      ))}
    </div>
  )

  const handleConnect = () => {
    setTimeout(() => {
      dispatch({
        type: CONNECT_WALLET,
        payload: {
          walletConnectStatus: 'success',
        },
      })
    }, 2000)
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
          {walletConnectStatus === 'unstart' ? (
            <Button
              className="collect-btn"
              onClick={() => handleConnect()}
              style={{
                borderRadius: '10px',
                marginRight: '10px',
              }}
            >
              {i18n.t('header.wallet')}
            </Button>
          ) : (
            <span className="wallet-box">
              <img src={metamask} alt="wallet type" />
              <span>{truncatureStr(currentSelectedAddress)}</span>
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
          <Popover
            placement="bottomRight"
            title=""
            content={sideBarContent}
            trigger="click"
            overlayClassName="sidebarBox no-arrorPoint"
            getPopupContainer={() => document.getElementById('header-meta') as HTMLElement}
          >
            <Button
              style={{
                borderRadius: '10px',
                background: 'rgba(0,106,151,1)',
                color: '#fff',
              }}
            >
              <i className="ai-ellipsis" />
            </Button>
          </Popover>
        </HeaderMeta>
      </HeaderPanel>
    </HeaderBox>
  )
}

export default HeaderContainer
