<template>
  <v-row justify="center">
    <v-col
      cols="12"
      sm="10"
      md="8"
      lg="6"
    >
      <v-card ref="form">
        <v-card-text>
          <h1>{{ title }}</h1>
          <h2 align="right">(TotalSupply:{{ totalSupply }})</h2>
          <v-text-field
            ref="fromAccount"
            v-model="fromAccount"
            label="FromAccount"
            placeholder="fromAccount"
            disabled
          >
           {{ fromAccount }}
          </v-text-field>
          <p> TokenBalance : {{ tokenBalance }}</p>
          <p> EthBalance : {{ ethBalance }}</p>
          <v-text-field
            ref="secretKey"
            v-model="password"
            :rules="[() => !!password || 'This field is required']"
            label="SecretKey"
            placeholder="secretKey"
          ></v-text-field>
          <v-text-field
            ref="sendValue"
            v-model="sendValue"
            :rules="[() => !!sendValue || 'This field is required']"
            :label="symbol"
            placeholder="sendValue"
            type="number"
            required
          ></v-text-field>
          <v-select
            ref="toAccount"
            v-model="toAccount"
            :rules="[() => !!toAccount || 'This field is required']"
            :items="accounts"
            label="ToAccount"
            placeholder="Select..."
            required
          ></v-select>
        </v-card-text>
        <v-divider class="mt-12"></v-divider>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="primary"
            :loading="loading"
            :disabled="loading"
            @click="send"
          >
            Send
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-col>
  </v-row>
</template>

<script>
import Web3 from "web3"
export default {
   data() {
     return {
       title: '',
       totalSupply: '',
       fromAccount: '',
       ethBalance: 0,
       tokenBalance: 0,
       password: '',
       sendValue: 1,
       accounts: [],
       toAccount: '',
       errorMessages: '',
       formHasErrors: false,
       symbol: 'SendValue ()',
       loading: false,
     }
   },
   async beforeMount() {
     // 送信者アカウントアドレス
     this.fromAccount = this.$route.params.id
     // 送信者アカウントアドレスが渡されていなかったらアカウント一覧画面にリダイレクト
     if (!this.fromAccount) {
       this.$router.push('/accounts')
       return
     }
     // API各々実行
     [this.totalSupply, this.accounts, this.title, this.symbol] = await Promise.all([
       this.$apiRequest('/api/totalSupply'), // トークン発行量取得API
       this.getAccountsWithoutSender(),      // 送信者以外のアカウント一覧取得API
       this.$apiRequest('/api/name'),        // トークン名取得API
       this.getSymbol(),                     // トークンシンボル取得
       this.getTokenBalance(),               // 送信者のトークン残高取得
       this.getEtherBalance(),               // 送信者のEther残高取得
     ])
   },
   methods: {
     // 送信者のトークン残高取得
     async getTokenBalance() {
       // API実行
       const res = await this.$apiRequest('/api/getTokenBalanceOf', {
         account_address: this.fromAccount
       }, 'post')
       if (res) {
         // 結果を画面に反映
         this.tokenBalance = res
       } else {
         alert('トークン残高の取得に失敗しました。')
       }
     },
     // 送信者以外のアカウント一覧取得
     async getAccountsWithoutSender() {
       // API実行
       const accounts = await this.$apiRequest('/api/getAccounts')
       // 送信者以外でフィルタ
       return accounts.length ? accounts.filter(account => account !== this.fromAccount) : []
     },
     // 送信者のether残高取得
     async getEtherBalance() {
       // API実行
       const res = await this.$apiRequest('/api/getEtherBalance', {
         account_address: this.fromAccount
       })
       if (res) {
         // 結果を画面に反映
         this.ethBalance = res
       } else {
         alert('Ether残高の取得に失敗しました。')
       }
     },
     // 画面表示用トークンシンボル取得
     async getSymbol() {
       // API実行
       const res = await this.$apiRequest('/api/symbol')
       return 'SendValue (' + res + ')'
     },
     // トークン送信処理
     async send() {
       this.loading = true
       // 入力チェック
       const errors = this.validate()
       // エラーがある場合、アラートで表示して送信処理中断
       if (errors.length) {
         alert(errors.join("\n"))
         this.loading = false
         return
       }
       try {
         // トークン送信API実行
         const res = await this.$apiRequest('/api/transferToken', {
           from: this.fromAccount,
           to: this.toAccount,
           private_key: this.password,
           value: this.sendValue,
         }, 'post')
         if (res) alert('送信に成功しました。')
 
         // トークン送信後に改めてトークン残高、Ether残高を取得
         this.getTokenBalance()
         this.getEtherBalance()
       } catch (e) {
         console.log(e)
         alert("送信時にエラーが発生しました。");
       }
       this.loading = false
     },
     // 入力チェック
     validate() {
       const errors = []
       if (!this.fromAccount) errors.push('送信元ユーザが未入力です')
       else if (!Web3.utils.isAddress(this.fromAccount)) errors.push('送信元ユーザのアカウントアドレスが不正です')
       if (!this.toAccount) errors.push('送信先ユーザが未入力です')
       else if (!Web3.utils.isAddress(this.toAccount)) errors.push('送信先ユーザのアカウントアドレスが不正です')
       if (!this.password) errors.push('秘密鍵が未入力です')
       if (!this.sendValue) errors.push('トークン送信量が未入力です')
       if (this.tokenBalance < this.sendValue) error.push('送信トークン量が残高を超えています')
       return errors
     },
   },
}
</script>
