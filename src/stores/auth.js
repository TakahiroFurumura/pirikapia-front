import { defineStore, acceptHMRUpdate } from 'pinia';
import { api } from 'boot/axios';
const debug = true

export const useAuthStore = defineStore('authStore', {
  state: () => ({
    accessToken: localStorage.getItem('accessToken') || null,
    refreshToken: localStorage.getItem('refreshToken') || null,
    user: JSON.parse(localStorage.getItem('user')) || null,
  }),
  getters: {
    /**
     * if the user is authenticated
     * @param {object} state - current state
     * @returns {boolean} - 認証済みなら true
     */
    isAuthenticated: (state) => !!state.accessToken,

    /**
     * 現在のアクセストークンを返します。
     * @param {object} state - 現在のストアの状態
     * @returns {string|null} - アクセストークン
     */
    getAccessToken: (state) => state.accessToken,

    /**
     * 現在のユーザー情報を返します。
     * @param {object} state - 現在のストアの状態
     * @returns {object|null} - ユーザー情報 contains userEmail (ID) and userName
     */
    getUser: (state) => state.user,

  },
  actions: {
    /**
     * 認証情報を state と Local Storage に保存し、Axios のデフォルトヘッダーを設定します。
     * @param {string} accessToken - アクセストークン
     * @param {string|null} refreshToken - リフレッシュトークン (オプション)
     * @param {object|null} userData - ユーザー情報 (オプション)
     */
    _setAuthData(accessToken, refreshToken = null, userData = null) {
      this.accessToken = accessToken;
      localStorage.setItem('accessToken', accessToken);

      if (refreshToken) {
        this.refreshToken = refreshToken;
        localStorage.setItem('refreshToken', refreshToken);
      } else {
        this.refreshToken = null;
        localStorage.removeItem('refreshToken');
        console.log('refreshToken was not given, removed existing refreshToken from localStorage.')
      }

      if (userData) {
        this.user = userData;
        localStorage.setItem('user', JSON.stringify(userData));
      } else {
        // ユーザー情報が提供されない場合、既存の情報を維持するかクリアするか選択
        // ここでは既存の情報を維持する例 (クリアする場合は this.user = null; localStorage.removeItem('user');)
      }

      // Axios のデフォルトヘッダーに認証トークンを設定
      if (accessToken) {
        api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
      } else {
        delete api.defaults.headers.common['Authorization'];
      }
    },

    /**
     * 認証情報を state と Local Storage から削除し、Axios のデフォルトヘッダーを解除します。
     */
    _clearAuthData() {
      this.accessToken = null;
      this.refreshToken = null;
      this.user = null;

      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      delete api.defaults.headers.common['Authorization'];
      console.log('authentication date was deleted from localStorage and api Authorization header')
    },

    /**
     * ログイン処理を実行します。
     * @param {object} credentials - ユーザーの認証情報 (例: { email, password })
     * @returns {Promise<object>} - ログインしたユーザー情報
     */
    async login(credentials) {
      if (debug) {console.debug('login', credentials);}
      // this.status.loggingIn = true;
      // this.status.error = null;
      try {
        // 実際のAPIエンドポイントに合わせてください
        const response = await api.post(`/auth/login`, credentials);
        if (debug) {console.debug('/auth/login response', response.data);}
        const refreshToken = response.data.refresh;
        const accessToken = response.data.access
        const user = response.data.user

        this._setAuthData(accessToken, refreshToken, user);

        // this.status.loggingIn = false;
        return Promise.resolve(user);
      } catch (error) {
        this._clearAuthData(); // ログイン失敗時は認証情報をクリア
        // this.status.loggingIn = false;
        // this.status.error = error.response ? error.response.data : error.message;
        console.error('Login failed:', error.response ? error.response.data : error.message);
        return Promise.reject(error.response ? error.response.data : error.message);
      }    },

    /**
     * ログアウト処理を実行します。
     * @returns {Promise<void>}
     */
    async logout() {
      // (任意) バックエンドのログアウトAPIを呼び出す
      // try {
      //   if (this.accessToken) { // トークンがある場合のみ
      //     await axios.post(`${API_BASE_URL}/auth/logout`);
      //   }
      // } catch (error) {
      //   console.error('API logout failed:', error);
      //   // ここでのエラーはフロントエンドのログアウト処理を妨げないようにする
      // }

      this._clearAuthData();
      // ルーターでログインページにリダイレクトする処理は、このアクションを呼び出すコンポーネント側で行うか、
      // もしくはナビゲーションガードで未認証状態を検知して行うのが一般的です。
      return Promise.resolve();
    },

    /**
     * アプリケーション起動時に Local Storage から認証情報を読み込み、ストアを初期化します。
     * このアクションは通常、Quasar のブートファイルから呼び出されます。
     */
    initializeAuthFromLocalStorage() {
      const token = localStorage.getItem('accessToken');
      const refreshTokenVal = localStorage.getItem('refreshToken');
      const userVal = localStorage.getItem('user');

      if (token) {
        const userData = userVal ? JSON.parse(userVal) : null;
        this._setAuthData(token, refreshTokenVal, userData);
        // (任意) トークンの有効性をここでバックエンドに確認することもできます
        // await this.verifyToken();
      } else {
        this._clearAuthData(); // 有効なトークンがなければクリア
      }
    },

    /**
     * (オプション) リフレッシュトークンを使用してアクセストークンを更新します。
     * @returns {Promise<string>} - 新しいアクセストークン
     */
    async refreshAccessToken() {
      if (!this.refreshToken) {
        // リフレッシュトークンがない場合はログアウトなどの処理へ
        await this.logout();
        return Promise.reject('No refresh token available.');
      }
      await api.post(`/auth/token/refresh/`, {
        refresh: this.refreshToken,
      })
        .then((response) => {
          const { accessToken, user } = response.data; // APIによっては新しいリフレッシュトークンも返る
          // const newRefreshToken = response.data.newRefreshToken || this.refreshToken; // 新しいリフレッシュトークンがある場合
          this._setAuthData(accessToken, this.refreshToken, user || this.user); // user情報は任意で更新
          return Promise.resolve(accessToken)
        })
        .catch((error) => {
          console.error('Failed to refresh access token:', error);
          this.logout(); // リフレッシュ失敗時はログアウト
          return Promise.reject(error);
        })

    },

    // (オプション) トークンの有効性を確認するアクション
    // async verifyToken() {
    //   if (!this.accessToken) return;
    //   try {
    //     // ユーザー情報を取得するエンドポイントなどを呼び出してトークンの有効性を確認
    //     await axios.get(`${API_BASE_URL}/users/me`);
    //   } catch (error) {
    //     console.warn('Token verification failed or token expired:', error);
    //     // トークンが無効ならログアウト処理
    //     await this.logout();
    //   }
    // }

  }
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useAuthStore, import.meta.hot));
}
