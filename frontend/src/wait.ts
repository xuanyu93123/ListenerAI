import axios from 'axios';
import { navigate } from './router';

export function setWait() {
// 確認家長回復
let checking = false; // 設定 checking 初始值
async function CheckParentResponse() {
    if (checking) return; // 如果 checking 為 true，停止執行
    checking = true; // 設定 checking 為 true，避免重複執行
    const user_id = sessionStorage.getItem("user_id");
    if (!user_id) {
        console.error("❌ 錯誤: 無法取得 user_id");
        return;
    }
    try {
        const response = await axios.get(`http://localhost:5000/Wait?user_id=${user_id}`);
        console.log("📩 後端回應:", response.data);
        if (response.data === "agree") {
            alert("🎉 父母已確認！");
            navigate("/game_type")
        } else if (response.data === "disagree") {
            alert("❌ 父母不同意你使用 Listener AI");
            navigate("/")
        } else {
            console.log("⏳ 等待父母回應...");
            checking = false; 
            setTimeout(CheckParentResponse, 5000); // 每 5 秒查詢一次
        }
    } catch (error) {
        console.error("查詢父母回應失敗:", error);
        checking = false; // 出錯時也要重設 checking
    }
}

// 進入頁面時先執行一次
CheckParentResponse();
}