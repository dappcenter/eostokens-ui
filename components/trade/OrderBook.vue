<template lang="pug">
.overflowbox.no-bottom-border
  .blist
    .ltd.d-flex.justify-content-around
      span Price ({{ network.baseToken.symbol }})
      span Amount({{ token.symbol.name }})
      span Total ({{ network.baseToken.symbol }})

  .orders-list.blist.asks.text-danger(ref="bids")
    .ltd.d-flex.justify-content-around(v-for="ask in sorted_asks" @click="setBid(ask)")
      span {{ ask.unit_price | humanFloat }}
      span {{ ask.bid.quantity.split(' ')[0] }}
      span {{ ask.ask.quantity }}

    .ltd.d-flex.justify-content-around(v-if="sorted_asks.length == 0")
      span
      span No asks
      span

  .bg-light.text-center.p-1
    b.text-success {{ current_price | humanFloat }}

  .orders-list.blist.text-success
    .ltd.d-flex(v-for="bid in sorted_bids" @click="setAsk(bid)")
      span {{ bid.unit_price | humanFloat }}
      span {{ bid.ask.quantity.split(' ')[0] }}
      span {{ bid.bid.quantity }}

    .ltd.d-flex.justify-content-around(v-if="sorted_bids.length == 0")
      span
      span No bids
      span
</template>

<script>
import { mapGetters, mapState } from 'vuex'
import { EventBus } from '~/utils/event-bus'

export default {
  computed: {
    ...mapState(['network']),
    ...mapGetters('market', ['sorted_asks', 'sorted_bids', 'token']),

    ...mapGetters({
      current_price: 'market/price'
    })
  },

  watch: {
    bids() {}
  },

  mounted() {
    const bids = this.$refs.bids
    setTimeout(() => {
      bids.scrollTop = bids.scrollHeight
    }, 1000)
  },

  methods: {
    setBid(ask) {
      const price = this.$options.filters.humanFloat(ask.unit_price)
      EventBus.$emit('setPrice', price)
      EventBus.$emit('setAmount', ask.bid.prefix)
    },

    setAsk(bid) {
      const price = this.$options.filters.humanFloat(bid.unit_price)
      EventBus.$emit('setPrice', price)
      EventBus.$emit('setAmount', bid.ask.prefix)
    }
  }
}
</script>

<style>
.overflowbox {
  border: 1px solid hsla(0,2%,89%,.7);
  box-shadow: none;
}

.blist {
  flex: 1;
  display: flex;
  overflow: auto;
  flex-direction: column;
  max-height: 345px;
  padding: 5px 15px;
  text-align: right;
}

.blist .ltd {
  width: 100%;
  min-height: min-content;
  position: relative;
  display: -ms-flexbox;
  display: flex;
  -ms-flex-pack: center;
  justify-content: center;
  -ms-flex-align: center;
  align-items: center;
  height: 20.6px;
  line-height: 20.6px;
  overflow: hidden;
}


.orders-list.asks {
  max-height: 200px;
}

.orders-list.blist .ltd:hover {
  cursor: pointer;
  font-weight: bold;
}

.blist .ltd span {
  width: 40%;
  font-size: 14px;
}

.blist .ltd span:first-child {
  text-align: left;
}

@media only screen and (max-width: 420px) {
  .blist .ltd span {
    font-size: 10px;
  }

  .display-4 {
    font-size: 1em;
  }
}

</style>
