import axios from "axios";
import { navigate } from "./router";

export async function setupSelectAvatar() {
    const select_avatar = document.getElementById("select-overlay") as HTMLDivElement;
    const selectavatarbignavbar = document.getElementById("menu-icon") as HTMLElement;
    const sidebar = document.getElementById("sidebar") as HTMLElement;

    const button_vicky = document.getElementById("Button_ChooseVicky") as HTMLButtonElement;
    const button_wayne = document.getElementById("Button_ChooseWayne") as HTMLButtonElement;
    const selectPopupVicky = document.getElementById("selectPopupVicky") as HTMLDivElement; //suuu
    const selectPopupWayne = document.getElementById("selectPopupWayne") as HTMLDivElement; //suuu

    if (!select_avatar || !selectavatarbignavbar || !button_vicky || !button_wayne || !selectPopupVicky || !selectPopupWayne) {
        console.error("必要的 DOM 元素未找到");
        return;
    }

    if (select_avatar) {
        const user_id = sessionStorage.getItem("user_id");
        if (user_id) {
            selectavatarchack(user_id);
        }
        async function selectavatarchack(user_id: string) {
            try {
                const response = await axios.get(`http://localhost:5000/Selectavatarchack?user_id=${user_id}`);
                const guidecheck = response.data;

                if (guidecheck >= 5) {
                    //顯示navbar
                    selectavatarbignavbar.style.display = "block";
                    sidebar.style.display = "block";
                }

                //select_avatar
                if (button_vicky && button_wayne && selectPopupVicky && selectPopupWayne) { //su add sth
                    button_vicky.addEventListener("click", async () => {
                        const avatarPrompt = "June_HR_public";
                        try {
                            await axios.post("http://localhost:5000/select_avatar", {
                                user_id,
                                avatarPrompt,
                            })
                            navigate("/merge");
                            console.log("select avatar完成");
                        }
                        catch {
                            console.log("select avatar 失敗 (main)");
                        }
                    });
                    button_wayne.addEventListener("click", async () => {
                        const avatarPrompt = "Wayne_20240711";
                        try {
                            await axios.post("http://localhost:5000/select_avatar", {
                                user_id,
                                avatarPrompt,
                            })
                            navigate("/merge");
                            console.log("select avatar完成");
                        }
                        catch {
                            console.log("select avatar 失敗 (main)");
                        }
                    });
                }
            }
            catch {
                console.log("avatarcheck失敗(main)")
            }
        }
    }
}