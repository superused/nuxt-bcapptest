import { apiHandler, getPost } from '../../helpers/apiHandler.js'
import { contract } from '../../helpers/web3.js'

export default apiHandler({
  POST: async (req, res) => {
    // POSTデータを受けとる
    const body = await getPost(req)
    const account_address = body.account_address
    // アカウントアドレスが取得できなければエラー
    if (!account_address) throw new Error('account address not found')
    return await contract.methods.getTokenBalanceOf(account_address).call()
  },
})
