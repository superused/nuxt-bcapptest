const timeout = 10000 // HTTPリクエストのタイムアウト時間
export default ({$axios}, inject) => {
  /**
   * HTTPリクエスト送信を行う
   * @params url HTTPリクエスト送信URL
   * @params params リクエストパラメータ(key: value形式)
   * @params method get or post
   * @return HTTPレスポンス
   */
  const sendRequest = async (url, params, method) => {
    // 引数paramsが存在しなければgetにする
    if (typeof params == 'undefined') params = {}
    // 引数methodが存在しなければgetにする
    if (typeof method == 'undefined') method = 'get'
    // 小文字にする
    method = method.toLowerCase()
 
    if (method === 'get') {
      // GETでHTTPアクセスを行い、結果を返す
      return await $axios({method, url, timeout, params})
    } else if (method === 'post') {
      const data = new URLSearchParams();
      for (const i in params) data.append(i, params[i])
      // POSTでHTTPアクセスを行い、結果を返す
      return await $axios({method, url, timeout, data})
    } else {
      // 想定されていないmethodの場合、エラーを発生させる
      throw new Error('invalid method')
    }
    return false
  }
  /**
   * APIリクエスト送信を行う(sendRequestのラッパー関数)
   * @params url HTTPリクエスト送信URL
   * @params params リクエストパラメータ(key: value形式)
   * @params method get or post
   * @return APIレスポンス(result部分のみ)
   */
  const apiRequest = async (url, params, method) => {
    const response = await sendRequest(url, params, method)
    // APIリクエスト結果があれば結果を返す
    if (response.data && response.data.statusCode == 200) {
      return response.data.result
    } else {
      throw new Error(response.data.error || 'api error')
    }
  }
  // 共通関数に追加
  inject('sendRequest', sendRequest)
  inject('apiRequest', apiRequest)
}
