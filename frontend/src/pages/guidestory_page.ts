import { loadCSS } from './utils';
import { setupGuidestory } from '../main';

export function renderGuidestory(): string {
    loadCSS("/css/guidestory.css");
    return `
    <div class="black-bottom">
        <p >儘管通往森林之路佈滿試煉和挑戰，但您的旅途並不孤單，<br>
            LISTENER AI如守護精靈般，為您指引方向，引領您穿越迷霧，進行自我覺察。<br>
            冒險者，踏出第一步，探索屬於您的光芒與答案吧！</p>
    
            <!-- <button class="custom-button">上一部</button> -->
            <button id="button_gs" name="button_gs" class="custom-button">完成</button>
    </div> 
    <audio id="narration-audio" src="/story2.wav" preload="auto"></audio>
    `;
  }
  
  export function setupGuidestoryPage() {
    setupGuidestory();
    // 播放旁白音檔
    const narrationAudio = document.getElementById("narration-audio") as HTMLAudioElement;
    if (narrationAudio) {
        narrationAudio.play().catch((error) => {
            console.error("旁白音檔播放失敗:", error);
        });
    }
  }