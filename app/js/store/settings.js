import { DROPBOX } from '../storage/utils/index'
import log4js from 'log4js'

const logger = log4js.getLogger('store/settings.js')

const UPDATE_API = 'UPDATE_API'

export const DEFAULT_API = {
  apiCustomizationEnabled: true,
  nameLookupUrl: 'http://localhost:6270/v1/names/{name}',
  searchUrl: 'https://api.blockstack.com/v1/search?query={query}',
  registerUrl: 'http://localhost:6270/v1/names',
  addressLookupUrl: 'http://localhost:6270/v1/addresses/{address}',
  addressBalanceUrl: 'https://explorer.blockstack.org/insight-api/addr/{address}/?noTxList=1',
  utxoUrl: 'https://explorer.blockstack.org/insight-api/addr/{address}/utxo',
  broadcastTransactionUrl: 'https://explorer.blockstack.org/insight-api/tx/send',
  priceUrl: 'http://localhost:6270/v1/prices/names/{name}',
  networkFeeUrl: 'https://bitcoinfees.21.co/api/v1/fees/recommended',
  walletPaymentAddressUrl: 'http://localhost:6270/v1/wallet/payment_address',
  pendingQueuesUrl: 'http://localhost:6270/v1/blockchains/bitcoin/pending',
  coreWalletWithdrawUrl: 'http://localhost:6270/v1/wallet/balance',
  bitcoinAddressUrl: 'https://explorer.blockstack.org/address/{identifier}',
  ethereumAddressUrl: 'https://tradeblock.com/ethereum/account/{identifier}',
  pgpKeyUrl: 'https://pgp.mit.edu/pks/lookup?search={identifier}&op=vindex&fingerprint=on',
  hostedDataLocation: DROPBOX,
  coreAPIPassword: null,
  logServerPort: '',
  blockstackApiAppId: '470c9d0c7dbd41b1bb6defac9be3595a',
  blockstackApiAppSecret: 'c1e21c522cbd59c78b05294604f8bb88fc06fd7b1d7c3308e91f4f1124487117',
  s3ApiKey: '',
  s3ApiSecret: '',
  s3Bucket: '',
  dropboxAccessToken: null
}

function updateApi(api) {
  return {
    type: UPDATE_API,
    api: api
  }
}

function setAPICredentials(api, email, name, company, callback) {
  return dispatch => {
    const signupUrl = "https://api.blockstack.com/signup/browser"
    const headers = {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    }
    const body = JSON.stringify({
      email: email,
      name: name,
      company: company
    })

    fetch(signupUrl, { method: 'POST', headers: headers, mode: 'cors', body: body })
      .then((response) => response.text())
      .then((responseText) => JSON.parse(responseText))
      .then((responseJson) => {
        if (responseJson.hasOwnProperty('error')) {
          callback(false)
        } else {
          api.blockstackApiAppId = responseJson.app_id
          api.blockstackApiAppSecret = responseJson.app_secret

          dispatch(updateApi(api))

          callback(true)
        }
      })
      .catch((error) => {
        logger.error('setAPICredentials: error', error)
        callback(false)
      })
  }
}

function resetApi(api) {
  return dispatch => {
    dispatch(updateApi(Object.assign({}, DEFAULT_API, {
      dropboxAccessToken: api.dropboxAccessToken,
      coreAPIPassword: api.coreAPIPassword
    })))
  }
}

function addMissingApiKeys(newState) {
  logger.trace('addMissingApi')
  Object.keys(DEFAULT_API).forEach((key) => {
    if (newState.api[key] === undefined) {
      logger.debug(`State settings.api.${key} is missing. Adding & setting to default.`)
      newState.api[key] = DEFAULT_API[key]
    }
  })
  return newState
}

export const SettingsActions = {
  updateApi,
  resetApi,
  setAPICredentials
}

const initialState = {
  api: Object.assign({}, DEFAULT_API)
}

export function SettingsReducer(state = initialState, action) {
  switch (action.type) {
    case UPDATE_API:
      return Object.assign({}, state, {
        api: action.api || {}
      })
    default: {
      let newState = Object.assign({}, state, {
        api: state.api
      })
      newState = addMissingApiKeys(newState)
      return newState
    }
  }
}
