import React from 'react'
import styled from 'styled-components'
import { QuestionOutlined } from '@ant-design/icons'
import { BuiltinAssetType, BUILTIN_ASSETS, isBuiltinAssetType } from '../../../../constants/assets'

interface AssetStyleProps {
  size?: number | string
  /**
   * should show the asset icon, defaults to true
   */
  showIcon?: boolean
}

interface TypedAssetProps<T = string> {
  type: T
}

interface AssetProps extends AssetStyleProps, TypedAssetProps {}

const AssetWrapper = styled.span`
  display: inline-block;

  .icon {
    display: inline-flex;
    justify-content: center;
    align-items: center;
    margin-right: 4px;
    padding: 2px;
    background: #d9e8e2;
    border-radius: 4px;
    vertical-align: middle;
    text-align: center;
  }
`

interface BuiltinAssetProps extends AssetStyleProps, TypedAssetProps<BuiltinAssetType> {}

const BuiltinAsset: React.FC<BuiltinAssetProps> = (props: BuiltinAssetProps) => {
  const { size, type } = props
  const asset = BUILTIN_ASSETS[type]

  return (
    <AssetWrapper>
      <img className="icon" src={asset.icon} alt={asset.type} width={size} height={size} />
      {asset.type}
    </AssetWrapper>
  )
}

export const Asset: React.FC<AssetProps> = (props: AssetProps) => {
  const { type, size: propSize, showIcon } = props
  const size = `${propSize || 24}px`

  if (isBuiltinAssetType(type)) {
    const asset = BUILTIN_ASSETS[type]
    return <BuiltinAsset type={asset.type} size={size} showIcon={showIcon} />
  }

  return (
    <AssetWrapper>
      <span className="icon" style={{ width: size, height: size }}>
        <QuestionOutlined translate="unknown" />
      </span>
      {type}
    </AssetWrapper>
  )
}
