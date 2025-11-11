import { loadCSS } from './utils';
import { setupRegister2 } from '../main';

export function renderRegister2(): string {
    loadCSS("/css/styles.css");
    return `
    <div class="page-title" style="font-family: 'IM Fell English', serif;">
            <h2>LISTENER AI</h2>
    </div>

    <div class="conversation-wrapper">
        <div class="regis-container">
            <h4>註冊</h4>
            <form id="Register2Form" class="regis-form">
                <p style="font-size: 13px;width: 80%;">＊若您是7-12歲的使用者，請提供父母的電子郵件，
                    我們將寄送意願確認信件，邀請您的父母完成授權手續。</p>
                <input id="p_gmail" name="p_gmail" type="text" placeholder="父母電子郵件" required>
                <a href="/login" data-link>已擁有帳戶? ｜登入</a>
                <button id="parentgmailsubmit" type="submit" class="custom-button">下一步</button>
            </form>
        </div>
    </div>
    <p id="response"></p>
    `;
}

// 動態添加事件處理程序
export function setupRegister2Page() {
    setupRegister2();
    
}