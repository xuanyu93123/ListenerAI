import { loadCSS } from './utils';
import { setupGameType } from '../main';

export function renderGameType(): string {
    loadCSS("/css/styles.css");
    return `
    <div class="page-title" style="font-family: 'IM Fell English', serif;">
        <h2>LISTENER AI</h2>
    </div>

<div class="conversation-wrapper">
    <div class="gt-container">
        <h4 style="margin:3vh 0 2vh 0;">遊戲習慣調查</h4>
        
        <form id="game_type_form" class="game-type-content" >
            <p style="font-size: 16px; margin-bottom: 11px;">
                <b>請勾選您有在遊玩的遊戲類型</b><span style="font-size: 12px;">（可複選）</span>
            </p>
            <div class="gt-input">
                <label><input type="checkbox" name="game_type" value="角色扮演遊戲"> 角色扮演遊戲（例:原神）</label>
                <label><input type="checkbox" name="game_type" value="戰鬥競技" > 戰鬥競技（例:傳說對決）</label>
                <label><input type="checkbox" name="game_type" value="射擊遊戲"> 射擊遊戲（例:荒野亂鬥）</label>
                <label><input type="checkbox" name="game_type" value="競速遊戲"> 競速遊戲（例:極限競速）</label>
                <label><input type="checkbox" name="game_type" value="體育遊戲"> 體育遊戲（例:NBA 2K24）</label>
                <label><input type="checkbox" name="game_type" value="動作遊戲"> 動作遊戲（例:艾爾登法環）</label>
                <label><input type="checkbox" name="game_type" value="戰略遊戲"> 戰略遊戲（例:星海爭霸）</label>
                <span style="display:flex;">
                    <p style="margin:0;">其他:</p>
                    <input  name="game_type" 
                        style="display:flex; background-color: #f6f2dc; width: 50%; border: none; height:20px;
                                border-bottom: 1.5px solid #7e736d; font-size: 12px; border-radius: 5px; 
                                font-family: 'Noto Serif TC', serif; margin-left:10px;" 
                        type="text" placeholder="請輸入遊戲類型">
                    </label>
                </span>
            </div>

        </form>
        <button type="submit" id="game_type_button" form="game_type_form" class="custom-button" style="width: 90%; border-radius:18px;">下一步</button>
    </div>
</div>`;
}

// 動態添加事件處理程序
export function setupGameTypePage() {
    setupGameType();

    // 動態移除不需要的 CSS
    const unwantedCSS = document.querySelector('link[href="/css/index_for_merge.css"]');
    if (unwantedCSS) {
        unwantedCSS.remove();
    }
}