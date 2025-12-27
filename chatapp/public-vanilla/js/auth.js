/**
 * 認証管理モジュール
 */

const Auth = {
    /**
     * ユーザーをログイン状態にする
     */
    setUser(user, token) {
        localStorage.setItem('user', JSON.stringify(user));
        API.setToken(token);
    },
    
    /**
     * 現在のユーザーを取得
     */
    getUser() {
        const userJson = localStorage.getItem('user');
        return userJson ? JSON.parse(userJson) : null;
    },
    
    /**
     * ユーザーがログインしているか確認
     */
    isLoggedIn() {
        return this.getUser() !== null && API.getToken() !== null;
    },
    
    /**
     * ログアウト
     */
    logout() {
        localStorage.removeItem('user');
        API.removeToken();
    }
};
