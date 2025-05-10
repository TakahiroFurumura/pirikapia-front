import { boot } from 'quasar/wrappers';
import axios from 'axios';

// Create an Axios instance with a base URL (optional, but recommended)
const api = axios.create({
  baseURL: 'https://api.pirikapia.com', // Replace with your API's base URL
  // You can add other default settings here, like headers
  // headers: { 'X-Custom-Header': 'foobar' }
});


api.interceptors.request.use(req  => {
  console.log(req)
  return req;
}, err => {
  return Promise.reject(err);
});

// レスポンス受信後に行いたい処理の定義
api.interceptors.response.use(res => {
    console.log(res)
    return res;
  }, err => {
    // ステータスコードが200系以外の場合に実行する処理
    return Promise.reject(err);
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
