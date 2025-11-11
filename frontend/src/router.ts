import AOS from 'aos';
import { renderIndex } from "./pages/index_page";
import { renderLogIn, setupLoginPage } from "./pages/login_page";
import { renderRegister, setupRegisterPage } from "./pages/register_page";
import { renderRegister2, setupRegister2Page } from "./pages/register2_page";
import { renderGameType, setupGameTypePage } from "./pages/game_type_page";
import { renderGameGuestion, setupGameGuestionPage } from "./pages/game_guestion_page";
import { renderMerge, setupMergePage } from "./pages/merge_page";
import { renderSelectAvatar, setupSelectAvatarPage } from './pages/select_avatar_page';
import { renderGuide, setupGuidePage } from './pages/guide_page';
import { renderSummary, setupSummaryPage } from './pages/summary_page';
import { renderConclusion, setupConclusionPage } from './pages/conclusion_page';
import { renderUserManage, setupUserManagePage } from './pages/user_manage_page';
import { renderBackpack, setupBackpackPage } from './pages/backpack_page';
import { renderWait, setupWaitPage } from './pages/wait_page';
import { renderGuidestory1, setupGuidestory1Page } from './pages/guidestory1_page';
import { renderGuidestory, setupGuidestoryPage } from './pages/guidestory_page';

const routes: Record<string, () => string> = {
  "/": renderIndex,
  "/login": renderLogIn,
  "/register": renderRegister,
  "/register2": renderRegister2,
  "/game_type": renderGameType,
  "/game_guestion": renderGameGuestion,
  "/merge": renderMerge,
  "/select_avatar": renderSelectAvatar,
  "/guide": renderGuide,
  "/summary": renderSummary,
  "/conclusion": renderConclusion,
  "/user_manage": renderUserManage,
  "/backpack": renderBackpack,
  "/wait": renderWait,
  "/guidestory1": renderGuidestory1,
  "/guidestory": renderGuidestory,
};

export function navigate(path: string) {
  const app = document.getElementById("app");
  if (!app) {
    console.error("Error: #app container not found");
    return; // 停止執行
  }

  const view = routes[path] || (() => "<h1>404 Not Found</h1>");
  app.innerHTML = view(); // 渲染對應的頁面內容

  // 動態切換音樂來源
  const audio = document.getElementById("bgm") as HTMLAudioElement;
  if (audio) {
    const isGuideStoryPage = path === "/guidestory" || path === "/guidestory1";
    const newSource = isGuideStoryPage ? "/guide_bgm.mp3" : "/background_bgm.mp3";

    if (audio.src !== location.origin + newSource) {
      audio.src = newSource;
      audio.play().catch(() => { });
    }
  }

  // 動態調用頁面專屬的初始化函數
  if (path === "/register") {
    setupRegisterPage();
  }
  if (path === "/register2") {
    setupRegister2Page();
  }
  if (path === "/game_type") {
    setupGameTypePage();
  }
  if (path === "/game_guestion") {
    setupGameGuestionPage();
  }
  if (path === "/merge") {
    setupMergePage();
  }
  if (path === "/login") {
    setupLoginPage();
  }
  if (path === "/select_avatar") {
    setupSelectAvatarPage();
  }
  if (path === "/guide") {
    setupGuidePage();
  }
  if (path === "/summary") {
    setupSummaryPage();
  }
  if (path === "/conclusion") {
    setupConclusionPage();
  }
  if (path === "/user_manage") {
    setupUserManagePage();
  }
  if (path === "/backpack") {
    setupBackpackPage();
  }
  if (path === "/guidestory") {
    setupGuidestoryPage();
  }
  if (path === "/guidestory1") {
    setupGuidestory1Page();
  }
  if (path === "/wait") {
    setupWaitPage();
  }

  // 刷新 AOS 動畫
  AOS.refresh();

  document.body.style.overflow = "auto"; // 恢復滾動
  document.body.style.position = "static"; // 確保正常定位
  document.body.style.overflow = "auto"; // 恢復滾動
  document.body.style.position = "static"; // 確保正常定位

  history.pushState({}, "", path);
}

export function setupRouter() {
  document.body.addEventListener("click", (e) => {
    const target = e.target as HTMLAnchorElement;
    if (target.matches("a[data-link]")) {
      e.preventDefault(); // 阻止默認行為
      navigate(target.getAttribute("href")!); // 使用自定義路由邏輯
    }
  });

  window.addEventListener("popstate", () => {
    navigate(location.pathname); // 處理瀏覽器的前進/後退按鈕
  });
}
