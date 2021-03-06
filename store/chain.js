import ScatterJS from '@scatterjs/core'
import ScatterEOS from '@scatterjs/eosjs2'
import { configureScope } from '@sentry/browser'

import config from '../config'

ScatterJS.plugins(new ScatterEOS())

export const state = () => ({
  scatterConnected: true,
  oldScatter: false
})

export const actions = {
  async init({ state, commit, dispatch, rootGetters }) {
    console.log('Connect scatter..')
    await ScatterJS.connect(config.APP_NAME, { network: rootGetters['api/network'] }).then(v =>
      commit('setScatterConnected', v)
    )

    if (state.scatterConnected) {
      window.scatterConnected = true
      let scatterVersion
      await dispatch('login')

      try {
        scatterVersion = await ScatterJS.scatter.getVersion()
      } catch (e) {
        commit('setOldScatter', true)
        scatterVersion = 'Scatter as browser extention (Unmainteined)'
      } finally {
        configureScope(scope =>
          scope.setTag('scatter.version', scatterVersion)
        )
      }
    } else {
      await dispatch('init')
    }

    console.log('App starting..')
  },

  async logout({ commit }) {
    await ScatterJS.logout()
    commit('setUser', null, { root: true })
  },

  async login({ state, commit, dispatch }) {
    if (!state.scatterConnected)
      return this._vm.$notify({
        title: 'Login',
        message: 'Scatter is not connected',
        type: 'error'
      })

    try {
      const r = await ScatterJS.login()

      // TODO Проверить будет ли работать на мобилках
      //eos = ScatterJS.eos(network, Api, { rpc })

      configureScope(scope => scope.setUser({ username: r.accounts[0].name }))
      commit('setUser', r.accounts[0], { root: true })
      dispatch('loadUserBalances', {}, { root: true })
    } catch (e) {
      this._vm.$notify({ title: 'Login', message: e.message, type: 'error' })
    }
  },

  async scatterConnect({ commit, rootGetters }) {
    commit(
      'setScatterConnected',
      await ScatterJS.connect('Ordersbook', { network: rootGetters['api/network'] })
    )
  },

  transfer({ rootGetters, rootState }, { contract, actor, quantity, memo }) {
    return rootGetters['api/eos'].transact(
      {
        actions: [
          {
            account: contract,
            name: 'transfer',
            authorization: [
              {
                actor,
                permission: 'active'
              }
            ],
            data: {
              from: actor,
              to: rootState.network.contract,
              quantity,
              memo
            }
          }
        ]
      },
      { blocksBehind: 3, expireSeconds: 3 * 60 }
    )
  },

  cancelorder({ rootGetters, rootState }, { account, market_id, type, order_id }) {
    return rootGetters['api/eos'].transact(
      {
        actions: [
          {
            account: rootState.network.contract,
            name: type === 'bid' ? 'cancelbuy' : 'cancelsell',
            authorization: [
              {
                actor: account,
                permission: 'active'
              }
            ],
            data: { executor: account, market_id, order_id }
          }
        ]
      },
      { blocksBehind: 3, expireSeconds: 3 * 60 }
    )
  }
}

export const mutations = {
  setUser: (state, user) => {
    state.user = user
  },
  setScatterConnected: (state, value) => {
    state.scatterConnected = value
  },
  setOldScatter: (state, value) => {
    state.oldScatter = value
  }
}
