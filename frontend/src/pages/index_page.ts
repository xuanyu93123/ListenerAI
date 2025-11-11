import { loadCSS } from './utils';
export function renderIndex(): string {
    loadCSS("/css/index.css");
    return `
      <!-- 首頁 Hero 區塊 -->
        <section class="section hero" >
            <div data-aos="fade-up" data-aos-duration="1200">
                <h1 >LISTENER AI</h1>
                <a href="/login" data-link>
                    <button class="start-button" style=" font-family: 'Noto Serif TC', serif; letter-spacing: 2px;">註冊 / 登入</button>
                </a>
            </div>
            <a href="#intro"  class="scroll-down-indicator" >
                <i class="fas fa-chevron-down"></i>
            </a>
        </section>
    
        <!--====== intro =======-->
        <section class="section intro" id="intro" >
            <!--成癮世代的隱憂-->
            <div data-aos="fade-in" data-aos-duration="1100" 
                 style="display: flex; flex-direction: column; align-items: center; text-align: center; margin-bottom: 8%;">
                 <div style="display: flex; align-items: center; ">
                    <i class="fa-solid fa-gamepad" style="font-size: 28px; color: #986a4f;" ></i>
                    <p style="font-size: 22px; margin: 0; font-family: 'Cactus Classical Serif', serif;">
                        &nbsp;成癮世代的隱憂</p>
                 </div>
                <p style="width:auto; font-size: 18px; margin:1.5% 0 4% 0;">
                    世界衛生組織將「網路遊戲成癮 (Gaming disorder)」列為成癮行為之一，<br>
                    青少年及兒童的網路成癮問題令人關切，亟需加以提出因應之道。</p>
            </div>
            <!--左右區-->
            <div class="intro-card" data-aos="slide-up" data-aos-duration="1000">
                <div class="intro-card-row">
                    
                  <div class="intro-card-half">
                    <div class="intro-card-bubble">網路遊戲<br>成癮情況</div>
                    <p style="margin-left: 4%;">
                        台灣青少年玩家的網路遊戲成癮高於歐洲等<br>
                        國家，這項成癮不僅影響孩子的學習以及<br>
                        日常生活，也讓父母在教育上面臨瓶頸</p>
                  </div>

                  <div class="intro-card-half">
                    <div class="intro-card-bubble">真人諮商<br>成本較高</div>
                    <p style="margin-right: 4%;">
                        有的家庭為減緩成癮狀況，孩童及家長主動<br>
                        尋求醫師或諮商心理師協助，但過程需耗費<br>
                        大量時間、金錢成本。較難獲得即時的幫助</p>
                  </div>

                </div>
              </div>    

            <!--我們的系統-->
            <div data-aos="fade-in" data-aos-duration="1100" 
                 style="display: flex; flex-direction: column; align-items: center; text-align: center; margin:10% 0 3% 0;">
                 <div style="display: flex; align-items: center;">
                    <i class="fa-solid fa-lightbulb" style="font-size: 28px; color: #986a4f;" ></i>
                    <p style="font-size: 22px; margin: 0; font-family: 'Cactus Classical Serif', serif; ">&nbsp;我們的系統</p>
                 </div>
                <p style="width: auto; font-size: 18px; margin:1.5% 0 2% 0;">
                    隨著遊戲成癮逐漸被重視，我們看見了成癮者與家庭所面臨的挑戰。<br>
                    我們希望透過 LISTENER AI，提供一種更友善、可及的支持方式。
                </p>
            </div>
            <!--輪播區-->
            <div class="carousel">
                <!--01-->
                <div class="carousel-card" data-aos="fade-up" data-aos-duration="700">
                    <div class="carousel-header">
                        <div class="c-bubble"><h2>01</h2></div>
                        <p class="carousel-title">AI虛擬人真實相談體驗</p>
                    </div>
                    <div class="carousel-light">
                        <ul >
                            <li>虛擬人像提供生動表情及動作<br>
                                回覆，營造如真人般的交流</li>
                            <li>降低與真人對話的壓力，引導<br>
                                使用者更自在地表達情緒</li>
                        </ul>
                        <i class="fa-solid fa-desktop" ></i>
                    </div>
                </div>
                <!--02-->
                <div class="carousel-card" data-aos="fade-up" data-aos-duration="1000">
                    <div class="carousel-header">
                        <div class="c-bubble"><h2>02</h2></div>
                        <p class="carousel-title">話題連續性、歷程可回顧</p>
                    </div>
                    <div class="carousel-light">
                        <ul >
                            <li>系統自動整理每次相談摘要，<br>
                                方便回顧歷程與成長軌跡</li>
                            <li>根據使用者過往對話與新訊息<br>AI能回應連貫的相談內容</li>
                        </ul>
                        <i class="fa-solid fa-user-clock"></i>
                    </div>
                </div>
                <!--03-->
                <div class="carousel-card" data-aos="fade-up" data-aos-duration="1300">
                    <div class="carousel-header">
                        <div class="c-bubble"><h2>03</h2></div>
                        <p class="carousel-title">遊戲式獎勵，提升沉浸感</p>
                    </div>
                    <div class="carousel-light">
                        <ul>
                            <li>每次完成相談可獲得故事與碎片，完成六次相談可解鎖完整圖片與劇情，並可下載收藏</li>
                        </ul>
                        <i class="fa-solid fa-puzzle-piece"></i>
                    </div>
                </div>
            </div>
            <!--輪播end-->
        </section>

        <!-- 頁尾 
        <section class="section footer">
            <p>&copy; 2025 LISTENER AI. All rights reserved.</p>
        </section>-->


    
    
    `;
  }
  