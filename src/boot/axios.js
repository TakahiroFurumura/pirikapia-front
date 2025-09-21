import { boot } from 'quasar/wrappers';
import axios from 'axios';
import { useAuthStore } from 'src/stores/auth' // Piniaストアのパス


import { useRouter } from 'vue-router'
const router = useRouter();


console.info(window.location.hostname)
const apiBaseUrl = window.location.hostname == "localhost" ? "http://127.0.0.1:8000" : "https://api.pirikapia.com"
const debug = window.location.hostname === "localhost"
// const apiBaseUrl = "https://api.pirikapia.com"

console.info(`Running on ${window.location.hostname}, using api base url ${apiBaseUrl}`);
// Create an Axios instance with a base URL (optional, but recommended)
const api = axios.create({
  baseURL: apiBaseUrl , // Replace with your API's base URL
  // You can add other default settings here, like headers
  // headers: { 'X-Custom-Header': 'foobar' }
});


// request interceptor
api.interceptors.request.use(req  => {
  if (debug) console.debug('request', req.url, req.method, req)
  return req;
}, err => {
  return Promise.reject(err);
});

// response interceptor
api.interceptors.response.use(
  res => {
    if (debug) console.debug('response', res.request.responseURL, res.status, res)
    return res;
  }, async error => {

      const authStore = useAuthStore();
      authStore.initializeAuthFromLocalStorage()
      const originalRequest = error.config
      // 401エラーで、かつ、まだリトライしていない場合
      if (error.response && error.response.status === 401 && !originalRequest._retry) {
        console.debug('retry after refreshing token', error.response.status, originalRequest._retry)
        originalRequest._retry = true // リトライフラグを立てる
        try {
          // アクセストークンをリフレッシュ
          const newAccessToken = await authStore.refreshAccessToken()
          // リフレッシュ成功後、元のリクエストのヘッダーを更新して再実行
          if (newAccessToken) {
            console.debug('refreshed token', newAccessToken)
            originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`
            return axios(originalRequest) // 元のリクエストを再試行
          }
        } catch (refreshError) {
          // リフレッシュ失敗時 (authStore.refreshAccessToken内でログアウト処理が呼ばれるはず)
          router.push('/login') // ここでリダイレクトも可能
          console.error('Token refresh failed, redirecting to login.', refreshError)
          return Promise.reject(refreshError)
        }
      } else {
        console.debug(error.request.responseURL, error.status, error)
      }
      // ステータスコードが200系以外の場合に実行する処理
    return Promise.reject(error)
});


export default boot(({ app }) => {
  // for use inside Vue files (Options API) through this.$api
  app.config.globalProperties.$api = api;
  // ^ ^ ^ this will allow you to use this.$api (for Vue Options API form)
  //       so you can easily perform requests against your app's API

  // For use outside of Vue files (e.g., in Vuex/Pinia stores, route guards)
  // You can export the instance directly if needed.
  // However, for consistency within Vue components, using app.config.globalProperties is common.
});

// It's often useful to export the api instance directly from the boot file,
// especially if you need to use it in other JavaScript modules outside of Vue components
// (e.g., in Pinia stores or other utility functions).
export { api };
