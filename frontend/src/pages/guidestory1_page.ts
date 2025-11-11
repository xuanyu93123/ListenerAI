import { loadCSS } from './utils';
export function renderGuidestory1(): string {
    loadCSS("/css/guidestory.css");
    return `
    <div class="black-bottom">
        
            <p >在遙遠的世界盡頭，有一片薄霧籠罩的奇幻森林—「心靈樹海」，<br>
                蘊藏無數奧秘，既是迷途者的挑戰之地，也是啟迪心靈的聖所。<br>
                每位踏入此地的冒險者都攜帶著自己的故事，心靈樹海以其神秘力量，<br>
                陪伴您洞悉內心的真實，也賜予您療癒與選擇新方向的勇氣。
                </p>
        <a href="/guidestory" data-link style="text-decoration: none;">
            <button class="custom-button">下一頁</button>
        </a>
    </div> 
    <audio id="narration-audio" src="/story1.wav" preload="auto"></audio>
    `;
  }
  
  export function setupGuidestory1Page() {
    // 播放旁白音檔
    const narrationAudio = document.getElementById("narration-audio") as HTMLAudioElement;
    if (narrationAudio) {
        narrationAudio.play().catch((error) => {
            console.error("旁白音檔播放失敗:", error);
        });
    }
}