import { defineStore } from 'pinia'
import { api } from 'boot/axios';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    accessToken: localStorage.getItem('accessToken') || null,
    refreshToken: localStorage.getItem('refreshToken') || null,
    user: JSON.parse(localStorage.getItem('user')) || null,
    // isAuthenticated は getter で動的に評価することも可能
  }),

  getters: {
    isAuthenticated: (state) => !!state.accessToken,
    // fullName: (state) => state.user ? `${state.user.firstName} ${state.user.lastName}` : '',
  },

  actions: {
    /**
     * @param {object} credentials - { email, password }
     */
    async login(credentials) {
      try {
        const response = await api.post(`auth/login`, credentials)
        const accessToken = response.data.access
        const refreshToken = response.data.refresh
        const user = response.data.username

        this.setAuthData(accessToken, refreshToken, user)

        return Promise.resolve(user)
      } catch (error) {
        this.clearAuthData()
        console.error('Login failed:', error.response ? error.response.data : error.message)
        return Promise.reject(error.response ? error.response.data : error.message)
      }
    },

    /**
     * 認証情報をセット（stateとlocalStorageに保存）
     */
    setAuthData(accessToken, refreshToken, user) {
      this.accessToken = accessToken
      this.refreshToken = refreshToken // refreshToken を使用しない場合は null や undefined でも可
      this.user = user

      localStorage.setItem('accessToken', accessToken)
      if (refreshToken) {
        localStorage.setItem('refreshToken', refreshToken)
      } else {
        localStorage.removeItem('refreshToken')
      }
      localStorage.setItem('user', JSON.stringify(user))

      // Axios のデフォルトヘッダーにトークンを設定 (ブートファイルで一元管理も可能)
      axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`
    },

    /**
     * ログアウト処理
     */
    logout() {
      this.clearAuthData()
      // (任意) バックエンドのログアウトAPIを呼び出す
      // await axios.post(`${API_BASE_URL}/auth/logout`);
      // ルーターでログインページにリダイレクトする処理は、呼び出し元やナビゲーションガードで行う
    },

    /**
     * 認証情報をクリア（stateとlocalStorageから削除）
     */
    clearAuthData() {
      this.accessToken = null
      this.refreshToken = null
      this.user = null

      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
      localStorage.removeItem('user')

      // Axios のデフォルトヘッダーからトークンを削除
      delete axios.defaults.headers.common['Authorization']
    },

    /**
     * アプリケーション初期化時にlocalStorageから認証情報を読み込む
     * このアクションはブートファイルから呼び出されます。
     */
    initializeAuth() {
      const token = localStorage.getItem('accessToken')
      const user = JSON.parse(localStorage.getItem('user'))
      const refreshToken = localStorage.getItem('refreshToken')

      if (token && user) {
        this.accessToken = token
        this.user = user
        this.refreshToken = refreshToken
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
      } else {
        // トークンがない、またはユーザー情報がない場合はクリア
        this.clearAuthData()
      }
    },

    /**
     * (オプション) リフレッシュトークンを使用してアクセストークンを更新
     */
    async refreshAccessToken() {
      if (!this.refreshToken) {
        this.logout() // リフレッシュトークンがない場合はログアウト
        return Promise.reject('No refresh token available')
      }
      try {
        const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
          refreshToken: this.refreshToken,
        })
        const { accessToken, user } = response.data // 新しいリフレッシュトークンが返る場合もある
        // 新しいリフレッシュトークンが返ってくる場合は、それも保存する
        // const newRefreshToken = response.data.refreshToken || this.refreshToken;
        this.setAuthData(accessToken, this.refreshToken, user || this.user) // user情報も更新する場合
        return Promise.resolve(accessToken)
      } catch (error) {
        console.error('Failed to refresh token:', error)
        this.logout() // トークンリフレッシュ失敗時はログアウト
        return Promise.reject(error)
      }
    },

    /**
     * (オプション) ユーザー情報を取得/更新
     * トークンはあるがユーザー情報がない場合や、最新情報に更新したい場合に使用
     */
    // async fetchUser() {
    //   if (!this.accessToken) return Promise.reject('No access token');
    //   try {
    //     const response = await axios.get(`${API_BASE_URL}/users/me`);
    //     this.user = response.data;
    //     localStorage.setItem('user', JSON.stringify(response.data));
    //     return Promise.resolve(response.data);
    //   } catch (error) {
    //     console.error('Failed to fetch user:', error);
    //     // 401エラーでトークンが無効ならログアウト処理など
    //     if (error.response && error.response.status === 401) {
    //       this.logout();
    //     }
    //     return Promise.reject(error);
    //   }
    // }
  },
})
