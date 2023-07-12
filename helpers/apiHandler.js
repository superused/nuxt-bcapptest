const httpMethods = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE']

// HTTPメソッドを判別する(httpMethodsの配列に入っているかどうか確認)
const isHttpMethod = method => {
  return httpMethods.some(m => m === method)
}

// 想定されていないHTTPメソッドである場合のエラー表示
const methodNotAllowed = (req, res) => {
  return sendResponseJson(res, 405, `Method ${req.method} Not Allowed`)
}

// APIの結果JSON表示
export const sendResponseJson = (res, statusCode, result) => {
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json')
  return res.end(JSON.stringify({
    statusCode,
    result,
  }))
}

// GET送信の値を取得する
export const getGet = req => {
  const url = require('url')
  // URLをパース
  const parseUrl = url.parse(req.url, true)
  return parseUrl.query
}

// POST送信の値を取得する
export const getPost = async req => {
  return await new Promise((resolve, reject) => {
    const data = []
    req.on('data', chunk => data.push(chunk))
    req.on('end', () => resolve(Object.fromEntries(new URLSearchParams(Buffer.concat(data).toString()))))
    req.on('error', reject)
  })
}

// API出力処理 基本的な出力の共通処理
export const apiHandler = handlers => {
  return async (req, res, a) => {
    const { method } = req
    // 想定されていないHTTPメソッドであればエラー
    if (!method || !isHttpMethod(method)) {
      return methodNotAllowed(req, res)
    }
    const handler = handlers[method]
    // 想定されるHTTPメソッドの処理が存在しなければエラー
    if (!handler) {
      return methodNotAllowed(req, res)
    }
    // 出力処理
    try {
      const result = await handler(req, res)
      return sendResponseJson(res, 200, result)
    } catch (err) {
      // エラー処理
      errorHandler(err, res)
    }
  }
}

// エラー処理
export const errorHandler = (error, res) => {
  // エラー情報が存在すれば400エラーを出力
  if (error) {
    return sendResponseJson(res, 400, error.message || 'unknown error')
  }
  // その他のエラーは500エラーを出力
  return sendResponseJson(res, 500, 'unknown error')
}
