import { loadCSS } from './utils';
import AOS from 'aos';
import { logout, endSession, tapToStart } from '../main'; // 如果 GetUserID 在 main.ts 中，請確保正確導入
import { initializeHeygen } from '../heygen';

export function renderMerge(): string {
    // 載入所需的 CSS 文件
    loadCSS("/css/styles.css");
    loadCSS("/css/index_for_merge.css");

    return `
    <style>
        /* 確保初始時 conversationPage 隱藏 */
        #conversationPage {
            display: none;
        }

        #startPage {
            position: relative;
            display: inline-block;
        }
    </style>

    <!-- Tap to Start 畫面 -->
    <div id="startPage" class="content" data-aos="fade-in">
        <h1>LISTENER AI</h1>
        <button id="startSession" class="start-button">TAP TO START...</button>
    </div>

    <div
        style="position: fixed; top: 4%; left: 25px; width: 98%; display: flex; justify-content: space-between; align-items: center; z-index:1000;">
        <button 
            style="background-color: transparent;color: white;border: none;outline: none;cursor: pointer;">
            <i id="menu-icon" class="fas fa-bars menu-icon"></i>
        </button>
        <div id="welocmediv" style="width: 16%;display: flex; align-items: center; gap:4%; flex-wrap: nowrap;/*不要換行*/">
            <!-- <img src="img/vicky_square.png" style="width: auto; height: 4vh; border-radius: 50%;">
            <p style="color:white; margin: 0;font-size: 17px;">陳安安，您好</p> -->
        </div>
    </div>

    <div class="sidebar" id="sidebar">
        <a href="/guide" data-link>新手指南</a>
        <a href="/select_avatar" data-link>選擇夥伴</a>
        <a href="/summary" data-link>摘要查詢</a>
        <a href="/conclusion" data-link>總結查詢</a>
        <a href="/backpack" data-link>我的背包</a>
        <a href="/user_manage" data-link>帳號管理</a>
        <a id="logout_button" style="cursor: pointer;">登出</a>
    </div>

    <!-- Conversation 畫面（預設隱藏） -->
    <div id="conversationPage">
        <article style="background-color: #EDE9BA; width: 99%; height: 100%; border-radius: 5px; 
                padding: 10px; display:flex; align-items: center; justify-content: center;">
            <div id="videoLoading" style="position: absolute; z-index: 2; display: flex;
                    flex-direction: column; align-items: center; justify-content: center; width: 100%; height: 100%; top: 0; left: 0;">
                <video src="img/happywait.webm" autoplay loop muted playsinline style="width:10%;"></video>
                <p style="font-size: 18px;">夥伴準備中，請稍後...</p>
            </div>
            <video id="avatarVideo" autoplay playsinline style="width:685px; height: 384px;"></video>
        </article>

        <div id="voiceStatus" style="color: white; font-size:16px"></div>

        <div style="display: flex; justify-content: flex-end; gap: 8px; position: relative; margin-top: 5px; margin-left: 50%;">

            <button id="recordButton" class="custom-button">
                <i class="fas fa-microphone" style="color: white;"></i>&nbsp;開始錄音
            </button>
            <button id="interruptButton" class="custom-button">中斷回覆</button>
            <button id="endSession" disabled class="custom-button">結束相談</button>
        </div>
    </div>

    <div id="overlay" class="overlay"></div><!-- 遮罩 -->

    <div class="conversation-jump" style="display: none">
        <div class="jump-wrapper">
            <h4 id="rewardtitle">相談已結束 獲得碎片X1</h4>
            <p id="rewardname" style=" font-size: 17px; margin: 0;"></p>
            <img id="rewardimg" src="" style="width: 73%; height:auto; border-radius: 3px; margin: 0;">
            <p id="rewardstory" style=" font-size: 13px; line-height: 1.5; margin: 0;margin-bottom: 5px; width: 85%; ">
            </p>
        </div>
    </div>
    `;
}

// 初始化 AOS 動畫的函數
function initializeAOS() {
    AOS.init(); // 初始化 AOS 動畫
}

// 設置 TAP TO START
function setupStartSessionButton() {
    const startSessionButton = document.getElementById("startSession");
    const startPage = document.getElementById("startPage");
    const conversationPage = document.getElementById("conversationPage");

    if (startSessionButton && startPage && conversationPage) {
        startSessionButton.addEventListener("click", () => {
            startPage.style.display = "none"; // 隱藏開始畫面
            conversationPage.style.display = "block"; // 顯示對話畫面
        });
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

// 設置 Loading 畫面
function setupLoadingScreen() {
    const video = document.getElementById("avatarVideo") as HTMLVideoElement;
    const loading = document.getElementById("videoLoading");

    if (video && loading) {
        loading.style.display = "flex"; // 顯示 loading 畫面

        video.addEventListener("canplay", () => {
            loading.style.display = "none"; // 隱藏 loading 畫面
        });
    }
}

function disableIcon(icon: HTMLElement) {
    console.log("禁用靜音圖標");
    icon.style.pointerEvents = "none"; // 禁止點擊
    icon.style.opacity = "0.5"; // 調整透明度表示禁用狀態
}

function enableIcon(icon: HTMLElement) {
    console.log("啟用靜音圖標");
    icon.style.pointerEvents = "auto"; // 恢復點擊
    icon.style.opacity = "1"; // 恢復正常透明度
}

export function setupMergePage() {
    initializeAOS(); // 初始化 AOS 動畫
    setupStartSessionButton();
    setupSidebarToggle(); 
    setupLoadingScreen(); 
    tapToStart();

    const endSessionButton = document.getElementById("endSession") as HTMLButtonElement;
    if (endSessionButton) {
        endSessionButton.addEventListener("click", endSession); // 綁定 endSession 函數
    }

    const logoutButton = document.getElementById("logout_button") as HTMLAnchorElement;
    if (logoutButton) {
        logoutButton.addEventListener("click", () => {
            logout(); // 調用登出函數
        });
    }

    // 延遲初始化 Heygen，確保 DOM 已渲染
    setTimeout(() => {
        initializeHeygen();
    }, 0);

    const startSessionButton = document.getElementById("startSession");
    const audio = document.getElementById("bgm") as HTMLAudioElement;
    const icon = document.getElementById("bgm-icon") as HTMLElement;

    if (startSessionButton) {
        console.log("startSession 按鈕已找到，綁定事件");
        startSessionButton.addEventListener("click", () => {
            console.log("startSession 按鈕被點擊");

            // 暫停音樂
            if (audio) {
                audio.pause();
                localStorage.setItem("bgm-muted", "true"); // 更新靜音狀態到 localStorage
                icon.className = "fa-solid fa-volume-xmark"; // 更新圖標為靜音狀態
                console.log("音樂已暫停，圖標已更新為靜音");
            } else {
                console.error("audio 元素未找到");
            }

            // 禁用靜音圖標
            disableIcon(icon);
        });
    } else {
        console.error("startSession 按鈕未找到");
    }

    if (endSessionButton) {
        console.log("endSession 按鈕已找到，綁定事件");
        endSessionButton.addEventListener("click", () => {
            console.log("endSession 按鈕被點擊");

            // 啟用靜音圖標
            enableIcon(icon);
        });
    } else {
        console.error("endSession 按鈕未找到");
    }
}