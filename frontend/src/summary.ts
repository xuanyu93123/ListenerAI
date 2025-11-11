import axios from "axios";

export async function setupSummary() {
    const navbar = document.getElementById("sidetime") as HTMLDivElement;
    const content = document.getElementById("content") as HTMLDivElement;

    if (navbar && content) {
        const u_id = sessionStorage.getItem("user_id");
        if (!u_id) {
            console.log("沒有找到 user_id");
        }
        try {
            const response = await axios.get(`http://localhost:5000/Summary?user_id=${u_id}`);
            const rows = response.data;
            if (rows.length == 0) {
                navbar.innerText = "";
                navbar.innerText = "尚無紀錄";  // ✅ 確保 brown-left 也有內容
                navbar.style.color = "#ffffff"; //su
                navbar.style.fontSize = "16px";  //suuu
                content.innerText = "尚無摘要";

            }
            else {
                let count = 0;
                for (let i = rows.length - 1; i >= 0; i--) {
                    console.log("進入for迴圈", rows[i]);
                    let date = rows[i].Summary_Date;
                    let content = rows[i].Summary_Content;
                    console.log("count=", count);
                    Navbar(date, content, count);
                    count += 1;
                }
            }

        }
        catch (error) {
            console.log("summary 失敗(main)");
            console.log(error);
        }

        function Navbar(date: string, content: string, count: number) {
            const p = document.createElement("p");
            p.className = "nav-item";
            p.innerText = date.toString();
            p.onclick = function () {
                Content(content);  // 這裡傳遞選擇的摘要
            };
            if (count == 0) {
                p.click();//預設被點擊
            }
            navbar.appendChild(p);
        }

        function Content(summary: string) {
            content.innerHTML = "";  // ✅ 先清空 content
            const p = document.createElement("p");
            p.innerText = summary;
            p.style.fontSize = "15px";
            p.className = "yellow-right-p";
            content.appendChild(p);
        }
        const sidebar = document.getElementById("sidebar") as HTMLElement;
        sidebar.style.display = "block";
    }
}