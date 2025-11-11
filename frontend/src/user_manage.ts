import axios from "axios";

let edit = false;
export async function UserManageFunction() {
    const user_id = sessionStorage.getItem("user_id");
    if (!user_id) {
        console.log("沒有找到 user_id");
        return;
    }
    //基本資料
    try {
        const response = await axios.get(`http://localhost:5000/UserManage?user_id=${user_id}`);
        const data = response.data;
        const birth: Date = new Date(data[0].Users_Birth); // 確保這是一個有效的 Date 物件
        const year = birth.getFullYear();
        let month = birth.getMonth() + 1;  // getMonth() 返回0-11，所以加1才能對應1-12月
        (document.getElementById("profile-image") as HTMLImageElement).src = data[0].Users_Img;
        (document.getElementById("user-name") as HTMLDivElement).textContent = `姓名: ${data[0].Users_Name}`;
        (document.getElementById("user-date") as HTMLDivElement).textContent = `出生日期: ${year}-${month}`;
        (document.getElementById("user-account") as HTMLDivElement).textContent = `電子郵件: ${data[0].Users_ID}`;
        (document.getElementById("user-password") as HTMLDivElement).textContent = `密碼: ${'*'.repeat(data[0].Users_Password.length)}`;
    } catch (error) {
        console.error("❌ 查詢失敗：", error);
    }

    // 評量成績
    const outerdiv = document.getElementById("outerdiv") as HTMLDivElement;
    let index = 0;

    try {
        const response = await axios.get(`http://localhost:5000/UserManageScore?user_id=${user_id}`);
        for (let i = 0; i < response.data.length; i++) {
            index += 1;

            const p1 = document.createElement("p");
            p1.id = `label-${index}`;
            p1.className = "result-label";
            p1.innerText = `第 ${index} 次檢測結果: ${response.data[i].Test_Score} 分`;
            outerdiv.appendChild(p1);

            // 外層容器：progress-bar
            const innerdiv = document.createElement("div");
            innerdiv.className = "progress-bar";

            // 進度條背景條：progress-fill
            const div = document.createElement("div");
            div.id = `progress-${index}`;
            div.className = "progress-fill";
            div.style.width = `${(response.data[i].Test_Score / 9) * 100}%`;

            // 顯示數字文字：progress-text
            const p2 = document.createElement("p");
            p2.id = `text-${index}`;
            p2.className = "progress-text";
            p2.innerText = `${response.data[i].Test_Score} 分`;

            // 按順序加入 innerdiv 中，然後整個加到 outerdiv
            innerdiv.appendChild(div);
            innerdiv.appendChild(p2);
            outerdiv.appendChild(innerdiv);
        }
    } catch (error) {
        console.error("獲取成績資料錯誤：", error);
    }
    const sidebar = document.getElementById("sidebar") as HTMLElement;
    sidebar.style.display = "block";
}

//修改頭貼
export async function EditProfile() {
    const profile_div = document.getElementById("profile_div") as HTMLDivElement;
    const button_change_profile = document.getElementById("button_change_profile") as HTMLButtonElement;

    if (profile_div && button_change_profile) {
        const u_img = document.getElementById("profile-image") as HTMLImageElement;

        button_change_profile.addEventListener("click", async () => {
            button_change_profile.style.pointerEvents = "none";  // 禁止點擊事件
            button_change_profile.style.opacity = "0.5";         // 讓按鈕變得透明，表示禁用狀態

            const img = u_img.src;
            // 將 /assets/ 後的部分取出（或你要的相對路徑）
            const finalsrc = img.replace(/^https?:\/\/[^/]+/, '');
            const user_id = sessionStorage.getItem("user_id");
            try {
                const response = await axios.post("http://localhost:5000/EditProfile", {
                    finalsrc,
                    user_id
                });
                if (response.data == "success") {
                    alert("頭像變更成功");
                    button_change_profile.style.pointerEvents = "auto"; // 允許點擊事件
                    button_change_profile.style.opacity = "1";          // 回復正常不透明狀態 
                }
            }
            catch (error) {
                console.error("錯誤:", error);
                console.log("發生錯誤，頭象未變更");
                alert("請求失敗，請稍後重試！");
                button_change_profile.style.pointerEvents = "auto"; // 允許點擊事件
                button_change_profile.style.opacity = "1";          // 回復正常不透明狀態 
            }
        })
    };
}

//修改密碼
export async function EditPassword(event: MouseEvent) {
    event.preventDefault(); // 阻止表單提交！
    const passwordForm = document.getElementById("PasswordForm") as HTMLFormElement;
    if (!edit) {
        passwordForm.style.display = "block";
        edit = true;
        console.log("edit設置為true");
    } else {
        passwordForm.style.display = "none";
        edit = false;
        console.log("edit設置為false");
    }
}

export function setupUserManage() {
    // 綁定密碼修改按鈕
    const editPasswordBtn = document.getElementById("editPasswordBtn");
    if (editPasswordBtn) {
        editPasswordBtn.addEventListener("click", EditPassword);
    } else {
        console.error("密碼修改按鈕未找到");
    }

    // 綁定密碼修改表單提交事件
    const passwordForm = document.getElementById("PasswordForm") as HTMLFormElement;
    if (passwordForm) {
        passwordForm.addEventListener("submit", async function (event) {
            event.preventDefault();
            console.log("監聽到密碼修改表單提交事件");

            const user_id = sessionStorage.getItem("user_id");
            const formData = {
                user_id,
                u_password: (document.getElementById("u_password") as HTMLInputElement).value,
            };

            try {
                const response = await fetch("http://localhost:5000/EditPassword", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(formData),
                });
                const data = await response.json();

                if (data.message === "success") {
                    console.log("密碼更改前端成功");
                    passwordForm.style.display = "none";
                    edit = false;

                    alert("密碼更改成功！");
                }
            } catch (error) {
                console.error("錯誤:", error);
                alert("請求失敗，請稍後重試！");
            }
        });
    } else {
        console.error("密碼修改表單未找到");
    }
    UserManageFunction();
    EditProfile();
}