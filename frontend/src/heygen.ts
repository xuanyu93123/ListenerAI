import StreamingAvatar, {
  AvatarQuality,
  StreamingEvents,
  TaskType,
  VoiceEmotion,
} from "@heygen/streaming-avatar";

import { OpenAIAssistant } from "./openai-assistant";
import { AudioRecorder } from './audio-handler';
import { navigate } from "./router";

export function initializeHeygen() {
  console.log("Initializing Heygen...");
  // DOM elements
  const videoElement = document.getElementById("avatarVideo") as HTMLVideoElement;
  const startButton = document.getElementById("startSession") as HTMLButtonElement;
  const endButton = document.getElementById("endSession") as HTMLButtonElement;
  const interruptButton = document.getElementById("interruptButton") as HTMLButtonElement;
  const recordButton = document.getElementById("recordButton") as HTMLButtonElement;
  const recordingStatus = document.getElementById("recordingStatus") as HTMLParagraphElement;
  const voiceStatus = document.getElementById("voiceStatus") as HTMLElement;

  if (!startButton) {
    console.error("startButton not found in the DOM");
    return;
  }
  if (!endButton) {
    console.error("endButton not found in the DOM");
    return;
  }
  if (!interruptButton) {
    console.error("interruptButton not found in the DOM");
    return;
  }
  if (!recordButton) {
    console.error("recordButton not found in the DOM");
    return;
  }

  let avatar: StreamingAvatar | null = null;
  let openaiAssistant: OpenAIAssistant | null = null;
  let audioRecorder: AudioRecorder | null = null;
  let isRecording = false;

  // 取得 Heygen Token
  async function fetchAccessToken(): Promise<string> {
    const apiKey = import.meta.env.VITE_HEYGEN_API_KEY;
    const response = await fetch("https://api.heygen.com/v1/streaming.create_token", {
      method: "POST",
      headers: { "x-api-key": apiKey },
    });

    const { data } = await response.json();
    return data.token;
  }

  // 初始化 OpenAI Assistant
  async function initializeOpenAIAssistant(assistantId: string) {
    if (!openaiAssistant) {
      const openaiApiKey = import.meta.env.VITE_OPENAI_API_KEY;
      const userId = sessionStorage.getItem("user_id");
      let systemPrompt = "";

      let conversationTimes = 0;
      let gameType = "";

      // 取得相談次數
      if (userId) {
        const timesRes = await fetch(`http://localhost:5000/ConversationTimes?user_id=${userId}`);
        if (timesRes.ok) {
          const timesData = await timesRes.json();
          conversationTimes = Number(timesData.count ?? 0);
          console.log("取得相談次數:", conversationTimes);
        } else {
          console.error("取得相談次數失敗", timesRes.status);
        }
      }

      // 只在第1、7、13...次取得問卷資料
      if (userId && ((conversationTimes) % 6 === 0)) {
        console.log("這是第1,7,13...次，準備取得問卷資料");
        const res = await fetch("http://localhost:5000/api/getLatestQuestionnaire", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${userId}`
          }
        });
        if (res.ok) {
          const data = await res.json();
          console.log("問卷API回傳:", data);
          const q = data.questionnaire;
          // 第一次取得遊戲類型
          if (conversationTimes === 0) {
            gameType = data.gameType || "";
            console.log("第一次取得遊戲類型:", gameType);
          }
          for (const key in q) {
            if (q[key] === true || q[key] === '1' || q[key] === 1) q[key] = '有傾向';
            else if (q[key] === false || q[key] === '0' || q[key] === 0) q[key] = '沒有傾向';
          }
          let qLsat = '沒有傾向';
          if (q.Test_Q9 === '有傾向' || q.Test_Q10 === '有傾向') {
            qLsat = '有傾向';
          }
          systemPrompt = `這位使用者的遊戲成癮量表結果如下：
        過度專注於線上遊戲:${q.Test_Q1}, 
        遊戲被移除或無法玩遊戲時會出現戒斷症狀:${q.Test_Q2}, 
        耐受性 ( 需要花更多時間玩線上遊戲 ):${q.Test_Q3}, 
        企圖能自我控制玩遊戲卻無法成功:${q.Test_Q4}, 
        因為玩線上遊戲而對之前的感興趣的事和休閒活動喪失興趣:${q.Test_Q5}, 
        儘管知道玩遊戲所產生心理社會等問題，仍過度使用網路遊戲:${q.Test_Q6}, 
        企圖隱瞞欺騙家人、治療師、或其他人自己玩線上遊戲的程度:${q.Test_Q7}, 
        玩線上遊戲來逃避或減少負面情緒:${q.Test_Q8}, 
        因為玩線上遊戲而造成重要關係、工作、求學、或就業機會的損害或失去:${qLsat}。
        ${conversationTimes === 0 ? `使用者喜歡的遊戲類型有：${gameType}。` : ""}
        請根據這些資訊：
        1. 優先關注量表中「有傾向」的項目（回答為「有傾向」的部分）。
        2. 對這些傾向的處理方式，請查閱知識庫中「特性相談方針」檔案的內容。
        3. 與使用者互動時請以朋友般的口吻，溫柔自然地帶入這些主題，不要直接提及「量表」或「傾向」。
        4. 每次只處理一個傾向項目，並融入日常聊天中自然引導對話。
        5. 如合適，可加入簡單的行動建議或提問，鼓勵使用者思考或嘗試改變。`;
          console.log("組成的 systemPrompt:", systemPrompt);
        } else {
          console.error("問卷API失敗", res.status);
        }
      } else {
        console.log("這不是第1,7,13...次，不會取得問卷資料");
      }

      // 不要傳 systemPrompt
      openaiAssistant = new OpenAIAssistant(openaiApiKey, assistantId);
      // 讓外部可以存 systemPrompt
      openaiAssistant.systemPrompt = systemPrompt;
      console.log("Assistant初始化完成，systemPrompt:", openaiAssistant.systemPrompt);
    }
  }

  // 初始化 Avatar
  async function initializeAvatarSession() {
    console.log("📢 初始化 Avatar 時 user_id:", sessionStorage.getItem("user_id"));

    startButton.disabled = true;
    const navbar = document.getElementById("menu-icon") as HTMLElement;
    navbar.style.display = "none";

    // 確保用戶已登入
    const userId = sessionStorage.getItem("user_id");
    if (!userId) {
      console.error("❌ User ID missing in sessionStorage!");
      alert("請先登入！");
      navigate("/login");
      return;
    }
    console.log("✅ User ID:", userId);

    try {
      const token = await fetchAccessToken();
      const response = await fetch("http://localhost:5000/api/getAssistantAndAvatar", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${userId}`
        }
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to get assistantId and avatarName");
      }
      const { assistantId, avatarName } = data;

      avatar = new StreamingAvatar({ token });

      await initializeOpenAIAssistant(assistantId);

      console.log("📡 送出请求给 GetOrCreateThreadId，Authorization 頭：", `Bearer ${sessionStorage.getItem("user_id")}`);
      // 獲取或創建 threadId
      const threadResponse = await fetch("http://localhost:5000/api/GetOrCreateThreadId", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${sessionStorage.getItem("user_id")}`
        }
      });
      const threadData = await threadResponse.json();
      if (!threadResponse.ok) {
        throw new Error(threadData.error || "Failed to get or create thread ID");
      }
      // ...取得 threadId 後...
      openaiAssistant?.setThreadId(threadData.threadId);

      // 只在第1、7、13...次主動加 systemPrompt 到 thread
      if (openaiAssistant?.systemPrompt) {
        console.log("準備將 systemPrompt 加入 thread:", openaiAssistant.systemPrompt);
        try {
          const resp = await openaiAssistant.client.beta.threads.messages.create(threadData.threadId, {
            role: "user",
            content: openaiAssistant.systemPrompt,
          });
          console.log("systemPrompt 加入 thread 結果:", resp);
        } catch (err) {
          console.error("systemPrompt 加入 thread 失敗:", err);
        }
      } else {
        console.log("這次沒有 systemPrompt，不會加到 thread");
      }

      const sessionData = await avatar.createStartAvatar({
        quality: AvatarQuality.Medium,
        avatarName: avatarName,
        language: "zh",
        voice: {
          "rate": 0.8,
          "emotion": VoiceEmotion.FRIENDLY,
        },
      });

      console.log("Session started:", sessionData);
      endButton.disabled = false;

      avatar.on(StreamingEvents.STREAM_READY, handleStreamReady);
      avatar.on(StreamingEvents.STREAM_DISCONNECTED, handleStreamDisconnected);

      // **讓 AI 說開場白**
      if (openaiAssistant) {
        if (voiceStatus) {
          voiceStatus.textContent = "正在準備開場白，請稍候...";
        }
        const openingMessage = await openaiAssistant.getOpeningMessage(threadData.isNewUser);
        await avatar.speak({
          text: openingMessage,
          taskType: TaskType.REPEAT,
        });

        // 將開場白存入資料庫
        const userId = sessionStorage.getItem("user_id");
        if (userId) {
          await saveAvatarConversation(userId, openingMessage);
          const waitingReplies = [
            "我在聽唷～有什麼想說的，慢慢跟我聊就好。",
            "換你說說吧，我很想了解你更多。",
            "我在這裡陪你，有什麼話都可以說給我聽～",
            "有什麼想法都可以告訴我！你說的每句話我都會好好聽著。",
            "我一直都在聽，準備好就說吧！",
            "不管是快樂的事還是煩惱，我都想聽聽看。",
          ];

          if (voiceStatus) voiceStatus.textContent = waitingReplies[Math.floor(Math.random() * waitingReplies.length)];
        }
      }

    } catch (error) {
      console.error("Failed to initialize avatar session:", error);
      startButton.disabled = false;
    }
  }

  // 影片串流處理
  function handleStreamReady(event: any) {
    if (event.detail && videoElement) {
      videoElement.srcObject = event.detail;

      const loadingOverlay = document.getElementById("videoLoading"); // // suuuuuuuu: 抓取 loading 畫面

      videoElement.onloadedmetadata = () => {
        videoElement.play().catch(console.error);
        // suuuuuuuu:  隱藏 loading 畫面
        if (loadingOverlay) loadingOverlay.style.display = "none"; // suuuuuuuu
      };
    }
  }

  function handleStreamDisconnected() {
    console.log("Stream disconnected");
    if (videoElement) {
      videoElement.srcObject = null;
    }
    startButton.disabled = false;
    endButton.disabled = true;
  }

  // 停止 Avatar
  async function terminateAvatarSession() {
    if (!avatar) return;
    await avatar.stopAvatar();
    videoElement.srcObject = null;
    avatar = null;
  }

  // 停止 Avatar repeat
  async function interruptAvatarRepeat() {
    if (!avatar) return;
    await avatar.interrupt();
  }

  // 初始化錄音
  function initializeAudioRecorder() {
    audioRecorder = new AudioRecorder(
      (status) => {
        if (recordingStatus) {
          recordingStatus.textContent = status;
        }
      },
      async (text) => {
        console.log("Received text from audio:", text);

        // **顯示使用者語音轉文字在頁面上** 
        /*
        const conversationDisplay = document.getElementById("conversationDisplay");
        if (conversationDisplay) {
          conversationDisplay.innerHTML += `<p><strong>使用者:</strong> ${text}</p>`;
          conversationDisplay.scrollTop = conversationDisplay.scrollHeight; // 滾動到最新內容
        } */

        const userId = sessionStorage.getItem("user_id");
        if (userId) {
          await saveUserConversation(userId, text);
        }
        await handleSpeak(text);
      }
    );
  }

  // 錄音切換
  async function toggleRecording() {
    if (!audioRecorder) {
      initializeAudioRecorder();
    }

    if (!isRecording) {
      recordButton.innerHTML = "<i class='fas fa-microphone' style='color: white;'></i>&nbsp;停止錄音";
      await audioRecorder?.startRecording();
      isRecording = true;
    } else {
      if (audioRecorder) {
        audioRecorder.stopRecording();
        recordButton.innerHTML = "<i class='fas fa-microphone' style='color: white;'></i>&nbsp;開始錄音";
        isRecording = false;

        // 🔒 停用按鈕直到 AI 說完話
        recordButton.style.pointerEvents = "none";
        recordButton.style.opacity = "0.5";
      }

    }
  }

  // 處理 AI 對話（使用文字 buffer 傳給虛擬人串流講話）
  // 🔁 語音播放佇列與狀態
  const speakQueue: string[] = [];
  let isSpeaking = false;

  async function speakWithQueue(text: string): Promise<void> {
    speakQueue.push(text);
    if (isSpeaking || !avatar) return;

    isSpeaking = true;
    while (speakQueue.length > 0) {
      const sentence = speakQueue.shift();
      if (sentence && avatar) {
        await avatar.speak({
          text: sentence,
          taskType: TaskType.REPEAT,
        }).catch(console.error);
      }
    }
    isSpeaking = false;
  }

  // 等待所有 speakQueue 播放完
  function waitUntilQueueEmpty(): Promise<void> {
    return new Promise((resolve) => {
      const interval = setInterval(() => {
        if (!isSpeaking && speakQueue.length === 0) {
          clearInterval(interval);
          resolve();
        }
      }, 100);
    });
  }

  async function handleSpeak(text: string) {
    if (!avatar || !openaiAssistant || !text) return;
    const thinkingReplies = [
      "等等喔，我在整理思緒，想給你一個溫柔的回應",
      "我有聽進去了，讓我想一想怎麼說更好！",
      "我正在用心想你說的話，馬上回你唷。",
      "正在慢慢整理我的想法中，你說得讓我想多一點～",
      "這個回答好有意思，我想仔細回答你。",
    ];


    try {
      if (voiceStatus) voiceStatus.textContent = thinkingReplies[Math.floor(Math.random() * thinkingReplies.length)];
      /*
      const conversationDisplay = document.getElementById("conversationDisplay");
      const aiMessageElement = document.createElement("p");
      aiMessageElement.innerHTML = `<strong>AI:</strong> `;
      conversationDisplay?.appendChild(aiMessageElement);
      */
      let aiResponse = "";
      let buffer = "";
      const sentenceEndRegex = /[。！？!?]/;

      await openaiAssistant.getResponse(
        text,
        (textDelta) => {
          console.log("Received textDelta:", textDelta); // 確認 textDelta 是否有內容
          aiResponse += textDelta; // 累積 AI 的回應內容
          //aiMessageElement.innerHTML += textDelta; // 追加文字片段
          //conversationDisplay!.scrollTop = conversationDisplay!.scrollHeight;

          buffer += textDelta;

          if (sentenceEndRegex.test(buffer) || buffer.length > 50) {
            speakWithQueue(buffer.trim());
            buffer = "";
          }
        },
        (error) => {
          console.error("Error during streaming:", error);
          if (voiceStatus) voiceStatus.textContent = "發生錯誤";
        },
        async () => {
          // 確保流式回應完成後再檢查 aiResponse
          console.log("完整的 AI 回應:", aiResponse);

          // 播放最後一段未送出的 buffer
          if (buffer.trim()) {
            speakWithQueue(buffer.trim());
          }

          // 🕓 等到整個 queue 播放完再結束，虛擬人整個回復完
          await waitUntilQueueEmpty();

          const waitingReplies = [
            "我在聽唷～有什麼想說的，慢慢跟我聊就好。",
            "換你說說吧，我很想了解你更多。",
            "我在這裡陪你，有什麼話都可以說給我聽～",
            "有什麼想法都可以告訴我！你說的每句話我都會好好聽著。",
            "我一直都在聽，準備好就說吧！",
            "不管是快樂的事還是煩惱，我都想聽聽看。",
          ];

          if (voiceStatus) voiceStatus.textContent = waitingReplies[Math.floor(Math.random() * waitingReplies.length)];

          recordButton.style.pointerEvents = "auto"; // 允許點擊事件
          recordButton.style.opacity = "1";          // 回復正常不透明狀態

          // 確保 AI 回應完整後再存入資料庫
          const userId = sessionStorage.getItem("user_id");
          if (userId && aiResponse.trim()) {
            console.log("準備存入資料庫的 AI 回覆:", aiResponse);
            await saveAvatarConversation(userId, aiResponse);
          } else {
            console.warn("AI 回覆為空，未存入資料庫");
          }
        }
      );
    } catch (error) {
      console.error("Error getting response:", error);
      if (voiceStatus) voiceStatus.textContent = "發生錯誤";
    }
  }

  // 存使用者對話紀錄
  async function saveUserConversation(userId: string, userMessage: string) {
    try {
      await fetch("http://localhost:5000/api/saveUserConversation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId, user_message: userMessage })
      });
    } catch (error) {
      console.error("Error saving conversation:", error);
    }
  }

  // 存虛擬人對話紀錄
  async function saveAvatarConversation(userId: string, avatarMessage: string) {
    try {
      await fetch("http://localhost:5000/api/saveAvatarConversation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId, avatar_message: avatarMessage })
      });
    } catch (error) {
      console.error("Error saving conversation:", error);
    }
  }

  // 顯示對話紀錄
  // async function showConversationHistory() {
  //   if (openaiAssistant) {
  //     const threadId = await openaiAssistant.getOrCreateThreadId();
  //     const messages = await getThreadMessages(openaiAssistant.client, threadId);
  //     conversationHistoryElement.innerHTML = messages.join("<br><br>");
  //   }
  // }

  // 事件監聽
  startButton.addEventListener("click", () => {
    console.log("Start session clicked");
    initializeAvatarSession();
  });

  endButton.addEventListener("click", () => {
    console.log("End session clicked");
    terminateAvatarSession();
  });

  interruptButton.addEventListener("click", () => {
    console.log("Interrupt session clicked");
    interruptAvatarRepeat();
  });

  recordButton.addEventListener("click", () => {
    console.log("Record button clicked");
    toggleRecording();
  });
}