import styled from 'styled-components'
import BackGroundImage from '../../assets/svg/Component12.svg'

export const HeaderBox = styled.div`
  padding: 0 120px;
  max-width: 1440px;
  position:
  margin: 0 auto;
  background-color: #6b70e0;
  color: white;
  width: 100%;
  .bg-img {
    position: absolute;
    width: 100%;
    height: 340px;
    top: 0;
    background-image: url(${BackGroundImage});
    background-repeat: repeat;
    background-position: center;
    background-size: cover;
  }
`

export const HeaderContainer = styled.div`
  position: absolute;
  width: 100%;
  box-shadow: 3px 3px 8px 0 rgba(0, 0, 0, 0.08);
  background-color: #6b70e0;
  z-index: 1;
`

export const MenuLiText = styled.span`
  font-weight: bolder;
  font-size: 16px;
`

export const HeaderPanel = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 0 auto;
  background-color: #6b70e0;
  z-index: 2;
  position: relative;
  .ant-menu {
    background-color: #6b70e0;
    border-bottom: 1px solid transparent;
  }
  .ant-menu-item {
    color: white;
    border-bottom: 2px solid transparent;
    margin: 0 40px !important;
    &:hover {
      color: white !important;
      border-bottom: 2px solid white !important;
    }
    &.ant-menu-item-selected {
      color: white;
      border-bottom: 2px solid white;
    }
    .ant-menu-item-selected {
      color: white;
    }
  }
`

export const HeaderLogoBox = styled.h1`
  margin: 0 0 0 10px;
  font-family: Lato;
  font-size: 18px;
  font-weight: 800;
  font-stretch: normal;
  font-style: normal;
  line-height: normal;
  letter-spacing: normal;
  text-align: left;
  color: #ffffff;
  cursor: pointer;
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
    &:disabled {
      background-color: #006a97;
      &:hover {
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
      border-radius: 10px;
      margin: 0 10px;
    }
  }
`

export const Background = styled.div`
  position: absolute;
  width: 100%;
  height: 341px;
  top: 0;
  display: flex;
  flex-direction: row;

  .left {
    width: 50%;
    height: 341px;
    background: linear-gradient(180deg, #cb9fbb 0%, #f0ad79 100%);
  }

  .right {
    width: 50%;
    height: 341px;
    background: linear-gradient(180deg, #bcb1ff 0%, #c9bdff 100%);
  }
`
