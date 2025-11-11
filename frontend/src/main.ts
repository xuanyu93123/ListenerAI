import axios from 'axios';
import { summarizeConversations } from './summaryfunction';
import { navigate, setupRouter } from "./router";
import { renderAudioPlayer } from "./components/audioPlayer";

document.addEventListener("DOMContentLoaded", () => {
    renderAudioPlayer(); // 音樂播放器初始化
    setupRouter(); // 初始化路由
    navigate(location.pathname); // 加載當前路徑的內容
});

// 註冊功能-register1
export async function setupRegister() {
    const RegisterForm = document.getElementById("RegisterForm") as HTMLFormElement;
    if (RegisterForm) {
        const u_img = document.getElementById("profile-image") as HTMLImageElement;
        const u_name = document.getElementById("u_name") as HTMLInputElement;//從 DOM（網頁結構）中選取一個 ID 為 u_name 的元素，並將該元素的類型明確指定為 HTMLInputElement
        const u_date = document.getElementById("u_date") as HTMLInputElement;
        const u_id = document.getElementById("u_id") as HTMLInputElement;
        const u_password = document.getElementById("u_password") as HTMLInputElement;
        const u_gender = document.getElementById("u_gender") as HTMLOptionElement;
        const Button_submit = document.getElementById("regSubmit") as HTMLButtonElement;


        RegisterForm.addEventListener("submit", async (event) => {
            event.preventDefault(); // 防止表單自動提交刷新頁面
            const u_birth = new Date(u_date.value);  // 因為document.getElementById("myDateInput") 回傳的是 HTMLElement（或更具體的 HTMLInputElement），而 Date 是 JavaScript 的內建類型，因此透過取得Input.value先取得string再轉換為 Date 物件
            if (!u_img || !u_name || !u_date || !u_id || !u_password || !u_gender) {
                alert("❌ 請輸入完整資料！");
                Button_submit.style.pointerEvents = "auto"; // 允許點擊事件
                Button_submit.style.opacity = "1";          // 回復正常不透明狀態
                return;
            }
            Button_submit.style.pointerEvents = "none";  // 禁止點擊事件
            Button_submit.style.opacity = "0.5";         // 讓按鈕變得透明，表示禁用狀態
            AgeCalculation(u_birth as Date);
        });

        //年齡計算
        function AgeCalculation(u_birth: Date) {
            const today: Date = new Date(); //當前日期，const 用來宣告不會變更的變數
            const birth: Date = u_birth; // 使用者的出生日期
            let age: number = today.getFullYear() - birth.getFullYear(); // 計算年齡，let 用來宣告會變更的變數
            const month: number = today.getMonth() - birth.getMonth();  // 比較當前月份與出生月份
            // 如果尚未過生日，則年齡減 1
            if (month < 0) {
                age--;
            }
            if (age < 0 || age > 125) { // 確保日期有效      
                alert("請輸入有效的日期！");
                Button_submit.style.pointerEvents = "auto"; // 允許點擊事件
                Button_submit.style.opacity = "1";          // 回復正常不透明狀態
                return;
            }
            AgeComparition(age);
        }

        //年齡比較
        async function AgeComparition(age: number) {
            if (age < 7) {
                alert("您尚未達到本系統的用戶年齡範圍");
                Button_submit.style.pointerEvents = "auto"; // 允許點擊事件
                Button_submit.style.opacity = "1";          // 回復正常不透明狀態
                return;
            }
            else if (age >= 7 && age <= 12) {//7~12為兒童
                const parentagree = "wait";
                const step = 0;
                const prompt_id = "asst_2U803tHi7Nwxu8rQdkW7RDRk";
                const result = await SendDataRegister(parentagree, step, prompt_id); // 等待 SendData() 完成，並接收回傳值，透過await取得Promise裡的值
                if (result == "success") {
                    alert("等待父母確認後才能繼續使用");
                    navigate("/register2");
                }
                else if (result == "same") {
                    alert("此電子郵件已被註冊，請使用其他電子郵件。");
                }
                else {
                    alert("資料插入失敗");
                    Button_submit.style.pointerEvents = "auto"; // 允許點擊事件
                    Button_submit.style.opacity = "1";          // 回復正常不透明狀態
                }
            }
            else if (age > 12 && age <= 18) {//13~18青少年
                const parentagree = "agree";
                const step = 0;
                const prompt_id = "asst_BTgaO0aRFTEUE8EbyaOwX2Vw";
                const result = await SendDataRegister(parentagree, step, prompt_id);
                if (result == "success") {
                    // alert("註冊完成");
                    navigate("/game_type")
                }
                else if (result == "same") {
                    Button_submit.style.pointerEvents = "auto"; // 允許點擊事件
                    Button_submit.style.opacity = "1";          // 回復正常不透明狀態
                    alert("此電子郵件已被註冊，請使用其他電子郵件。");
                }
                else {
                    Button_submit.style.pointerEvents = "auto"; // 允許點擊事件
                    Button_submit.style.opacity = "1";          // 回復正常不透明狀態
                    alert("資料插入失敗");
                }
            }
            else {
                alert("您的年齡已超過本系統的用戶年齡範圍");
                Button_submit.style.pointerEvents = "auto"; // 允許點擊事件
                Button_submit.style.opacity = "1";          // 回復正常不透明狀態
                return;
            }
        }

        async function SendDataRegister(ParentAgree: string, step: number, prompt_id: string) {
            const img = u_img.src; //使用者大頭貼
            // 將 /assets/ 後的部分取出（或你要的相對路徑）
            const finalsrc = img.replace(/^https?:\/\/[^/]+/, '');
            const name = u_name.value.trim();
            const date = u_date.value.trim();
            const email = u_id.value.trim();
            const password = u_password.value.trim();
            const parentagree = ParentAgree;
            const steps = step;
            const promptid = prompt_id;
            const gender = u_gender.value.trim();

            try {
                const response = await axios.post("http://localhost:5000/Register", {
                    name,
                    date,
                    email,
                    password,
                    parentagree,
                    steps,
                    promptid,
                    finalsrc,
                    gender
                });
                console.log("API 回應:", response.data);
                sessionStorage.setItem("user_id", email);
                return "success";

            } catch (error: any) {
                console.log("❌ insertUserData() 發生錯誤:", error);
                // 確認錯誤是來自於後端的錯誤
                if (error.response) {
                    const errorMessage = error.response.data.error;
                    console.log("後端錯誤訊息:", errorMessage);
                    if (errorMessage === "same") {
                        return "same";
                    }
                }
                return "error";  // 如果有其他錯誤，返回 'error'
            }
        }
    }
}

// 取得 userId 並檢查是否存在
export function GetUserID(): string {//保證 user_id 返回一個有效的 string
    const user_id = sessionStorage.getItem("user_id");//可能為string | undefined
    if (!user_id) {
        alert("未登入請重新登入！");
        navigate("/login"); // 導向登入頁面
        return ""; // 停止後續的程式碼執行
    }
    return user_id;
}

//註冊功能-register2
export async function setupRegister2() {
    const ParentGmailForm = document.getElementById("Register2Form") as HTMLFormElement;
    if (ParentGmailForm) {
        const p_gmail = document.getElementById("p_gmail") as HTMLInputElement;
        const p_gmail_submit = document.getElementById("parentgmailsubmit") as HTMLButtonElement;
        ParentGmailForm.addEventListener("submit", async (event) => {
            event.preventDefault(); // 防止表單自動提交刷新頁面
            p_gmail_submit.style.pointerEvents = "none";  // 禁止點擊事件
            p_gmail_submit.style.opacity = "0.5";         // 讓按鈕變得透明，表示禁用狀態
            const ParentGmail = p_gmail.value.trim();
            const user_id = GetUserID();
            if (user_id === ParentGmail) {
                alert("父母電子郵件不可與註冊帳號相同");
                p_gmail_submit.style.pointerEvents = "auto"; // 允許點擊事件
                p_gmail_submit.style.opacity = "1";          // 回復正常不透明狀態            
            }
            const sdg_result = await SendDataRegister2(user_id, ParentGmail);
            if (sdg_result === "success") {
                const csg_result = await CallSendGmail(user_id, ParentGmail);
                if (csg_result == "success") {
                    alert("郵件已成功發送到父母信箱");
                    navigate("/wait");
                }
                else {
                    alert("郵件發送失敗，請稍後再試");
                }
            }
        });

        async function SendDataRegister2(user_id: string, ParentGmail: string) {
            // Register2ResponseText.textContent = "⌛ 送出信件中...";

            try {
                const response = await axios.post("http://localhost:5000/Register2", {
                    user_id,
                    ParentGmail,
                });
                console.log("API 回應:", response.data);
                return "success";

            } catch (error: any) {
                console.error("❌ 錯誤:", error);
                // Register2ResponseText.textContent = `❌ 發生錯誤: ${error.response?.data?.error || error.message}`;
            }
        }

        //寄出第一封
        async function CallSendGmail(user_id: string, ParentGmail: string) {
            try {
                const response = await axios.post("http://localhost:5000/callsendgmail", {
                    user_id,
                    ParentGmail,
                });
                console.log("📩 API 回傳結果:", response.data);
                return "success";
            } catch (error) {
                console.error("❌ 郵件發送錯誤:", error);
                return "fail";
            }
        }
    }
}

// 登入功能-User
export function setupLogin() {
    const LoginForm = document.getElementById("LoginForm") as HTMLFormElement;
    const Button_loginsubmit = document.getElementById("loginsubmit") as HTMLButtonElement;
    if (LoginForm) {
        const u_id = document.getElementById("u_id") as HTMLInputElement;
        const u_password = document.getElementById("u_password") as HTMLInputElement;
        LoginForm.addEventListener("submit", async (event) => {
            event.preventDefault();
            Button_loginsubmit.style.pointerEvents = "none";  // 禁止點擊事件
            Button_loginsubmit.style.opacity = "0.5";         // 讓按鈕變得透明，表示禁用狀態
            const user_id = u_id.value.trim();
            const user_password = u_password.value.trim();
            try {
                const response = await axios.get(`http://localhost:5000/Login?user_id=${user_id}&user_password=${user_password}`);
                if (response.data.message == "right") {
                    alert("登入成功");
                    sessionStorage.setItem("user_id", user_id);
                    if (response.data.check == "agree") {
                        if (response.data.step == 0) {
                            navigate("/game_type");
                        }
                        else if (response.data.step == 1) {
                            navigate("/game_guestion");
                        }
                        else if (response.data.step == 2) {
                            navigate("/guidestory1");
                        }
                        else if (response.data.step == 3) {
                            navigate("/guide");
                        }
                        else if (response.data.step == 4) {
                            navigate("/select_avatar");
                        }
                        else if (response.data.step == "guestion") {
                            navigate("/game_guestion");
                        }
                        else {
                            navigate("/merge");
                        }
                    }
                    else {
                        navigate("/wait");
                    }
                }
                else if (response.data.message == "wrongid") {
                    alert("此帳號尚未註冊");
                    Button_loginsubmit.style.pointerEvents = "auto"; // 允許點擊事件
                    Button_loginsubmit.style.opacity = "1";          // 回復正常不透明狀態  
                }
                else if (response.data.message == "wrongpassword") {
                    alert("密碼錯誤");
                    Button_loginsubmit.style.pointerEvents = "auto"; // 允許點擊事件
                    Button_loginsubmit.style.opacity = "1";          // 回復正常不透明狀態
                }
                else {
                    alert("登入處理錯誤");
                    Button_loginsubmit.style.pointerEvents = "auto"; // 允許點擊事件
                    Button_loginsubmit.style.opacity = "1";          // 回復正常不透明狀態
                }
            }
            catch (error) {
                console.log("登入錯誤", error);
            }
        })
    }
}

//遊戲類型
export async function setupGameType() {
    const GameTypeForm = document.getElementById("game_type_form") as HTMLFormElement;
    if (GameTypeForm) {
        const gametype_button = document.getElementById("game_type_button") as HTMLButtonElement;

        GameTypeForm.addEventListener("submit", async (event) => {
            event.preventDefault(); // 防止表單自動提交刷新頁面

            const formData = new FormData(GameTypeForm);
            const selectedValues: string[] = [];

            formData.forEach((value, key) => {
                if (key === "game_type") {
                    selectedValues.push(value.toString());
                }
            })

            // 把空值（例如空字串或只有空白）都清掉
            const cleanedValues = selectedValues.filter(v => v !== "");
            console.log(selectedValues);

            // ✅ 驗證至少勾選一項
            if (cleanedValues.length === 0 || selectedValues[0] == null) {
                alert("請至少選擇一項遊戲類型！");
                return; // ❌ 中斷送出
            }
            gametype_button.style.pointerEvents = "none";  // 禁止點擊事件
            gametype_button.style.opacity = "0.5";         // 讓按鈕變得透明，表示禁用狀態
            SendDataGameType(cleanedValues);
        });

        async function SendDataGameType(cleanedValues: String[]) {
            const user_id = GetUserID();
            try {
                const response = await axios.post("http://localhost:5000/Gametype", {
                    user_id,
                    cleanedValues
                });

                if (response.data.message == "success") {
                    navigate("/game_guestion");
                }
            }
            catch (error) {
                console.error("❌遊戲類型post錯誤:", error);
                return "fail";
            }
        }
    }
}

//game guestion
export async function setupGameGuestion() {
    const game_guestion_form = document.getElementById("game_guestion_form") as HTMLFormElement;
    const button_gameguestion = document.getElementById("button_gameguestion") as HTMLFormElement;
    if (game_guestion_form) {
        game_guestion_form.addEventListener("submit", async (event) => {
            event.preventDefault(); // 防止表單自動提交刷新頁面
            SendDataGameGuestion();
        })
    }
    async function SendDataGameGuestion() {
        const formData = new FormData(game_guestion_form);
        const selectedValues: number[] = [];

        formData.forEach((value, key) => {
            if (key) {
                selectedValues.push(Number(value));
            }
        })

        console.log(selectedValues);

        const score = CalculationScore(selectedValues);

        const user_id = GetUserID();

        try {
            try {
                const response = await axios.post("http://localhost:5000/Gameguestion", {
                    user_id,
                    selectedValues,
                    score
                });

                if (response.data.message == "register") {
                    navigate("/guidestory1");
                }
                else {
                    alert("問卷評量成功提交，前往個案管理查看分數");
                    navigate("/user_manage");
                }
            }
            catch (error) {
                console.error("❌問卷調查post錯誤:", error);
                return "fail";
            }
        }
        catch (error) {
            console.error("❌問卷調查check錯誤:", error);
            return "fail";
        }
    }

    function CalculationScore(selectedValues: number[]) {
        let score = 0;
        for (let i = 0; i < selectedValues.length; i++) {
            score += selectedValues[i];
            if (i == 8 && selectedValues[i] == selectedValues[i + 1] && selectedValues[i] == 1) {
                score -= 1;
            }
        }
        return score;
    }
}


//guidestory
export async function setupGuidestory() {
    const guidestory_button = document.getElementById("button_gs") as HTMLButtonElement;
    if (guidestory_button) {
        guidestory_button.addEventListener("click", async () => {
            const user_id = GetUserID();
            try {
                await axios.post("http://localhost:5000/guidestory", {
                    user_id,
                })
                navigate("/guide");
                console.log("guidestory完成");
            }
            catch {
                console.log("guidestoryg 失敗 (main)");
            }
        });
    }
}

//tap to start 
export async function tapToStart() {
    const button_taptostart = document.getElementById("startSession") as HTMLButtonElement;
    const div_welcome = document.getElementById("welocmediv") as HTMLDivElement;
    const sidebar = document.getElementById("sidebar") as HTMLElement;

    if (!button_taptostart || !div_welcome) {
        console.error("必要的 DOM 元素未找到");
        return;
    }
    console.log("taptostart進入main");
    const user_id = GetUserID();
    // 歡迎某某某
    try {
        const response = await axios.get(`http://localhost:5000/welcome?user_id=${user_id}`);
        const src = response.data.src;
        const name = response.data.name;

        const Img = document.createElement("img");
        Img.style.width = "auto";
        Img.style.height = "4vh";
        Img.style.borderRadius = "50%";
        Img.src = src;
        div_welcome.appendChild(Img);

        const Name = document.createElement("p");
        Name.style.color = "white";
        Name.style.margin = "0";
        Name.style.fontSize = "17px";
        Name.innerText = "你好，" + name;
        div_welcome.appendChild(Name);
    } catch (error) {
        console.error("歡迎某某某 失敗", error);
    }
    //顯示navbar
    sidebar.style.display = "block";
    // 檢查今天是否相談過
    try {
        const response = await axios.get(`http://localhost:5000/taptostartcheck?user_id=${user_id}`);
        const today: Date = new Date();
        const formattedDate = today.toLocaleDateString('zh-TW', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
        }).replace(/\//g, '-'); // 替換掉所有的斜線（/）為破折號（-）

        console.log("response.data=", response.data, "today=", formattedDate);

        if (response.data === formattedDate) {
            // 禁止進行相談
            button_taptostart.style.pointerEvents = "none"; // 禁止點擊事件
            button_taptostart.style.opacity = "0.5"; // 讓按鈕變得透明，表示禁用狀態
        } else {
            button_taptostart.addEventListener("click", async () => {
                try {
                    await axios.post("http://localhost:5000/taptostart", {
                        user_id,
                    });
                    console.log("相談開始");
                } catch (error) {
                    console.error("相談開始失敗(main)", error);
                }
            });
        }
    } catch (error) {
        console.error("tap to start check 失敗", error);
    }
}

//end conversation
export async function endSession() {
    const user_id = GetUserID(); // 獲取使用者 ID
    try {
        const response = await axios.post("http://localhost:5000/endconversation", {
            user_id,
        });
        if (response.data === "success") {
            await ConversationTimeCalculation(user_id); // 計算相談時長
            await summarizeConversations(); // 總結相談內容
            console.log("相談結束");
        }
    } catch (error) {
        console.error("相談結束失敗(main)", error);
    }


    //計算相談時長-ConversationTimeCalculation
    async function ConversationTimeCalculation(user_id: string) {
        try {
            const response = await axios.get(`http://localhost:5000/conversationtimecalculation?user_id=${user_id}`);
            let duration = response.data.duration;
            if (!duration) {
                console.log(" 缺少時長 ");
                return;
            }
            GetUserBirth(user_id, duration);
        }
        catch {
            console.log("計算相談時長失敗(main)");
        }
    }

    //取得使用者生日
    async function GetUserBirth(user_id: string, duration: number) {
        try {
            const response = await axios.get(`http://localhost:5000/GetUserBirth?user_id=${user_id}`);
            const birth = new Date(response.data); // JSON 本身不支援 Date 型別，所以如果後端的 Reward 表裡有 Date 類型的欄位，後端回傳的 Date 會自動轉換成 string
            console.log("成功取得使用者生日", user_id);
            AgeCalculation2(user_id, birth, duration);
        } catch (error) {
            console.error("取得使用者生日錯誤(main):", error);
        }
    }

    //年齡計算2
    function AgeCalculation2(u_id: string, u_birth: Date, duration: number) {
        const today: Date = new Date(); //當前日期，const 用來宣告不會變更的變數
        const birth: Date = u_birth; // 使用者的出生日期
        let age: number = today.getFullYear() - birth.getFullYear(); // 計算年齡，let 用來宣告會變更的變數
        const month: number = today.getMonth() - birth.getMonth();  // 比較當前月份與出生月份
        // 如果尚未過生日，則年齡減 1
        if (month < 0 || (month === 0 && today.getDate() < birth.getDate())) {
            age--;
        }
        AgeDetermination(u_id, age, duration);
    }

    //年齡判斷
    function AgeDetermination(u_id: string, age: number, duration: number) {
        let identity: string;
        if (age <= 12) {
            identity = "child";
        }
        else {
            identity = "teenager";
        }
        ConversationTimes(u_id, identity, duration);
    }

    //判斷使用者為一幾次相談
    async function ConversationTimes(u_id: string, identity: string, duration: number) {
        try {
            const response = await axios.get(`http://localhost:5000/ConversationTimes?user_id=${u_id}`);
            if (response.data.message == "success") {
                const c_count = response.data.count + 1;
                console.log("c_count=", c_count);
                Eligibility(u_id, identity, duration, c_count);
            }
        }
        catch (error) {
            console.error("取得使用者相談次數失敗(main):", error);
        }
    }

    //判斷使用者有沒有資格獲得獎勵
    function Eligibility(u_id: string, identity: string, duration: number, c_count: number) {
        if ((identity == "child" && duration >= 900) || (identity == "teenager" && duration >= 3)) {
            UserRewardTimes(u_id, c_count);
        }
        else {
            let img = "img/noreward.png"; //suuuu 加了新照
            let title = "相談已結束"; //su
            let story: string;
            let name = "未獲得獎勵碎片";
            if (identity == "teenager") {
                story = "相談時長未滿20分鐘，下次還有機會!加油~!";
                ShowFailJump(img, title, name, story, c_count);
            }
            else {
                story = "相談時長未滿15分鐘，下次還有機會!加油~";
                ShowFailJump(img, title, name, story, c_count);
            }
        }
    }

    //顯示未領取到獎勵
    function ShowFailJump(img: string, title: string, name: string, story: string, c_count: number) {
        const html_img = document.getElementById("rewardimg") as HTMLImageElement;
        const html_title = document.getElementById("rewardtitle") as HTMLParagraphElement; //suuu
        const html_name = document.getElementById("rewardname") as HTMLParagraphElement;
        const html_story = document.getElementById("rewardstory") as HTMLParagraphElement;

        const overlay = document.getElementById("overlay") as HTMLDivElement; // suuuuuuuuu

        if (!html_img || !html_title || !html_name || !html_story || !overlay) {
            console.error("必要的 DOM 元素未找到");
            return;
        }

        html_img.src = img;
        html_title.innerText = title; //suuu
        html_name.innerText = name;
        html_story.innerText = story;


        // 顯示遮罩
        overlay.style.display = 'block';

        // 創建並插入按鈕區塊
        const buttonContainer = document.createElement("div");
        const button = document.createElement("a");
        button.classList.add("custom-button");
        button.style.opacity = "0";//一開始透明度為0
        button.style.transition = "opacity 0.5s";;//transition這個變化會用「漸漸變清楚」的方式呈現出來
        button.style.pointerEvents = "none"; // ❌ 初始時不能點擊

        if (c_count % 6 == 0) {
            button.innerText = "恭喜完成一輪相談!點擊進入問卷評量";
            // 等8秒後：顯示 + 開啟點擊
            setTimeout(() => {
                button.style.opacity = "1";
                button.style.pointerEvents = "auto"; // ✅ 開放點擊
                button.addEventListener("click", () => {
                    navigate("/game_guestion"); // 使用 router 進行跳轉
                });
            }, 8000);
        }
        else {
            button.innerText = "回首頁";
            // 等8秒後：顯示 + 開啟點擊
            setTimeout(() => {
                button.style.opacity = "1";
                button.style.pointerEvents = "auto"; // ✅ 開放點擊
                button.addEventListener("click", () => {
                    navigate("/merge"); // 使用 router 進行跳轉
                });
            }, 8000);
        }

        // 將按鈕加入按鈕容器
        // buttonContainer.appendChild(button1);
        buttonContainer.appendChild(button);

        // 將按鈕容器插入到頁面中
        const jumpElement = document.querySelector('.conversation-jump') as HTMLDivElement;
        jumpElement.appendChild(buttonContainer);

        // 顯示 jump
        jumpElement.style.display = 'block';
    }

    //判斷要獲得第幾個獎勵
    async function UserRewardTimes(u_id: string, c_count: number) {
        try {
            const response = await axios.get(`http://localhost:5000/UserRewardTimes?user_id=${u_id}`);
            let reward_times = response.data + 1;//本次要獲得第幾個獎勵
            //如果上次已經完成一輪，也就是現在的reward_times=7,但是reward_order=7是完整的圖而不是正確的獎勵碎片
            //或許可以reward_times%7=0
            if (reward_times % 7 == 0) {//進入下一輪的獎勵機制
                reward_times += 1;
            }
            Reward(u_id, reward_times, c_count);
            console.log("成功取得使用者獲得的獎勵次數", u_id);

        } catch (error) {
            console.error("取得使用者獎勵次數失敗(main):", error);
        }
    }

    //取得獎勵碎片
    async function Reward(u_id: string, newtimes: number, c_count: number) {
        try {
            const response = await axios.get(`http://localhost:5000/Reward?order=${newtimes}`);
            console.log("後端返回的獎勳數據:", response.data);
            const img = response.data.img;
            const name = response.data.name;
            const story = response.data.story;
            console.log("成功取得使用者獲得的獎勵");
            if (img && name && story) {
                ShowSuccessJump(img, name, story, c_count);
                await UpdateUserRewardTime(u_id, newtimes);
            }
            else {
                console.log("未取得對應的獎勵");
            }

        } catch (error) {
            console.error("取得使用者獎勵失敗(main):", error);
        }
    }

    //顯示獎勵
    function ShowSuccessJump(img: string, name: string, story: string, c_count: number) {
        const html_img = document.getElementById("rewardimg") as HTMLImageElement;
        const html_name = document.getElementById("rewardname") as HTMLParagraphElement;
        const html_story = document.getElementById("rewardstory") as HTMLParagraphElement;
        const overlay = document.getElementById("overlay") as HTMLDivElement; // suuuuuuuuuu

        html_img.src = img;
        html_name.innerText = name;
        html_story.innerText = story;


        // 顯示遮罩
        overlay.style.display = 'block';

        // 創建並插入按鈕區塊
        const buttonContainer = document.createElement("div");
        buttonContainer.style.display = "flex";
        buttonContainer.style.justifyContent = "flex-end";
        buttonContainer.style.gap = "8px";
        buttonContainer.style.position = "relative"; //su

        if (c_count % 6 == 0) {
            // 建立 button3
            const button3 = document.createElement("a");
            button3.classList.add("custom-button");
            button3.innerText = "恭喜完成一輪相談!點擊進入問卷評量";
            button3.style.textDecoration = "none";
            button3.style.opacity = "0";
            button3.style.transition = "opacity 0.5s";
            button3.style.pointerEvents = "none"; // ❌ 初始時不能點擊

            button3.addEventListener("click", () => {
                navigate("/game_guestion");
            });

            buttonContainer.appendChild(button3);
            // 等三秒後：顯示 + 開啟點擊
            setTimeout(() => {
                button3.style.opacity = "1";
                button3.style.pointerEvents = "auto"; // ✅ 開放點擊
            }, 8000);
        }
        else {
            // 建立 button1
            const button1 = document.createElement("a");
            button1.classList.add("custom-button");
            button1.innerText = "領取後退出";
            button1.style.textDecoration = "none";
            button1.style.opacity = "0";
            button1.style.transition = "opacity 0.5s";
            button1.style.pointerEvents = "none"; // ❌ 初始時不能點擊

            button1.addEventListener("click", () => {
                navigate("/merge");
            });

            // 建立 button2
            const button2 = document.createElement("a");
            button2.classList.add("custom-button");
            button2.innerText = "前往背包查看";
            button2.style.textDecoration = "none";
            button2.style.opacity = "0";//一開始透明度為0
            button2.style.transition = "opacity 0.5s";;//transition這個變化會用「漸漸變清楚」的方式呈現出來
            button2.style.pointerEvents = "none"; // ❌ 初始時不能點擊

            button2.addEventListener("click", () => {
                navigate("/backpack"); // 使用 router 進行跳轉
            });

            // 將按鈕加入容器（但先隱藏、無法點）
            buttonContainer.appendChild(button1);
            buttonContainer.appendChild(button2);

            // 等三秒後：顯示 + 開啟點擊
            setTimeout(() => {
                button1.style.opacity = "1";
                button2.style.opacity = "1";
                button1.style.pointerEvents = "auto"; // ✅ 開放點擊
                button2.style.pointerEvents = "auto"; // ✅ 開放點擊
            }, 8000);
        }

        // 將按鈕容器插入到頁面中
        const jumpElement = document.querySelector('.conversation-jump') as HTMLDivElement;
        jumpElement.appendChild(buttonContainer);

        // 顯示 jump
        jumpElement.style.display = 'block';
    }

    //修改使用者取得的獎勵次數
    async function UpdateUserRewardTime(u_id: string, newtimes: number) {
        try {
            await axios.post("http://localhost:5000/UpdateUserRewardTime", {
                u_id,
                newtimes,
            })
            console.log("update user reward times 成功(main)");
        }
        catch {
            console.log("uodate user reward times 失敗(main)");
        }
    }
}

//登出
export async function logout() {
    const user_id = sessionStorage.getItem("user_id");
    try {
        await axios.post("http://localhost:5000/logout", {
            user_id,
        });
        sessionStorage.clear(); // 清除 sessionStorage 中的所有資料
        navigate("/"); // 導向首頁
        console.log("登出成功");
    } catch (error) {
        console.error("登出失敗", error);
    }
}

// 綁定登出按鈕
const logoutbutton = document.getElementById("logout_button") as HTMLAnchorElement;
if (logoutbutton) {
    logoutbutton.onclick = logout; // 綁定登出函數
}