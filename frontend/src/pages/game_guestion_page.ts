import { loadCSS } from './utils';
import { setupGameGuestion } from '../main';

export function renderGameGuestion(): string {
    loadCSS("/css/styles.css");
    return `
    <div class="page-title" style="font-family: 'IM Fell English', serif;">
        <h2>LISTENER AI</h2>
</div>

<div class="conversation-wrapper" >
    <div class="gt-container" style="margin-bottom:50px; padding-bottom:3px;width:52%;">
        <h4 style="margin:3vh 0 2vh 0;">遊戲習慣調查</h4>
        
        <form id="game_guestion_form" class="game-type-content">
            <p style="font-size: 16px; margin-bottom: -23px;">
              <b>網路遊戲成癮量表&nbsp;</b>
              <span style="color: red; font-size: 13px;">*&nbsp;</span><span style="font-size: 12px;">測驗結果可在帳號管理中查看，謝謝。</span><span style="color: red; font-size: 13px;">*</span>
            </p>
            <div style="display: flex; justify-content: flex-end; margin-bottom: 5px; border-bottom: 1px solid white;">
                <p style="margin: 0; font-size: 13px; margin-bottom: 12px;"><b>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;不曾、有時&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;經常</b></p>
            </div>
          
            <div class="gt-input">
                <div class="gq">
                    <p style="margin: 0; flex: 1;">
                    1. 當你沒有玩線上遊戲時，你多常幻想自己在玩線上遊戲、想著過去<br>玩遊戲的事、或期待下次的遊戲？
                    </p>
                    <label style="margin-left: 10px;"><input type="radio" name="q1" value="0" required></label>
                    <label style="margin-left: 46px;"><input type="radio" name="q1" value="1" required></label>
                </div>
            
                <div class="gq">
                    <p style="margin: 0; flex: 1;">
                    2. 當你不能玩線上遊戲或玩得比平常少時，你多常感到靜不下心、<br>煩躁、焦慮或悲傷？
                    </p>
                    <label style="margin-left: 10px;"><input type="radio" name="q2" value="0" required></label>
                    <label style="margin-left: 46px;"><input type="radio" name="q2" value="1" required></label>
                </div>

                <div class="gq">
                    <p style="margin: 0; flex: 1;">
                    3. 在過去的 12 個月裡，你感覺需要更常玩線上遊戲，或打更久的<br>時間才覺得你玩夠了?
                    </p>
                    <label style="margin-left: 10px;"><input type="radio" name="q3" value="0" required></label>
                    <label style="margin-left: 46px;"><input type="radio" name="q3" value="1" required></label>
                </div>

                <div class="gq">
                    <p style="margin: 0; flex: 1;">
                    4. 在過去的 12 個月裡，你曾經試著減少花在線上遊戲的時間，<br>但沒有成功?
                    </p>
                    <label style="margin-left: 10px;"><input type="radio" name="q4" value="0" required></label>
                    <label style="margin-left: 46px;"><input type="radio" name="q4" value="1" required></label>
                </div>

                <div class="gq">
                    <p style="margin: 0; flex: 1;">
                    5. 在過去的 12 個月裡，你曾經會玩線上遊戲而沒和朋友見面，或<br>不再從事你以前常參加的嗜好活動?
                    </p>
                    <label style="margin-left: 10px;"><input type="radio" name="q5" value="0" required></label>
                    <label style="margin-left: 46px;"><input type="radio" name="q5" value="1" required></label>
                </div>

                <div class="gq">
                    <p style="margin: 0; flex: 1;">
                    6. 即使線上遊戲的負面影響（例如減少睡眠、無法把學業或工作做好、<br>與家人或朋友爭吵、或無視於重要的責任），你還是玩很多?
                    </p>
                    <label style="margin-left: 10px;"><input type="radio" name="q6" value="0" required></label>
                    <label style="margin-left: 46px;"><input type="radio" name="q6" value="1" required></label>
                </div>

                <div class="gq">
                    <p style="margin: 0; flex: 1;">
                    7. 你曾試著不讓你的家人、朋友或其他重要的人知道你玩線上遊戲的<br>時間，或你曾對他們謊稱你玩線上遊戲的情形?
                    </p>
                    <label style="margin-left: 10px;"><input type="radio" name="q7" value="0" required></label>
                    <label style="margin-left: 46px;"><input type="radio" name="q7" value="1" required></label>
                </div>

                <div class="gq">
                    <p style="margin: 0; flex: 1;">
                    8. 你曾玩線上遊戲來舒解負面的情緒（例如感到無助、內疚、或焦慮）?
                    </p>
                    <label style="margin-left: 10px;"><input type="radio" name="q8" value="0" required></label>
                    <label style="margin-left: 46px;"><input type="radio" name="q8" value="1" required></label>
                </div>

                <div class="gq">
                    <p style="margin: 0; flex: 1;">
                    9. 你曾因為玩線上遊戲而可能危害或失去重要的人際關係?
                    </p>
                    <label style="margin-left: 10px;"><input type="radio" name="q9" value="0" required></label>
                    <label style="margin-left: 46px;"><input type="radio" name="q9" value="1" required></label>
                </div>

                <div class="gq">
                    <p style="margin: 0; flex: 1;">
                    10. 在過去的 12 個月裡，你曾經因為玩線上遊戲而使你在學校或工作<br>的表現陷入重大危機?
                    </p>
                    <label style="margin-left: 10px;"><input type="radio" name="q10" value="0" required></label>
                    <label style="margin-left: 46px;"><input type="radio" name="q10" value="1" required></label>
                </div>
            </div>
            <div style="display: flex; justify-content: center; margin-top: 10px;">
                <button id="button_gameguestion" type="submit" class="custom-button"
                style="width: 43%; border-radius:18px;">完成</button>
            </div>
          </form>
          
    </div>
</div>`;
}

// 動態添加事件處理程序
export function setupGameGuestionPage() {
    setupGameGuestion();
    // 動態移除不需要的 CSS
    const unwantedCSS = document.querySelector('link[href="/css/index_for_merge.css"]');
    if (unwantedCSS) {
        unwantedCSS.remove();
    }
}