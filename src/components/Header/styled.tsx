import styled from 'styled-components'

export const HeaderBox = styled.div`
  width: 100%;
  overflow-x: scroll;
  margin: 0 auto;
  overflow: hidden;
  color: rgba(81, 119, 136, 1);
  border-bottom: 1px solid #ABD1E1;
`
export const MenuLiText = styled.span`
  font-weight: bolder;
  font-size: 16px;
`

export const HeaderPanel = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 50px;
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
  .ant-menu-horizontal 
    color: rgba(0,106,151,0.6);
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
  .collect-btn {
    color: #fff;
    background-color: #006A97;
    font-weight: 500;
    border-color: #006A97;
    border-radius: 10px;
  }
  .account-btn {
    width: 15px;
    display: inline-block;
    margin-left: 10px;
    cursor: pointer;
  }
`