import { loadCSS } from './utils';
import { logout } from '../main';
import { setupGuide } from '../guide';

export function renderGuide(): string {
    loadCSS("/css/styles.css");
    return `
    <style>
         /* 背景遮罩 */
         .background-overlay {
            position: fixed;  /* 全螢幕固定 */
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background-color: rgba(48, 48, 48, 0.35); /* 半透明黑色 */
            z-index: 0; /* 確保在內容下層 */
        }
    </style>

    <div class="background-overlay"></div>

    <div style="position: relative; z-index: 2;">
        <button class="toggle-btn">
            <i id="menu-icon" class="fas fa-bars menu-icon" style="display: none;"></i>
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
    </div>

    <div class="page-title" style="font-family: 'Noto Serif TC', serif; position: relative; z-index: 1;">
        <h2>新手指南</h2>
    </div>
    <!--影片區-->
    <div id="filmid" class="yt-video-wrapper">
        <iframe 
            src="https://www.youtube.com/embed/zS3ZCSaXnFM?si=cFyvuFW7vP6aqqfR" 
            title="YouTube video player" 
            frameborder="0" 
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
            referrerpolicy="strict-origin-when-cross-origin" 
            allowfullscreen
          >
        </iframe>
        <button id="button_g" name="button_g" class="custom-button" style="display: none;" >觀看完成後&nbsp;可點擊前往選擇夥伴！</button>
    </div>      
    `;
  }

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


  
  export function setupGuidePage() {
    setupSidebarToggle();
    setupGuide();

    // 動態移除不需要的 CSS
    let unwantedCSS = document.querySelector('link[href="/css/index_for_merge.css"]');
    if (unwantedCSS) {
        unwantedCSS.remove();
    }

    unwantedCSS = document.querySelector('link[href="/css/guidestory.css"]');
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