import { loadCSS } from './utils';
import { setWait } from '../wait';

export function renderWait(): string {
    loadCSS("/css/styles.css");
    return `
    <div class="page-title" style="font-family: 'IM Fell English', serif;">
        <h2>LISTENER AI</h2>
    </div>

    <div class="conversation-wrapper">
        <div class="regis-container">
            <h4 style="margin-bottom: 10px;">註冊</h4>

            <p style="font-size: 13px;width: 80%;">＊等待您的父母完成授權手續。</p>
        </div>
    </div>
    `;
}

// 動態添加事件處理程序
export function setupWaitPage() {
    setWait();
}