/* eslint-disable react-hooks/rules-of-hooks */
const { useBabelRc, override } = require('customize-cra')

const config = override(useBabelRc())

module.exports = config
