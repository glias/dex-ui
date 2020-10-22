import styled from 'styled-components'

export const PopoverBox = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 250px;
  button {
    width: 200px;
    height: 40px;
    line-height: 40px;
    text-align: center;
    border: 1px solid rgba(171, 209, 225, 1);
    border-radius: 10px;
    margin: 10px 0;
    cursor: pointer;
    color: rgba(102, 102, 102, 1);
    display: flex;
    align-items: center;
    justify-content: center;
    img {
      width: 19px;
      height: 19px;
      margin-right: 10px;
    }
  }
`
export const ConnectList = styled.span`
  display: inline;
`
