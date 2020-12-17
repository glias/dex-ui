import styled from 'styled-components'

export const HeaderBox = styled.div`
  display: inline-block;
  position: relative;
  margin: 0 auto;
  background-color: #6b70e0;
  color: white;
  width: 100%;
`

export const HeaderContainer = styled.div`
  text-align: center;
  position: absolute;
  width: 100%;
`

export const MenuLiText = styled.span`
  font-weight: bolder;
  font-size: 16px;
`

export const Banner = styled.div`
  background-color: #18191a;
  position: relative;
  width: 100%;
  margin: 0 auto;
  height: 60px;
  display: flex;
  justify-content: center;
  color: white;
  align-items: center;
  .content {
    div {
      text-align: center;
    }
    a {
      color: #5c61da;
      text-decoration: underline;
    }
    .close {
      cursor: pointer;
      position: absolute;
      top: 20px;
      right: 30px;
    }
  }
`

export const HeaderPanel = styled.div`
  max-width: 1440px;
  padding: 0 120px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 0 auto;
  background-color: #6b70e0;
  position: relative;
  .ant-menu {
    background-color: #6b70e0;
    border-bottom: 1px solid transparent;
  }
  .menu {
    .ant-menu-item {
      color: white;
      border-bottom: 2px solid transparent;
      margin: 0 40px;
      &.first {
        margin-left: 0;
      }
      &.right {
        margin-right: 0;
      }
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
  }
`

export const HeaderLogo = styled.h1`
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
  display: flex;
  align-items: center;
  svg {
    width: 32px;
    height: 32px;
  }
  .detail {
    font-size: 12px;
    margin-left: 4px;
  }
  .title {
    margin-left: 9px;
  }
`

export const UserMeta = styled.div`
  border-radius: 10px;
  padding: 8px 10px;
  display: inline-block;
  background: #fff;
  color: #6b70e0;
  cursor: pointer;
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
  .popover-wallet {
    box-shadow: 3px 3px 8px 0 rgba(0, 0, 0, 0.08);
  }

  .ant-popover-inner {
    border-radius: 16px;
  }

  .ant-popover-inner-content {
    padding: 0;
  }

  .btn-connect {
    border-radius: 10px;
    color: #6b70e0;
  }
`
