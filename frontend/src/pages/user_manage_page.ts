import { loadCSS } from './utils';
import { logout } from '../main';
import { setupUserManage } from '../user_manage';

export function renderUserManage(): string {
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

    <div class="page-title" style="font-family: 'Noto Serif TC', serif;">
        <h2>帳號管理</h2>
    </div>

    <div style="display:flex; justify-content:center; gap:95px;">
        <div class="regis-container" style="max-height:48vh;">
            <h4 style="margin-bottom: 10px;">使用者資訊</h4>
            <!--new 頭貼區-->
            <div id="profile_div" style="position: relative;">
                <div class="profile-container">
                    <img id="profile-image" alt="頭像">
                    <label class="edit-icon">
                    <i class="fas fa-pen" ></i>
                    </label>
                </div>
                <!-- Popup 隱藏 -->
                <div class="profile-popup" id="profile-pic-popup">
                    <div class="profile-popup-img-group">
                        <div class="pic-option">
                            <img src="img/boy_profile.png" alt="頭像1">
                            <span class="choose-text">選擇</span>
                        </div>
                        
                        <div class="pic-option">
                            <img src="img/girl_profile.png" alt="頭像2">
                            <span class="choose-text">選擇</span>
                        </div>
                        
                        <div class="pic-option">
                            <img src="img/pet_profile.png" alt="頭像3">
                            <span class="choose-text">選擇</span>
                        </div>
                    </div>
                    
                    <button type="button" id="button_change_profile" type="submit" class="custom-button" 
                            style="height: 25px;width: 80px; border-radius: 18px; font-size: 13px;">儲存變更</button>
                </div>
            </div>
            <!---->
            <form class="regis-form" style="align-items: flex-start; margin-left: 50px; margin-bottom:1px;">
                <div id="user-name"></div>
                <div id="user-date"></div>
                <div id="user-account"></div>
                <div class="user-manage-pw1">
                    <span id="user-password" style="display:none;"></span>
                    <span>密碼:&nbsp</span>
                    <button id="editPasswordBtn" 
                        style="all: unset; text-decoration: underline; cursor: pointer; font-size: 14px;">
                        修改密碼
                    </button>
                </div>
            </form>
            
            <!-- 密碼修改表單-->
            <form id="PasswordForm" style="display:none; ">
                <div class="user-manage-pw">
                    <input
                        style="background-color: #f6f2dc; width: 55%; border: none;
                               border-bottom: 1.5px solid #7e736d; outline: none; padding: 1px; 
                               font-size: 12px; border-radius: 5px; font-size: 13px; font-family: 'Noto Serif TC', serif;" 
                        type="password" id="u_password" placeholder="新密碼" required>
                    <button id="submitPassword" type="submit" class="custom-button"
                        style="width: auto; font-size: 13px; border-radius: 18px; height: 25px; background-color:white; color:black">
                        提交</button>
                </div>
            </form>
        </div>

        <div class="regis-container" style="width:25%;">
            <h4 style="margin-bottom: 0;">量表檢測結果</h4>
            
            <div id="outerdiv" class="result-section">
            </div>

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

// 設置頭像彈窗功能
function setupProfilePopup() {
    const editIcon = document.querySelector('.edit-icon') as HTMLElement;
    const profilePopup = document.getElementById('profile-pic-popup') as HTMLDivElement;
    const profileImage = document.getElementById('profile-image') as HTMLImageElement;
    const picOptions = document.querySelectorAll('.pic-option');

    if (!editIcon || !profilePopup || !profileImage || picOptions.length === 0) {
        console.error("必要的 DOM 元素未找到");
        return;
    }

    // 點鉛筆，切換 popup 顯示/隱藏
    editIcon.addEventListener('click', (event) => {
        event.stopPropagation(); // 防止 document 的 click 關閉 popup
        profilePopup.style.display = (profilePopup.style.display === 'flex') ? 'none' : 'flex';
    });

    // 按選擇，可以換頭貼
    picOptions.forEach(option => {
        const img = option.querySelector('img');
            const chooseText = option.querySelector('.choose-text');
            
            if (chooseText) {
                chooseText.addEventListener('click', (event) => {
                    event.stopPropagation(); // 防止點選選擇的時候觸發關閉
                    if (img) {
                        profileImage.src = img.src; // 換完之後把popup關掉
                    }
                });
            }
    });

    // 點 popup 以外的地方，關掉 popup
    document.addEventListener('click', (event) => {
        if (!profilePopup.contains(event.target as Node) && event.target !== editIcon) {
            profilePopup.style.display = 'none';
        }
    });
}

  export function setupUserManagePage() {
    setupSidebarToggle();
    // 等待 DOM 渲染完成後執行
    setTimeout(() => {
        setupUserManage();
        setupProfilePopup();
    }, 0);
    

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