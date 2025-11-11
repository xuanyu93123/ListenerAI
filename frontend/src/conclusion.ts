import axios from "axios";

export async function setupConclusion() {
    const navbar = document.getElementById("sidetime") as HTMLDivElement;
    const content = document.getElementById("content") as HTMLDivElement;

    if (navbar && content) {
        const u_id = sessionStorage.getItem("user_id");
        if (!u_id) {
            console.log("沒有找到 user_id");
        }
        try {
            const response = await axios.get(`http://localhost:5000/Conclusion?user_id=${u_id}`);
            const summaryrows = response.data.summary;
            console.log("summaryrows=", summaryrows);
            const conclusionrows = response.data.conclusion;
            if (conclusionrows == "no conclusion") {
                navbar.innerText = "";
                navbar.innerText = "尚無紀錄";  // ✅ 確保 brown-left 也有內容
                navbar.style.color = "#ffffff"; //su
                navbar.style.fontSize = "15px";  //su
                content.innerText = "尚無總結";

            }
            else {
                let count = 0;
                let end = summaryrows.length - 1;
                let start = end - 5;
                for (let i = conclusionrows.length - 1; i >= 0; i--) {
                    console.log("進入for迴圈", conclusionrows[i]);
                    let times = conclusionrows[i].Conclusion_Times;
                    let content = conclusionrows[i].Conclusion_Content;
                    let summary_start = summaryrows[start].Summary_Date;
                    let summary_end = summaryrows[end].Summary_Date;
                    end -= 6;
                    start = end - 5;
                    console.log("count=", count);
                    Navbar(times, content, count, summary_start, summary_end);
                    count += 1;
                }
            }

        }
        catch (error) {
            console.log("conclusion 失敗(main)");
            console.log(error);
        }

        function Navbar(times: string, content: string, count: number, startday: string, endday: string) {
            const p = document.createElement("p");
            p.className = "brown-left-p";
            p.innerText = "第" + times.toString() + "次總結" + '\n' + '(' + startday + "~" + endday + ')';
            p.onclick = function () {
                Content(content);  // 這裡傳遞選擇的日期
            };
            if (count == 0) {
                p.click();//預設被點擊
            }
            navbar.appendChild(p);
        }

        function Content(conclusion: string) {
            content.innerHTML = "";  // ✅ 先清空 content
            const p = document.createElement("p");
            p.innerText = conclusion;
            p.style.fontSize = "15px";
            p.className = "yellow-right-p";
            content.appendChild(p);
        }
    }
    const sidebar = document.getElementById("sidebar") as HTMLElement;
    sidebar.style.display = "block";
}