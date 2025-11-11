import { loadCSS } from './utils';
import { setupRegister } from '../main';

export function renderRegister(): string {
    loadCSS("/css/styles.css");
    return `
    <div class="page-title" style="font-family: 'IM Fell English', serif;">
           <h2>LISTENER AI</h2>
   </div>

   <div class="conversation-wrapper">
       <div class="regis-container" >
           <h4 style="margin:3vh 0 1vh 0;">註冊</h4>
           <form id="RegisterForm" class="regis-form">

               <!--new 頭貼區-->
               <div style="position: relative;">
                   <div class="profile-container">
                       <img id="profile-image" src="img/pet_profile.png" alt="頭像">
                       <label class="edit-icon">
                       <i class="fas fa-pen"></i>
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
                    </div>                        
                </div>
        
               <!---->
               <div class="half-input-container">
                    <input id="u_name" name="u_name" type="text" placeholder="姓名" required>
                    <input id="u_date" name="u_date" type="text" placeholder="出生年月"
                        min="2005-12" max="2019-12"
                        onfocus="this.type='month'; this.placeholder='';"
                        onblur="if(!this.value) { this.type='text'; this.placeholder='出生年月'; }">
               </div>

               <input id="u_id" name="u_id" type="text" pattern="[a-zA-Z0-9._%+\-]+@gmail\.com" placeholder="使用者本人電子郵件" required>
               <input id="u_password" name="u_password" type="password" placeholder="密碼" required>
               
               <select id="u_gender" name="" required>
                    <option value="" disabled selected>選擇性別</option>
                    <option value="male">男</option>
                    <option value="female">女</option>
               </select>
               <a href="/login" data-link>已擁有帳戶? ｜登入</a>
               <button id="regSubmit" class="custom-button" style="margin-top: 0;">下一步</button>
           </form>
        </div>
   </div>
    `;
}

// 動態添加事件處理程序
export function setupRegisterPage() {
    setupRegister();

    const editIcon = document.querySelector('.edit-icon') as HTMLElement;
    const profilePopup = document.getElementById('profile-pic-popup') as HTMLElement;
    const profileImage = document.getElementById('profile-image') as HTMLImageElement;
    const picOptions = document.querySelectorAll('.pic-option');

    if (editIcon && profilePopup && profileImage) {
        // 點鉛筆，切換popup顯示/隱藏
        editIcon.addEventListener('click', () => {
            profilePopup.style.display = (profilePopup.style.display === 'flex') ? 'none' : 'flex';
        });

        // 按選擇 可以換頭貼
        picOptions.forEach(option => {
            const img = option.querySelector('img') as HTMLImageElement;
            const chooseText = option.querySelector('.choose-text') as HTMLElement;

            chooseText.addEventListener('click', () => {
                profileImage.src = img.src; // 換成點到的那張圖
                profilePopup.style.display = 'none'; // 換完之後把popup關掉
            });
        });
    }
}