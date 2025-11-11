import { loadCSS } from './utils';
import AOS from 'aos';
import { logout } from '../main';
import { setupSelectAvatar } from '../select_avatar';

export function renderSelectAvatar(): string {
    loadCSS("/css/styles.css");
    return `
    <button class="toggle-btn">
        <i id="menu-icon" class="fas fa-bars menu-icon" style="z-index: 100; display: none;"></i>
    </button>
    <div class="sidebar" id="sidebar" style="z-index: 99;">
        <a href="/merge" data-link> 首頁</a>
        <a href="/guide" data-link>新手指南</a>
        <a href="/select_avatar" data-link>選擇夥伴</a>
        <a href="/summary" data-link>摘要查詢</a>
        <a href="/conclusion" data-link>總結查詢</a>
        <a href="/backpack" data-link>我的背包</a>
        <a href="/user_manage" data-link>帳號管理</a>
        <a id="logout_button" style="cursor: pointer;">登出</a>
    </div>

    <div class="page-title" style="font-family: 'Noto Serif TC', serif;">
        <h2>選擇相談夥伴</h2>
    </div>

    <div class="select-avtr" >
        <div class="select-left" data-aos="fade-in" >
            <!--<video src="img/vicky_h.mp4" autoplay loop muted playsinline class="avatar-video" alt="Loading..."></video>-->
            <a href="javascript:void(0)" id="buttonOpenPopupVicky" class="avatar-link open-popup-vicky">
                <img src="img/vicky_talk.png" class="img_avatar" alt="Vicky">
              </a>
            <div style="display: flex; align-items: center; ">
                <h4>Vicky</h4>
                <button class="custom-button open-popup-vicky" style="width: 63px; height: 32px;">選擇</button>
            </div>
        </div>

        <div class="select-left" data-aos="fade-in">
                <a href="javascript:void(0)" id="buttonOpenPopupWayne" class="avatar-link open-popup-wayne">
                    <img src="img/wayne_talk.png" class="img_avatar" alt="Wayne">
                  </a>
            <div style="display: flex; align-items: center;">
                <h4>Wayne</h4>
                <button class="custom-button open-popup-wayne" style="width: 63px; height: 32px;">選擇</button>
            </div>
        </div>

    </div>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/aos/2.3.4/aos.js"></script>
    <script>
        AOS.init(); // 初始化 AOS
    </script>


    <div id="select-overlay" class="overlay">
    <!--按下選擇後會跳出來的確認訊息-->
        <div class="select-pop" id="selectPopupVicky" style="display: none;">
            <img src="img/vicky_square.png" style="width: 95%; border-radius: 5px; ">
            <p style="font-size: 11px; color: #792a00; margin: 0;">＊選擇後，仍可回到此頁面進行更改</p>
            <p style=" font-size: 14px; text-align: center; margin:12px 0;">確認選擇Vicky為相談夥伴?</p>

            <div style="width: 100%;display: flex; align-items: center;justify-content: center; gap: 25px;">
                <button class="custom-button" style="width: 65px; height: 32px;" id="buttonClosePopupVicky">返回</button>
                <button id="Button_ChooseVicky" name="Button_ChooseVicky" class="custom-button"
                    style="width: 65px;  height: 32px;">確認</button>
            </div>
        </div>
    

        <div class="select-pop" id="selectPopupWayne" style="display: none;">
            <img src="img/wayne_square.png" style="width: 95%;  border-radius: 5px;">
            <p style="font-size: 11px; color: #792a00; margin: 0;">＊選擇後，仍可回到此頁面進行更改</p>
            <p style=" font-size: 14px; text-align: center; margin:12px 0;">確認選擇Wayne為相談夥伴?</p>

            <div style="width: 100%;display: flex; align-items: center;justify-content: center; gap: 25px;">
                <button class="custom-button" style="width: 65px; height: 32px;" id="buttonClosePopupWayne">返回</button>
                <button id="Button_ChooseWayne" name="Button_ChooseWayne" class="custom-button"
                    style="width: 65px;  height: 32px;">確認</button>
            </div>
        </div>
    `;
  }

  function initializeAOS() {
      AOS.init(); // 初始化 AOS 動畫
  }

  // 通用彈窗綁定函數
  function setupPopup(openButtonClass: string, closeButtonId: string, popupId: string, overlayId: string) {
    const openButtons = document.querySelectorAll(`.${openButtonClass}`);
    const closeButton = document.getElementById(closeButtonId);
    const popup = document.getElementById(popupId);
    const overlay = document.getElementById(overlayId);

    console.log("openButtons:", openButtons);
    console.log("closeButton:", closeButton);
    console.log("popup:", popup);
    console.log("overlay:", overlay);

    if (openButtons.length > 0 && closeButton && popup && overlay) {
        openButtons.forEach((button) => {
            button.addEventListener("click", () => {
                console.log(`${openButtonClass} 被點擊`);
                popup.style.display = "block";
                overlay.style.display = "block";
            });
        });

        closeButton.addEventListener("click", () => {
            console.log(`${closeButtonId} 被點擊`);
            popup.style.display = "none";
            overlay.style.display = "none";
        });
    } else {
        console.error(`彈窗相關的 DOM 元素未找到: ${openButtonClass}, ${closeButtonId}, ${popupId}, ${overlayId}`);
    }
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
  
  export function setupSelectAvatarPage() {
    initializeAOS();
    setupSidebarToggle();
    setupSelectAvatar();

    // 動態移除不需要的 CSS
    const unwantedCSS = document.querySelector('link[href="/css/index_for_merge.css"]');
    if (unwantedCSS) {
        unwantedCSS.remove();
    }
    
    // 等待 DOM 渲染完成後綁定彈窗事件
    setTimeout(() => {
        // 使用通用的 setupPopup 函數綁定彈窗事件
        setupPopup("open-popup-vicky", "buttonClosePopupVicky", "selectPopupVicky", "select-overlay");
        setupPopup("open-popup-wayne", "buttonClosePopupWayne", "selectPopupWayne", "select-overlay");
    }, 0);
    
    const logoutButton = document.getElementById("logout_button") as HTMLAnchorElement;
    if (logoutButton) {
        logoutButton.addEventListener("click", () => {
            logout(); // 調用登出函數
        });
    }
}