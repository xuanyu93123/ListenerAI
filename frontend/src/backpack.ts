import axios from "axios";

export async function setupBackpack() {
    const rewardcontainer = document.getElementById("reward") as HTMLDivElement;

    if (rewardcontainer) {

        const user_id = sessionStorage.getItem("user_id");
        if (user_id) {
            UserRewardNumber(user_id);
        }

        //取得使用者有幾個reward
        async function UserRewardNumber(user_id: string) {
            try {
                const response = await axios.get(`http://localhost:5000/UserRewardNumber?user_id=${user_id}`);
                const user_reward_number = response.data;
                backpack(user_reward_number);
            }
            catch {
                console.log("backpack 取得User獎勵number失敗(main)")
            }
        }

        //判斷目前有幾輪獎勵&&哪些獎勵該顯和哪些還未達成
        async function backpack(user_reward_times: number) {
            try {
                const response = await axios.get(`http://localhost:5000/backpack`);
                let round = 0;//有幾輪獎勵
                let divide = 0;//有幾個img flex
                let img_times = 0;//有幾個img id
                let story_times = 0;//有幾個story id
                let imgrows_number = 0;//有幾個圖片獎勵
                let storyrows_number = 0;//有幾個故事獎勵
                for (let i = 1; i <= response.data.length / 7; i++) {
                    round += 1;
                    console.log("backpack 裡的 for 執行第:", i, "次", divide, img_times, story_times, imgrows_number);
                    Round(round, divide, img_times, story_times, imgrows_number, storyrows_number, response.data, user_reward_times);
                    divide += 2;
                    img_times += 7;
                    story_times += 7;
                    imgrows_number += 7;
                    storyrows_number += 7;
                };
                console.log("backpack 取得獎勵成功(main)");
            }
            catch (error) {
                console.log("backpack 取得獎勵失敗(main)");
                console.error(error);
            }
        }

        //判斷為第幾輪獎勵
        function Round(round: number, divide: number, img_times: number, story_times: number, imgrows_number: number, storyrows_number: number, rows: any[], user_reward_times: number) {

            const OuterDiv = document.createElement("div");
            OuterDiv.id = round.toString(); // 確保 ID 是字串
            console.log("Outerdiv為:", round);
            OuterDiv.className = "bp-left";

            for (let i = 0; i < 2; i++) {
                divide += 1;
                console.log("divide=", divide);
                const InnerDiv = document.createElement("div");
                InnerDiv.id = divide.toString();
                InnerDiv.style.display = "flex";

                for (let r = 0; r < 3; r++) {
                    img_times += 1;
                    console.log("進到img for迴圈, times為", img_times);
                    // suuuuuu: 包一層 wrapper div
                    const wrapper = document.createElement("div");
                    wrapper.className = "img-wrapper";

                    const Img = document.createElement("img");
                    Img.id = img_times.toString();

                    let link: string;

                    link = rows[imgrows_number].Reward_Link;
                    if (img_times > user_reward_times) {
                        Img.style.opacity = "0.55";
                        console.log("進到img if 使用者尚未解鎖獎勵", img_times, ">", "user_reward_times", user_reward_times, ",link=", link);
                    } else {
                        console.log("rows_number=", imgrows_number);
                        console.log("進到img if 使用者已經解鎖獎勵", img_times, "<=", "user_reward_times", user_reward_times, ",link=", link);
                    }
                    imgrows_number += 1; // 無論如何都要+1

                    Img.src = link;
                    Img.className = "bp-left-img ";
                    // suuuuu: 建黑色遮罩
                    const overlay = document.createElement("div");
                    overlay.className = "img-overlay";
                    // su: 已經解鎖 遮罩隱藏
                    if (img_times <= user_reward_times) {
                        overlay.style.display = "none";
                    }
                    // su: 把圖片 遮罩塞進 wrapper
                    wrapper.appendChild(Img);
                    wrapper.appendChild(overlay);
                    // su: 把 wrapper 塞進 InnerDiv
                    InnerDiv.appendChild(wrapper);
                    console.log("放入第", img_times, "張到InnerFirstDiv");
                }
                // 把 InnerFirstDiv 放入 OuterDiv
                OuterDiv.appendChild(InnerDiv);
            }

            let division = 6 * round;
            let p_text: string;
            if (round != 1) {
                if (user_reward_times / (division + round - 1) >= 1) {
                    p_text = "恭喜蒐集完六個碎片";
                    console.log("++++++++++++++++++++++++不為第一輪round=", round, "+++++++++++++++", user_reward_times, "+++++", division + (round - 1), "+++++", user_reward_times / (division + round - 1));
                }
                else {
                    p_text = "尚未完成，再接再厲";
                    console.log("++++++++++++++++++++++++不為第一輪round=", round, "+++++++++++++++", user_reward_times, "+++++", division + (round - 1), "+++++", user_reward_times / (division + round - 1));
                }
            }
            else {
                if (user_reward_times >= division) {
                    p_text = "恭喜蒐集完六個碎片";
                    console.log("+++++++++++++++++++++為第一輪round=", round);
                }
                else {
                    p_text = "尚未完成，再接再厲";
                }
            }
            const p = document.createElement("p");
            p.id = round.toString();
            p.innerText = p_text;
            p.style.fontSize = "16px";
            // 把 p 放入 OuterDiv
            OuterDiv.appendChild(p)

            // story
            const JumpStory = document.createElement("div");
            JumpStory.id = round.toString();
            JumpStory.style.display = "grid";
            JumpStory.style.display = "none";
            JumpStory.style.fontSize = "15px";
            for (let i = 0; i < 6; i++) {
                story_times += 1;
                let nametext: string;
                let storytext: string;

                if (story_times > user_reward_times) {//如果使用者尚未解鎖獎勵
                    nametext = rows[storyrows_number].Reward_Name;
                    storytext = "待解鎖..."
                    storyrows_number += 1;
                }
                else {
                    nametext = rows[storyrows_number].Reward_Name;
                    storytext = rows[storyrows_number].Reward_Story;
                    storyrows_number += 1;
                }
                const name = document.createElement("p");
                name.id = story_times.toString();
                name.style.display = "grid";
                name.style.fontSize = "16px";
                name.innerText = nametext;
                JumpStory.appendChild(name);
                const story = document.createElement("p");
                story.id = story_times.toString();
                story.style.display = "grid";
                story.innerText = storytext;
                JumpStory.appendChild(story);
            }
            OuterDiv.appendChild(JumpStory);

            const story_button = document.createElement("button");
            story_button.id = round.toString();
            story_button.innerText = "展開故事";
            story_button.className = "custom-button";
            story_button.style.height = "32px"; //蘇
            story_button.onclick = () => {
                if (JumpStory.style.display === "none") {
                    JumpStory.style.display = "block";  // 展開
                    story_button.innerText = "收起故事";
                } else {
                    JumpStory.style.display = "none";  // 收起
                    story_button.innerText = "展開故事";
                }
            };
            OuterDiv.appendChild(story_button);


            const download_button = document.createElement("button");
            download_button.id = round.toString();
            download_button.className = "custom-button";
            download_button.style.height = "32px"
            download_button.innerText = "下載圖片";
            if (user_reward_times == 0 || user_reward_times / (6 * round) < 1) {//下載button只有6張圖片都收集完後才能點
                download_button.style.pointerEvents = "none";  // 禁止點擊事件
                download_button.style.opacity = "0.5";         // 讓按鈕變得透明，表示禁用狀態
                download_button.title = "今天已經進行過相談";  // 當懸浮時顯示提示框
            }
            else {
                download_button.onclick = async () => {
                    //判斷是哪一張圖片
                    const pictureorder = round * 7;
                    let src = "";
                    try {
                        const response = await axios.get(`http://localhost:5000/rewarddownload?pictureorder=${pictureorder}`);
                        src = response.data[0].Reward_Link;
                        console.log("response.data.Reward_Link", response.data[0].Reward_Link);
                    }
                    catch (error) {
                        console.log("reward download失敗", error);
                    }
                    const a = document.createElement("a");
                    a.href = src;  // 設定圖片網址
                    a.download = "reward.png"; // 設定下載時的檔名
                    document.body.appendChild(a);
                    a.click();  // 觸發下載
                    document.body.removeChild(a);
                };

            }
            // 蘇: 把p跟 story,download button 變一排 
            const actionContainer = document.createElement("div");
            actionContainer.className = "bp-p-btn-group";
            actionContainer.appendChild(p);
            actionContainer.appendChild(story_button);
            actionContainer.appendChild(download_button);

            OuterDiv.appendChild(actionContainer);
            // 蘇end

            // OuterDiv.appendChild(download_button);

            // 把 OuterDiv 加到最大的container
            rewardcontainer.appendChild(OuterDiv);
            const sidebar = document.getElementById("sidebar") as HTMLElement;
            sidebar.style.display = "block";
        }
    }

}