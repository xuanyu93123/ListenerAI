import axios from "axios";
// 主函數：對所有用戶進行摘要處理 呼叫所有
export async function summarizeConversations() {
    const user_id = sessionStorage.getItem("user_id");
    const response = await axios.get(`http://localhost:5000/fetchConversations?user_id=${user_id}`)
    if (response.data.length === 0) {
        console.log(`使用者 ${user_id} 沒有找到對話紀錄。`);
    } else {
        let conversations = response.data;
        try {
            const response = await axios.post("http://localhost:5000/generateGptSummary", {
                conversations
            });
            console.log(`=== ${user_id} 的 GPT 產生的摘要 ===`);
            // 存入資料庫
            const summary = response.data.summary;
            const response2 = await axios.post("http://localhost:5000/saveSummaryToDb", {
                user_id,
                summary,
            });
            console.log("response2.data=",response2.data.count);
            if (Number(response2.data.count) % 6 == 0) {
                console.log("進入總結生成");
                await ConclusionFunction();
            }
        }
        catch (error) {
            console.log("openai摘要出現錯誤", error);
            return;
        }
    }
}
async function ConclusionFunction() {
    const user_id = sessionStorage.getItem("user_id");
    console.log("進入concliusionfunction檔案");
    const response = await axios.get(`http://localhost:5000/fetchSummarys?user_id=${user_id}`);
    console.log("第一次fetch(取得摘要)結束，回到concliusionfuncyion檔案");
    if (response.data.length === 0) {
        console.log(`使用者 ${user_id} 沒有找到摘要紀錄。`);
    } else {
        console.log("找到摘要紀錄");
        let summarys = response.data;
        try {
            console.log("fetch到undex黨生成總結");
            const response = await axios.post("http://localhost:5000/GptConclusion", {
                summarys
            });
            console.log(`=== ${user_id} 的 GPT 產生的總結 ===`);
            // 存入資料庫
            const conclusion = response.data.conclusion;
            await axios.post("http://localhost:5000/saveConclusionToDb", {
                user_id,
                conclusion,
            });
        }
        catch (error) {
            console.log("openai總結出現錯誤", error);
            return;
        }
    }
}