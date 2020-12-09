import styled from 'styled-components'

function shadeColor(color: string, percent = 15) {
  let R = parseInt(color.substring(1, 3), 16)
  let G = parseInt(color.substring(3, 5), 16)
  let B = parseInt(color.substring(5, 7), 16)

  R = parseInt(((R * (100 + percent)) / 100).toString(), 10)
  G = parseInt(((G * (100 + percent)) / 100).toString(), 10)
  B = parseInt(((B * (100 + percent)) / 100).toString(), 10)

  R = R < 255 ? R : 255
  G = G < 255 ? G : 255
  B = B < 255 ? B : 255

  const RR = R.toString(16).length === 1 ? `0${R.toString(16)}` : R.toString(16)
  const GG = G.toString(16).length === 1 ? `0${G.toString(16)}` : G.toString(16)
  const BB = B.toString(16).length === 1 ? `0${B.toString(16)}` : B.toString(16)

  return `#${RR}${GG}${BB}`
}

export type HexString = string

export const ButtonContainer = styled.div`
  button {
    background-color: ${(props: { bgColor?: HexString }) => props.bgColor ?? '#5C61DA;'};
    box-shadow: 3px 3px 8px rgba(0, 0, 0, 0.08);
    border-radius: 16px;
    height: 56px;
    color: white;
    font-size: 18px;
    line-height: 22px;
    text-align: center;
    width: 100%;
    &.ant-btn-text {
      &.ant-btn-loading {
        color: white !important;
        background-color: ${(props: { bgColor?: HexString }) => `${shadeColor(props.bgColor ?? '#5C61DA')}!important`};
      }
      &.ant-btn {
        &:disabled {
          background-color: #ddd;
          color: #888;
        }
      }
      &:active {
        color: white;
        background-color: ${(props: { bgColor?: HexString }) => shadeColor(props.bgColor ?? '#5C61DA;')};
      }
      &:hover {
        color: white;
        background-color: ${(props: { bgColor?: HexString }) => shadeColor(props.bgColor ?? '#5C61DA;')};
      }
    }
    &.loading {
      opacity: 0.8;
    }
  }
`
