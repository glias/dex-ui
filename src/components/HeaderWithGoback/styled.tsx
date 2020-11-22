import styled from 'styled-components'

export const HeaderContainer = styled.div`
  text-align: center;
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  color: #000;
  button {
    float: left;
    color: #fff;
    position: absolute;
    top: 0;
    left: 0;
    background: none;
    border: none;
    color: black;
    cursor: pointer;
    &:focus {
      outline: none;
      box-shadow: none;
    }
  }
  span {
    display: inline-block;
    font-size: 18px;
    line-height: 22px;
    font-weight: bold;
  }
`
