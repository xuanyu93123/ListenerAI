import { loadCSS } from './utils';
import { logout } from '../main';
import { setupSummary } from '../summary';

export function renderSummary(): string {
    loadCSS("/css/styles.css");
    return `
    <button class="toggle-btn">
        <i id="menu-icon" class="fas fa-bars menu-icon"></i>
    </button>
    <div class="sidebar" id="sidebar">
        <a href="/merge" data-link> 首頁</a>
        <a href="/guide" data-link>新手指南</a>
        <a href="/select_avatar" data-link>選擇夥伴</a>
        <a href="/summary" data-link>摘要查詢</a>
        <a href="/conclusion" data-link>總結查詢</a>
        <a href="/backpack" data-link>我的背包</a>
        <a href="/user_manage" data-link>帳號管理</a>
        <a id="logout_button" style="cursor: pointer;">登出</a>
    </div>

    <div class="page-title" style="font-family: 'Noto Serif TC' , serif;">
        <h2>摘要查詢</h2>
    </div>

    <div class="guide-align">
        <!-- 左側導覽列 -->
        <div id="sidetime" class="brown-left" style="width: 20%;"></div>

        <!-- 右側顯示內容 -->
        
        <div class="map-bg-pic">
            <div id="content" class="yellow-right"></div>
        </div>
    </div>
    `;
  }
  
  // 設置navbar
function setupSidebarToggle() {
    const sidebar = document.getElementById("sidebar");
    const menuIcon = document.getElementById("menu-icon");

    if (sidebar && menuIcon) {
        menuIcon.addEventListener("click", () => {
            console.log("menu-icon clicked");
            sidebar.classList.toggle("active");
        });
    }
}

  export function setupSummaryPage() {
    setupSidebarToggle();
    setupSummary(); 

    // 動態移除不需要的 CSS
    const unwantedCSS = document.querySelector('link[href="/css/index_for_merge.css"]');
    if (unwantedCSS) {
        unwantedCSS.remove();
    }

    const logoutButton = document.getElementById("logout_button") as HTMLAnchorElement;
        if (logoutButton) {
            logoutButton.addEventListener("click", () => {
                logout(); // 調用登出函數
            });
        }
}