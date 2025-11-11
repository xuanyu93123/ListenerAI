import axios from "axios";
import { navigate } from "./router";
export async function setupGuide() {
    const film_id = document.getElementById("filmid") as HTMLDivElement;
    const sidebar = document.getElementById("sidebar") as HTMLElement;
    const guidebignavbar = document.getElementById("menu-icon") as HTMLElement;
    const guide_button = document.getElementById("button_g") as HTMLButtonElement;

    if (film_id) {
        const user_id = sessionStorage.getItem("user_id");
        if (user_id) {
            console.log("進入guidechack");
            guidechack(user_id);
        }
        async function guidechack(user_id: string) {
            try {
                const response = await axios.get(`http://localhost:5000/Guidecheck?user_id=${user_id}`);
                const guidecheck = response.data;
                if (guidecheck < 4) {
                    //guide
                    guide_button.style.display = "block";
                    console.log("判斷為註冊");
                    guide_button.addEventListener("click", async () => {
                        const execute = 4;
                        try {
                            await axios.post("http://localhost:5000/guide", {
                                user_id,
                                execute,
                            })
                            navigate("/select_avatar");
                            console.log("guide完成 execute:", execute);
                        }
                        catch {
                            console.log("guide失敗 (main)");
                        }
                    });
                }
                else {
                    console.log("判斷為非註冊");
                    //顯示navbar
                    guidebignavbar.style.display = "block";
                    sidebar.style.display = "block";
                }
            }
            catch {
                console.log("Guidecheck失敗(main)")
            }
        }
    }
}