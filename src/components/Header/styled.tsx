import styled from 'styled-components'

export const HeaderBox = styled.div`
  padding: 0 120px;
  color: rgba(81, 119, 136, 1);
  .header-col-menu {
    display: flex;
    justify-content: space-between;
    .ant-menu {
      border-bottom: none;
      line-height: 51px;
      .ant-menu-item {
        color: rgba(0, 106, 151, 0.6);
        border-bottom: 2px solid transparent;
        &: hover {
          color: rgba(0, 106, 151, 1);
          border-bottom: 2px solid rgba(0, 106, 151, 1);
        }
        &.ant-menu-item-selected {
          color: rgba(0, 106, 151, 1);
          border-bottom: 2px solid rgba(0, 106, 151, 1);
        }
        .ant-menu-item-selected {
          color: rgba(0, 106, 151, 1);
        }
      }
    }
  }
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
  margin: 0 auto;
  max-width: 1440px;
  h1 {
    margin: 0 20px 0 0;
  }
  .ant-menu {
    border-bottom: 1px solid transparent;
  }
  .ant-menu-item {
    color: rgba(0, 106, 151, 0.6);
    border-bottom: 2px solid transparent;
    &: hover {
      color: rgba(0, 106, 151, 1);
      border-bottom: 2px solid rgba(0, 106, 151, 1);
    }
    &.ant-menu-item-selected {
      color: rgba(0, 106, 151, 1);
      border-bottom: 2px solid rgba(0, 106, 151, 1);
    }
    .ant-menu-item-selected {
      color: rgba(0, 106, 151, 1);
    }
  }
`

export const HeaderLogoBox = styled.h1`
  margin: 0 0 0 10px;
  font-weight: 900;
  font-size: 26px;
  color: #517788;
  line-height: 53px;
  cursor: pointer;
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
  margin-right: 10px;
  > img {
    width: 20px;
    height: 20px;
    margin-right: 10px;
  }
`
export const ButtonSvgBox = styled.div`
  svg {
    width: 100%;
    height: 100%;
    fill: ${props => props.color};
    rect {
      fill: ${props => props.color};
    }
    path {
      fill: ${props => props.color};
    }
  }
`
export const ButtonWalletSvgBox = styled.div`
  margin-left: -2px;
  width: 16px;
  height: 13px;
  border-radius: 10px;
  margin-top: -5px;
  svg {
    width: 100%;
    height: 100%;
    fill: ${props => props.color};
    rect {
      fill: ${props => props.color};
    }
    path {
      fill: ${props => props.color};
    }
  }
`

export const HeaderMeta = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  .more-btn {
    border-radius: 10px;
    background: rgba(0, 106, 151, 1);
    color: #fff;
    margin-left: 5px;
    width: 28px;
    height: 28px;
    text-align: center;
    padding: 0;
  }
  .ant-popover-content {
    overflow: hidden;
    border-radius: 10px;
    border: 1px solid rgba(0, 106, 151, 1);
  }
  .btn-meta {
    width: 28px;
    height: 28px;
    padding: 4px 7px;
    background: rgba(0, 106, 151, 1);
    color: #fff;
    border-radius: 10px;
    border: 1px solid rgba(0, 106, 151, 1);
  }
  .ant-popover-content {
    padding: 0;
    border-radius: 10px;
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
  .popover-wallet-box {
    width: 300px;
    .wallet-list {
      display: flex;
      justify-content: space-between;
      align-items: center;
      height: 40px;
      color: rgba(136, 136, 136, 1);
      padding: 0 10px;
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
      ul > li {
        margin: 10px 0;
        padding: 0 10px;
        display: flex;
        justify-content: center;
        align-items: center;
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
              font-weight: 600;
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
          .balance-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            .balance-name {
              color: rgba(0, 0, 0, 1);
              font-size: 14px;
              font-weight: 600;
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
        .explorer img {
          width: 15px;
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
    &: disabled {
      background-color: #006a97;
      &: hover {
        color: #fff;
      }
    }
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
