import styled from 'styled-components'

export const TokenContainer = styled.span`
  display: inline-flex;
  flex-direction: row;
  align-items: center;
  .icon {
    background-color: ${props => props.color};
    height: 24px;
    width: 24px;
    border-radius: 4px;
    display: flex;
    justify-content: center;
    align-items: center;
    margin-right: 8px;
    img {
      max-width: 18px;
      max-height: 18px;
    }
  }
  &.small {
    .text {
      font-size: 20px;
      line-height: 24px;
      position: relative;
      top: 0;
    }
  }
  .text {
    font-size: 24px;
    font-weight: bold;
    line-height: 29px;
    color: #000000;
    position: relative;
    top: -1.5px;
  }
`
