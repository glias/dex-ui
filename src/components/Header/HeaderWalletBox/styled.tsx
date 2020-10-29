import styled from 'styled-components'

export const HeaderWalletBox = styled.div`
  width: 300px;
  overflow: hidden;
  .wallet-title {
    display: flex;
    justify-content: space-between;
    align-items: center;
    color: rgba(0, 0, 0, 1);
    padding: 10px 15px;
    font-size: 17px;
    img {
      width: 15px;
      height: 15px;
      cursor: pointer;
    }
  }
`
export const WalletList = styled.li`
  padding: 10px 0;
  .wallet {
    padding: 5px 15px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    color: rgba(136, 136, 136, 1);
    button {
      padding: 0;
      margin-left: 5px;
      position: relative;
      top: 1px;
      svg {
        width: 14px;
        height: 14px;
        path {
          fill: rgba(136, 136, 136, 1);
        }
      }
      &.question-btn {
        padding-top: 3px;
      }
    }
    .address {
      font-size: 14px;
    }
    img {
      width: 14px;
      margin-left: 10px;
    }
    .questionMark {
      width: 14px;
    }
  }
`
export const HeaderWallet = styled.div`
  box-sizing: border-box;
  padding: 0 10px;
  height: 40px;
  line-height: 40px;
  font-size: 14px;
  background: rgba(0, 106, 151, 1);
  color: #fff;
  text-align: center;
  button {
    float: right;
    width: 18px;
    height: 18px;
    cursor: pointer;
    margin-top: 12px;
    padding: 0;
    background: transparent;
    color: #fff;
  }
  span {
    height: 100%;
    color: #fff;
    line-height: 40px;
    display: inline-block;
  }
`
export const HeaderBox = styled.div`
  width: 100%;
  overflow-x: scroll;
  margin: 0 auto;
  overflow: hidden;
  color: rgba(81, 119, 136, 1);
  border-bottom: 1px solid #abd1e1;
`
export const MenuLiText = styled.span`
  font-weight: bolder;
  font-size: 16px;
`

export const HeaderPanel = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-size: border-box;
  font-size: 20px;
  .panel-nav {
    flex: 1;
    display: flex;
    justify-content: flex-start;
    align-items: center;
    h1 {
      margin: 0 20px 0 0;
    }
  }
  .ant-menu-horizontal {
    color: rgba(0, 106, 151, 0.6);
    border-bottom: 1px solid transparent;
    .ant-menu-item-selected {
      color: rgba(0, 106, 151, 1);
    }
  }
`

export const HeaderLogoBox = styled.h1`
  margin-left: 10px;
  font-weight: 900;
  font-size: 26px;
  color: #517788;
`
export const HeaderNavgationBox = styled.ul`
  display: flex;
  justify-content: center;
  flex: 1;
  align-items: center;
  margin-left: 50px;
`
export const UserMeta = styled.div`
  display: inline-block;
  font-size: 12px;
  > img {
    width: 20px;
    height: 20px;
    margin-right: 10px;
  }
`

export const HeaderMeta = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  .sidebarBox {
    .ant-popover-content {
      overflow: hidden;
      border-radius: 10px;
      border: 1px solid rgba(0, 106, 151, 1);
    }
    .ant-popover-inner-content {
      padding: 0;
      .sidebar-content {
        width: 150px;
        display: flex;
        flex-direction: column;
        .sidebar-title {
          line-height: 40px;
          height: 40px;
          text-align: center;
          background: rgba(0, 106, 151, 1);
          color: #fff;
        }
        button {
          margin: 5px 0;
        }
      }
    }
  }
  .popover-wallet-box {
    width: 300px;
    .wallet-list {
      display: flex;
      justify-content: space-between;
      align-items: center;
      height: 40px;
      color: rgba(136, 136, 136, 1);
      padding: 0 20px;
      span {
        display: flex;
        justify-content: center;
        align-items: center;
      }
      img {
        width: 15px;
        height: 15px;
        margin-left: 10px;
      }
    }
    .balances {
      h4 {
        color: rgba(0, 0, 0, 1);
        font-size: 17px;
      }
      .divider {
        wodth: 100%;
        border-top: 1px solid rgba(171, 209, 225, 1);
      }
      .balance-list {
        margin: 15px 0;
        display: flex;
        justify-content: center;
        align-items: flex-start;
        .logo img {
          width: 40px;
        }
        .wallet-info {
          flex: 1;
          padding: 0 10px;
          .ckb-main-box {
            display: flex;
            justify-content: space-between;
            border-bottom: 1px solid rgba(171, 209, 225, 1);
            margin-bottom: 5px;
            padding-bottom: 5px;
            .ckb-name {
              font-weight: 500;
            }
            .ckb-price {
              text-align: right;
            }
          }
          .ckb-use {
            display: flex;
            justify-content: space-between;
            font-size: 12px;
          }
          .balance-ckb {
            font-size: 12px;
            color: rgba(0, 0, 0, 1);
            border-top: 1px solid rgba(171, 209, 225, 1);
            padding-top: 4px;
            margin-top: 4px;
            .ckb-item {
              display: flex;
              justify-content: space-between;
              align-items: center;
              &:first-child {
                margin-top: 1px solid red;
              }
            }
          }
          .balance-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            .balance-name {
              color: rgba(0, 0, 0, 1);
              font-size: 14px;
              font-weight: 500;
            }
            .balance-price {
              display: flex;
              flex-direction: column;
              align-items: center;
              text-align: right;
              color: rgba(102, 102, 102, 1);
              font-size: 12px;
              .total-num {
                font-size: 14px;
                font-weight: 600;
                color: rgba(0, 0, 0, 1);
              }
            }
          }
        }
        .explorer {
          width: 30px;
          button {
            color: rgba(136, 136, 136, 1);
          }
        }
      }
    }
  }
  .collect-btn {
    color: #fff;
    background-color: #006a97;
    font-weight: 500;
    border-color: #006a97;
    border-radius: 10px;
  }
  .account-btn {
    width: 15px;
    display: inline-block;
    margin-left: 10px;
    cursor: pointer;
  }
  .wallet-box {
    font-size: 13px;
    img {
      width: 25px;
      margin-right: 10px;
    }
    button {
      border-color: rgba(0, 106, 151, 1);
      border-redius: 10px;
      margin: 0 10px;
    }
  }
`

export const WalletTrade = styled.div``
