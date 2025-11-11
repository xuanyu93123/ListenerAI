export function renderAudioPlayer() {
    // 先移除舊的 audio player，避免重複
    const oldPlayer = document.getElementById("audio-player");
    if (oldPlayer) oldPlayer.remove();

    const audioPlayer = document.createElement("div");
    audioPlayer.id = "audio-player";
    audioPlayer.style.position = "fixed";
    audioPlayer.style.bottom = "20px";
    audioPlayer.style.right = "20px";
    audioPlayer.style.zIndex = "1000";
    audioPlayer.style.cursor = "pointer";

    // 動態設置音樂來源
    const currentPath = window.location.pathname;
    const isGuideStoryPage = currentPath === "/guidestory" || currentPath === "/guidestory1";
    const bgmSource = isGuideStoryPage ? "/guide_bgm.mp3" : "/background_bgm.mp3";

    audioPlayer.innerHTML = `
      <audio id="bgm" loop>
        <source src="${bgmSource}" type="audio/mpeg" />
        Your browser does not support the audio element.
      </audio>
      <i id="bgm-icon" class="fa-solid fa-volume-xmark" style="font-size: 24px; color: white"></i>
    `;

    document.body.appendChild(audioPlayer);

    const audio = audioPlayer.querySelector<HTMLAudioElement>("#bgm")!;
    const icon = audioPlayer.querySelector<HTMLElement>("#bgm-icon")!;

    // 音量設定
    audio.volume = 0.1;

    // 音樂開關狀態儲存在 localStorage
    const isMuted = localStorage.getItem("bgm-muted") === "true";

    // 初始化圖標與音樂狀態
    if (isMuted) {
        audio.pause();
        audio.muted = true;
        icon.className = "fa-solid fa-volume-xmark";
    } else {
        audio.muted = false;
        icon.className = "fa-solid fa-volume-high";
        // 只有在不是 muted 時才自動播放
        audio.play().catch(() => {});
    }

    // 切換音樂播放狀態
    icon.addEventListener("click", () => {
        if (icon.style.pointerEvents === "none") {
            console.log("靜音圖標已被禁用，無法點擊");
            return;
        }

        if (audio.paused || audio.muted) {
            audio.muted = false;
            audio.play();
            localStorage.setItem("bgm-muted", "false");
            icon.className = "fa-solid fa-volume-high";
        } else {
            audio.pause();
            audio.muted = true;
            localStorage.setItem("bgm-muted", "true");
            icon.className = "fa-solid fa-volume-xmark";
        }
    });

    // 儲存播放進度
    audio.addEventListener("timeupdate", () => {
        localStorage.setItem("bgm-current-time", audio.currentTime.toString());
    });

    // 恢復播放進度
    const savedTime = localStorage.getItem("bgm-current-time");
    if (savedTime) {
        audio.currentTime = parseFloat(savedTime);
    }
}