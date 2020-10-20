import styled from 'styled-components'

export const HeaderBox = styled.div`
  width: 100%;
  height: 60px; 
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
  max-width: 1400px;
  padding: 0 120px;
  box-size: border-box;
  line-height: 60px;
  font-size: 20px;
  .ant-menu-horizontal {
    line-height: 54px;
    border-bottom: none;
    color: rgba(0,106,151,0.6);
    .ant-menu-item-selected {
      color: rgba(0, 106, 151, 1);
    }
  }
`

export const HeaderLogoBox = styled.div`
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
  margin-right: 30px;
  .collect-btn {
    color: #006A97;
    font-weight: 500;
    border-color: #006A97;
    border-radius: 10px;
  }
  .account-btn {
    border-radius: 10px;
    width: 28px;
    height: 28px;
    display: inline-block;
    color: rgba(0, 106, 151, 1);
    border-color: rgba(0, 106, 151, 1);
    margin-left: 10px;
  }
`