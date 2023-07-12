<template>
  <v-simple-table>
  <template v-slot:default>
    <thead>
      <tr>
        <th class="text-left">Account List</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="account in accounts">
        <td>
          <router-link :to="{name: 'send', params: {id: account}}">{{ account }}</router-link>
        </td>
      </tr>
    </tbody>
  </template>
  </v-simple-table>
</template>

<script>
export default {
  name: 'AccountPage',
  data() {
    return {
      accounts: [],
    }
  },
  mounted() {
    // アカウント情報取得
    this.getAccounts()
  },
  methods: {
    async getAccounts() {
      try {
        // アカウント情報取得APIを実行して結果を代入
        this.accounts = await this.$apiRequest('/api/getAccounts')
      } catch(e) {
        console.log(e)
        alert('アカウント取得時にエラーが発生しました')
        // TOPページへ戻る
        this.$router.push('/')
      }
    }
  }
}
</script>
