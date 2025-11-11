import { loadCSS } from './utils';
import {setupLogin} from '../main';
export function renderLogIn(): string {
    loadCSS("/css/styles.css");
    return `
    <div class="page-title" style="font-family: 'IM Fell English', serif;">
            <h2>LISTENER AI</h2>
    </div>

    <div class="conversation-wrapper">
        <div class="regis-container">
            <h4>登入</h4>
            <form id="LoginForm" class="regis-form">
                <input id="u_id" name="u_id" type="text" placeholder="帳號" required>
                <input id="u_password" name="u_password" type="password" placeholder="密碼" required>
                <a href="" class="forgot-password">忘記密碼?</a>
                <a href="/register" data-link>還沒有帳戶嗎? ｜註冊</a>
                <button id="loginsubmit" type="submit" class="custom-button" style="margin-top: 0;">登入</button>
            </form>
        </div>
    </div>
    `;
}

// 動態添加事件處理程序
export function setupLoginPage() {
    setupLogin();
}