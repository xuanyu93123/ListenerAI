import express from "express";
import { Request, Response } from "express";
import mysql from "mysql2/promise";
import cors from "cors";
import dotenv from "dotenv";
import session from "express-session";
import nodemailer from 'nodemailer';
import moment from "moment-timezone";
import path from 'path';
import OpenAI from "openai";

declare module "express-session" {
  interface SessionData {
    user: { u_id: string };
  }
}

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());


const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  port: Number(process.env.DB_PORT),
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});


const openaiApiKey = process.env.OPENAI_API_KEY;
const openaiClient = new OpenAI({ apiKey: openaiApiKey, dangerouslyAllowBrowser: true })


//設定 OpenAI API 金鑰
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

app.get("/", (req: Request, res: Response) => {
  res.send("🎉 API 運行中！");
});

app.post("/Register", async (req: Request, res: Response): Promise<Response> => {
  const { name, email, password, date, parentagree, steps, promptid, finalsrc, gender } = req.body;

  try {
    await pool.query(
      "INSERT INTO Users (Users_ID, Users_Password, Users_Name, Users_Birth,Parent_Agree,Users_Steps, Users_Reward, Users_PromptID, Users_Img, Users_Gender) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [email, password, name, date, parentagree, steps, 0, promptid, finalsrc, gender]
    );
    await pool.query(
      "INSERT INTO Log (Users_ID, LogType) VALUES (?, ?)",
      [email, "I"]
    );
    return res.json({ message: "✅ 新增成功", Users_ID: email });
  }
  catch (error: any) {  // TypeScript 不知道 `error` 是什麼，所以要用 `any`
    console.error("❌ 插入失敗:", error);

    // MySQL2 錯誤物件會有 `.code` 屬性
    if (error.code === "ER_DUP_ENTRY") {
      console.log("primary key重複", error.code)
      return res.status(400).json({ error: "same" });
    }
    else {
      return res.status(500).json({ error: "新增資料失敗" });
    }
  }

});

app.post("/Register2", async (req: Request, res: Response) => {
  const { user_id, ParentGmail } = req.body;
  if (!user_id || !ParentGmail) {
    return res.status(400).json({ error: "缺少 u_id 或 p_gmail 參數" });
  }

  try {
    await pool.query("UPDATE Users SET  Parent_Gmail = ? WHERE Users_ID = ?", [ParentGmail, user_id]);
    res.json({ message: "success" });
  } catch (error) {
    console.error("❌ 新增失敗:", error);
    res.status(500).json({ error: "新增父母gmail失敗" });
  }
});

//信件傳送功能
app.post("/callsendgmail", async (req, res) => {
  const { user_id, ParentGmail } = req.body;
  const subject = 'ListenerAI家長授權通知';
  let content: string;
  content = `
  <p>親愛的家長您好：</p>

  <p>我們是 <strong>Listener AI</strong>，一個致力於協助青少年改善遊戲成癮問題的線上相談系統。您的孩子剛剛註冊了我們的服務，為了確保使用過程中的安全與透明，我們需要您的同意。</p>

  <p><strong>Listener AI</strong> 提供一個安全、匿名且專業的對談空間，幫助孩子探索新的興趣與生活方向。我們希望與您一同支持孩子的成長。</p>

  <p>如需更多資訊，歡迎造訪我們的官網：<a href="http://localhost:5173">Listener_AI.com</a></p>

  <p>懇請您點選以下連結，同意或拒絕孩子的註冊申請：</p>

  <a href="http://localhost:5000/ParentResponse?user_id=${user_id}&ParentGmail=${ParentGmail}&response=agree" 
  style="padding: 10px; background-color: green; color: white; text-decoration: none; border-radius: 5px;">
  了解，同意使用
  </a>
  <a href="http://localhost:5000/ParentResponse?user_id=${user_id}&ParentGmail=${ParentGmail}&&response=disagree" 
  style="padding: 10px; background-color: red; color: white; text-decoration: none; border-radius: 5px; margin-left: 10px;">
  拒絕，不同意使用
  </a>

  <p>感謝您的配合與信任。</p>

  <p>Listener AI 團隊 敬上</p>
  `;
  if (!ParentGmail || !subject || !content) {
    console.log("缺少要素");
    return;
  }
  console.log('📨 正在準備發送郵件...');

  // 使用 Gmail SMTP(簡易郵件傳輸通訊協定 (Simple Mail Transfer Protocol)) + 應用程式密碼
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    }
  });

  const MailElements = {
    from: process.env.EMAIL_USER,
    to: ParentGmail,
    subject,
    html: content
  };

  try {
    const info = await transporter.sendMail(MailElements);//Nodemailer的一個封裝函式，讓開發者可以透過 SMTP、OAuth2 或其他郵件傳輸協議來發送電子郵件
    console.log('✅ 郵件發送成功:', info.response);
    res.status(200).json("success");
  } catch (error) {
    console.error('❌ 發送失敗:', error);
    res.json({ message: "郵件發送失敗" });
  }
})

//接收家長意願功能
app.get("/ParentResponse", async (req: Request, res: Response) => {
  const u_id = req.query.user_id;
  const p_gmail: string = String(req.query.ParentGmail);
  const p_response = req.query.response;
  if (!u_id || !p_gmail || !p_response) {
    return res.status(400).json({ error: "缺少 user_id 或 p_gmail 或 response_check 或 p_response 參數", u_id, p_gmail, p_response });
  }
  const [rows]: [any[], any[]] = await pool.query(
    "SELECT Parent_Agree FROM Users WHERE Users_id = ? AND Parent_Gmail = ?", [u_id, p_gmail]
  );
  if (rows[0].Parent_Agree == "wait") {
    try {//第一次提交
      if (p_response == "disagree") {
        await pool.query("DELETE FROM Users WHERE Users_ID = ?", [u_id]);
        // return res.json({ message: "disagree" });
      }
      else {
        await pool.query("UPDATE Users SET Parent_Agree = ? WHERE Users_ID = ?", [p_response, u_id]);
        // return res.json({ message: "agree" });
      }
      res.status(200).send("✅ 您的選擇已成功提交，若想更改選擇需再重新註冊收信！");
    } catch (error) {
      console.error("❌ Parent_Agree新增失敗:", error);
      res.status(500).json({ error: "資料庫Update失敗" });
    }
  }
  else {
    console.log("📩 家長已回覆過，重新發送確認郵件...");
    const subject = 'ListenerAI家長授權通知';
    let content: string;
    content = `
                  <p>您已經回覆過這封信，無法再次提交。</p>
                  <p>若需更改選擇，請重新註冊。</p>
                  `;
    if (!p_gmail || !subject || !content) {
      console.log("缺少要素");
      return;
    }
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      }
    });

    const MailElements = {
      from: process.env.EMAIL_USER,
      to: p_gmail,
      subject,
      html: content
    };

    try {
      const info = await transporter.sendMail(MailElements);//Nodemailer的一個封裝函式，讓開發者可以透過 SMTP、OAuth2 或其他郵件傳輸協議來發送電子郵件
      console.log('✅ 郵件發送成功:', info.response);
      res.status(200).send("您已回復過該郵件，若想更改選擇需再重新註冊收信或連繫客服人員！");
    } catch (error) {
      console.error('❌ 發送失敗:', error);
      res.json({ message: "郵件發送失敗" });
    }
  }
});

//Wait
app.get("/Wait", async (req: Request, res: Response) => {
  const u_id = req.query.user_id;
  if (!u_id) {
    return res.status(400).json({ error: "缺少 u_id " });
  }

  try {
    const [rows]: [any[], any[]] = await pool.query("SELECT * FROM Users WHERE Users_ID = ?", [u_id]);
    if (!rows.length) {//家長不同意
      return res.json("disagree");
    }
    else if (rows[0].Parent_Agree == "agree") {
      return res.json("agree");
    }
    else {
      return res.json("wait");
    }
  } catch (error) {
    console.error("❌ 父母回復查詢失敗:", error);
    res.status(500).json({ error: "父母回復查詢失敗" });
  }
});

//user_login
app.get("/Login", async (req: Request, res: Response) => {
  const u_id = req.query.user_id;
  const u_password = req.query.user_password;
  try {
    const [rows]: [any[], any] = await pool.query("SELECT * FROM Users WHERE Users_ID = ? ", [u_id]);
    if (rows.length === 0) {
      return res.status(200).json({ message: "wrongid" });
    }
    else if (rows[0].Users_Password != u_password) {
      return res.status(200).json({ message: "wrongpassword" });
    }
    else {
      await pool.query("INSERT INTO Log ( LogType, Users_ID ) VALUES (?, ?)", ["I", u_id]);
      console.log("API 回應帳密正確錯誤:", rows[0]);
      if (rows[0].Parent_Agree == "agree") {
        if (rows[0].Users_Steps == 0) {
          console.log(rows[0].Parent_Agree, rows[0].Users_Steps);
          return res.status(200).json({ message: "right", check: "agree", step: 0 });
        }
        else if (rows[0].Users_Steps == 1) {
          console.log(rows[0].Parent_Agree, rows[0].Users_Steps);
          return res.status(200).json({ message: "right", check: "agree", step: 1 });
        }
        else if (rows[0].Users_Steps == 2) {
          console.log(rows[0].Parent_Agree, rows[0].Users_Steps);
          return res.status(200).json({ message: "right", check: "agree", step: 2 });
        }
        else if (rows[0].Users_Steps == 3) {
          console.log(rows[0].Parent_Agree, rows[0].Users_Steps);
          return res.status(200).json({ message: "right", check: "agree", step: 3 });
        }
        else if (rows[0].Users_Steps == 4) {
          console.log(rows[0].Parent_Agree, rows[0].Users_Steps);
          return res.status(200).json({ message: "right", check: "agree", step: 4 });
        }
        else {
          const [rowss]: [any[], any] = await pool.query("SELECT COUNT(*) AS Count_S FROM Summary WHERE Users_ID = ? ", [u_id]);
          const [rowst]: [any[], any] = await pool.query("SELECT COUNT(*) AS Count_T FROM Test WHERE Users_ID = ? ", [u_id]);
          if (rowss[0].Count_S % 6 == 0 && (rowss[0].Count_S / 6 != rowst[0].Count_T - 1)) {
            console.log(rows[0].Parent_Agree, rows[0].Users_Steps, "尚未填問卷");
            return res.status(200).json({ message: "right", check: "agree", step: "guestion" });//沒填完問卷就關掉
          }
          else {
            console.log(rows[0].Parent_Agree, rows[0].Users_Steps, "pass");
            return res.status(200).json({ message: "right", check: "agree", step: "pass" });
          }
        }
      }
      else {
        return res.status(200).json({ message: "wait" });
      }
    }
  } catch (error) {
    console.error("發生錯誤：", error);
    return res.status(500).json({ message: "發生錯誤" });
  }
});

//GameType
app.post("/Gametype", async (req: Request, res: Response) => {
  const { user_id, cleanedValues } = req.body;
  if (!user_id || !cleanedValues) {
    return res.status(400).json({ error: "缺少 u_id 或 cleanedValues 參數" });
  }

  try {
    // 把遊戲類型陣列轉換為字串（以逗號分隔）
    const gameTypes = cleanedValues.join(",");
    await pool.query("UPDATE Users SET Users_GameType = ?, Users_Steps = ? WHERE Users_ID = ?", [gameTypes, 1, user_id]);
    res.json({ message: "success" });
  } catch (error) {
    console.error("❌ 新增失敗:", error);
    res.status(500).json({ error: "新增遊戲類型失敗" });
  }
});

// //GameGuestion check
// app.get("/CheckGameguestion", async (req: Request, res: Response) => {
//   const u_id = req.query.user_id;
//   try {
//     const [rows]: [any[], any] = await pool.query("SELECT * FROM Users WHERE Users_ID = ? ", [u_id]);
//     return res.status(200).json(rows[0].Users_Steps);
//   }
//   catch (error) {
//     console.error("❌ 問卷調查check問卷調查check失敗:", error);
//     res.status(500).json({ error: "問卷調查check失敗" });
//   }
// })


//GameGuestion
app.post("/Gameguestion", async (req: Request, res: Response) => {
  const { user_id, selectedValues, score } = req.body;

  try {
    const [rows]: [any[], any] = await pool.query("SELECT COUNT(*) AS TestCount FROM Test WHERE Users_ID = ? ", [user_id]);
    const count = rows[0].TestCount + 1;
    // const gameGuestion = selectedValues.join(",");
    await pool.query("INSERT INTO Test (Test_Q1, Test_Q2, Test_Q3, Test_Q4, Test_Q5, Test_Q6, Test_Q7, Test_Q8, Test_Q9, Test_Q10, Test_Score, Test_Count, Users_ID) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [selectedValues[0], selectedValues[1], selectedValues[2], selectedValues[3], selectedValues[4], selectedValues[5], selectedValues[6], selectedValues[7], selectedValues[8], selectedValues[9], score, count, user_id]);

    if (count == 1) {
      await pool.query("UPDATE Users SET Users_Steps = ? WHERE Users_ID = ?", [2, user_id]);
      res.json({ message: "register" });
    }
    else {
      res.json({ message: "success" });
    }
  } catch (error) {
    console.error("❌ 新增失敗:", error);
    res.status(500).json({ error: "新增問卷調查失敗" });
  }
});

//guidestory
app.post("/guidestory", async (req: Request, res: Response) => {
  const { user_id } = req.body;
  if (!user_id) {
    return res.status(400).json({ error: "缺少 u_id 參數" });
  }
  try {
    await pool.query("UPDATE Users SET  Users_Steps = ? WHERE Users_ID = ?", [3, user_id]);
    res.json("success");
  } catch (error) {
    console.error("❌ 新增失敗:", error);
    res.status(500).json({ error: "updata guidestory 失敗" });
  }
});

//guidecheck
app.get("/Guidecheck", async (req: Request, res: Response) => {
  const user_id = req.query.user_id;
  try {
    const [rows]: [any[], any] = await pool.query("SELECT Users_Steps FROM Users WHERE Users_ID = ? ", [user_id]);
    if (rows.length === 0) {
      return res.status(200).json({ message: "guidecheck=0" });
    }
    else {
      return res.status(200).json(rows[0].Users_Steps);
    }
  } catch (error) {
    console.error("發生錯誤：", error);
    return res.status(500).json({ message: "發生錯誤" });
  }
});

//guide
app.post("/guide", async (req: Request, res: Response) => {
  const { user_id, execute } = req.body;
  if (!user_id) {
    return res.status(400).json({ error: "缺少 u_id 參數" });
  }
  try {
    await pool.query("UPDATE Users SET  Users_Steps = ? WHERE Users_ID = ?", [execute, user_id]);
    res.json("success");
  } catch (error) {
    console.error("❌ 新增失敗:", error);
    res.status(500).json({ error: "updata guide 失敗" });
  }
});

//select avatar check
app.get("/Selectavatarchack", async (req: Request, res: Response) => {
  const user_id = req.query.user_id;
  try {
    const [rows]: [any[], any] = await pool.query("SELECT Users_Steps FROM Users WHERE Users_ID = ? ", [user_id]);
    if (rows.length === 0) {
      return res.status(200).json({ message: "select avatar check=0" });
    }
    else {
      return res.status(200).json(rows[0].Users_Steps);
    }
  } catch (error) {
    console.error("發生錯誤：", error);
    return res.status(500).json({ message: "發生錯誤" });
  }
});

//select avatar
app.post("/select_avatar", async (req: Request, res: Response) => {
  const { user_id, avatarPrompt } = req.body;
  if (!user_id || !avatarPrompt) {
    return res.status(400).json({ error: "缺少 u_id 參數 或 avatarPrompt參數" });
  }
  try {
    await pool.query("UPDATE Users SET  Users_Steps = ?, Users_AvatarID = ? WHERE Users_ID = ?", [5, avatarPrompt, user_id]);
    res.json("success");
  } catch (error) {
    console.error("❌ 新增失敗:", error);
    res.status(500).json({ error: "updata select avatar 失敗" });
  }
});

//taptostart_welcome
app.get("/welcome", async (req: Request, res: Response) => {
  const u_id = req.query.user_id;
  if (!u_id) {
    return res.status(400).json({ error: "缺少 u_id 參數" });
  }
  try {
    const [rows]: [any[], any] = await pool.query("SELECT * FROM Users WHERE Users_ID = ?", [u_id]);
    const name = rows[0].Users_Name;
    const src = rows[0].Users_Img;
    res.json({ name: name, src: src });
  } catch (error) {
    console.error("❌ 新增失敗:", error);
    res.status(500).json({ error: "taptostart check 失敗" });
  }
});

//tap to start check
app.get("/taptostartcheck", async (req: Request, res: Response) => {
  const u_id = req.query.user_id;
  if (!u_id) {
    return res.status(400).json({ error: "缺少 u_id 參數" });
  }
  try {
    const [rows]: [any[], any] = await pool.query("SELECT DATE_FORMAT(MAX(LogTime), '%Y-%m-%d') AS Last_time FROM Log WHERE LogType = ? AND Users_ID = ?", ["T", u_id]);
    console.log("rows[0].Last_time=", rows[0].Last_time);
    const last_time = rows[0].Last_time;
    console.log("last_time=", last_time);
    res.json(last_time);
  } catch (error) {
    console.error("❌ 新增失敗:", error);
    res.status(500).json({ error: "taptostart check 失敗" });
  }
});

//tap to start
app.post("/taptostart", async (req: Request, res: Response) => {
  const { user_id } = req.body;
  if (!user_id) {
    return res.status(400).json({ error: "缺少 u_id 參數" });
  }
  try {
    await pool.query("INSERT INTO Log ( LogType, Users_ID ) VALUES (?, ?)",
      ["T", user_id]);
    res.json("success");
  } catch (error) {
    console.error("❌ 新增失敗:", error);
    res.status(500).json({ error: "insert taptostart log 失敗" });
  }
});

//end conversation
app.post("/endconversation", async (req: Request, res: Response) => {
  const { user_id } = req.body;
  if (!user_id) {
    return res.status(400).json({ error: "缺少 u_id 參數" });
  }
  try {
    await pool.query("INSERT INTO Log ( LogType, Users_ID ) VALUES (?, ?)",
      ["E", user_id]);
    res.json("success");
  } catch (error) {
    console.error("❌ 新增失敗:", error);
    res.status(500).json({ error: "insert stopconversation log 失敗" });
  }
});

//conversation time calculation
app.get("/conversationtimecalculation", async (req: Request, res: Response) => {
  const user_id = req.query.user_id;
  if (!user_id) {
    return res.status(400).json({ error: "缺少 u_id 參數" });
  }
  try {
    //取兩個時間最大
    const [rows1]: [any[], any] = await pool.query(
      "SELECT MAX(LogTime) AS start_time FROM Log WHERE LogType = 'T' AND Users_ID = ?",
      [user_id]
    );
    const [rows2]: [any[], any] = await pool.query(
      "SELECT MAX(LogTime) AS end_time FROM Log WHERE LogType = 'E' AND Users_ID = ?",
      [user_id]
    );
    const start = moment(rows1[0].start_time).tz("Asia/Taipei");
    const end = moment(rows2[0].end_time).tz("Asia/Taipei");
    const duration = end.diff(start, "seconds"); // 計算相差秒數
    console.log(start);
    console.log(end);
    console.log(duration);
    res.json({ duration: duration });
  } catch (error) {
    console.error("❌ 遍歷失敗:", error);
    res.status(500).json({ error: "conversation time calculation 失敗" });
  }
});

//取得使用者生日
app.get("/GetUserBirth", async (req: Request, res: Response) => {
  const user_id = req.query.user_id;
  if (!user_id) {
    return res.status(400).json({ error: "缺少 u_id 參數" });
  }
  try {
    //確認使用者年齡
    const [rows]: [any[], any] = await pool.query(
      "SELECT Users_Birth From Users WHERE Users_ID = ?",
      [user_id]
    );
    const User_birth = rows[0].Users_Birth;
    res.json(User_birth);
  } catch (error) {
    console.error("❌ 遍歷失敗:", error);
    res.status(500).json({ error: "conversation time calculation 失敗" });
  }
});

//判斷使用者為第幾次相談
app.get("/ConversationTimes", async (req: Request, res: Response) => {
  const user_id = req.query.user_id;
  if (!user_id) {
    return res.status(400).json({ error: "缺少 u_id 參數" });
  }
  try {
    //取得使者相談次數
    const [rows]: [any[], any] = await pool.query(
      "SELECT COUNT(*) AS CountTimes FROM Summary WHERE Users_ID = ?",
      [user_id]
    );
    let c_count = rows[0].CountTimes;
    res.json({ message: "success", count: c_count });
  } catch (error) {
    console.error("❌ 遍歷失敗:", error);
    res.status(500).json({ error: "User 相談次數 失敗" });
  }
});

//取得使用者該獲得哪個獎勵
app.get("/UserRewardTimes", async (req: Request, res: Response) => {
  const user_id = req.query.user_id;
  if (!user_id) {
    return res.status(400).json({ error: "缺少 u_id 參數" });
  }
  try {
    //取得使者獎勵次數
    const [rows]: [any[], any] = await pool.query(
      "SELECT * From Users WHERE Users_ID = ?",
      [user_id]
    );
    let reward_times = rows[0].Users_Reward;
    res.json(reward_times);
  } catch (error) {
    console.error("❌ 遍歷失敗:", error);
    res.status(500).json({ error: "User Reward Times 失敗" });
  }
});

//取得本次獎勵
app.get("/Reward", async (req: Request, res: Response) => {
  const newtimes = req.query.order;
  if (!newtimes) {
    return res.status(400).json({ error: "缺少newtimes參數" });
  }
  try {
    //取得使者獎勵碎片
    const [rows]: [any[], any] = await pool.query(
      "SELECT * From Reward WHERE Reward_Order = ?",
      [newtimes]
    );
    let img = rows[0].Reward_Link;
    let name = rows[0].Reward_Name;
    let story = rows[0].Reward_Story;
    res.json({ img: img, name: name, story: story });
  } catch (error) {
    console.error("❌ 遍歷失敗:", error);
    res.status(500).json({ error: "Reward 取得 失敗" });
  }
});

//修改使用者獎勵取得次數
app.post("/UpdateUserRewardTime", async (req: Request, res: Response) => {
  const { u_id, newtimes } = req.body;
  if (!u_id || !newtimes) {
    return res.status(400).json({ error: "缺少 u_id 參數 或 times參數" });
  }
  try {
    await pool.query("UPDATE Users SET Users_Reward = ? WHERE Users_ID = ?", [newtimes, u_id]);
    res.json("success");
  } catch (error) {
    console.error("❌ 新增失敗:", error);
    res.status(500).json({ error: "updata user reward times 失敗" });
  }
});

//bckpack - UserRewardNumber
app.get("/UserRewardNumber", async (req: Request, res: Response) => {
  const u_id = req.query.user_id;
  if (!u_id) {
    return res.status(400).json({ error: "缺少u_id參數" });
  }
  try {
    const [rows]: [any[], any] = await pool.query(
      "SELECT * From Users WHERE Users_ID = ?",
      [u_id]
    );
    let number = rows[0].Users_Reward;
    res.json(number);
  } catch (error) {
    console.error("❌ 遍歷失敗:", error);
    res.status(500).json({ error: "User Reward number 取得 失敗" });
  }
});

//backpack
app.get("/backpack", async (req: Request, res: Response) => {
  try {
    const [rows]: [any[], any] = await pool.query("SELECT * FROM Reward");
    res.json(rows);
  } catch (error) {
    console.error("❌ 遍歷失敗:", error);
    res.status(500).json({ error: "User Reward number 取得 失敗" });
  }
});

//rewarddownload
app.get("/rewarddownload", async (req: Request, res: Response) => {
  const download_order = req.query.pictureorder;
  try {
    const [rows]: [any[], any] = await pool.query("SELECT * FROM Reward WHERE Reward_Order = ?", [download_order]);
    res.json(rows);
  } catch (error) {
    console.error("❌ 遍歷失敗:", error);
    res.status(500).json({ error: "reward download 取得 失敗" });
  }
});

//Summary
app.get("/Summary", async (req: Request, res: Response) => {
  const u_id = req.query.user_id;
  try {
    const [rows]: [any[], any] = await pool.query("SELECT Summary_Content, DATE_FORMAT(Summary_Date, '%Y-%m-%d') AS Summary_Date FROM Summary WHERE Users_ID = ?", [u_id]);//經過 DATE_FORMAT() 處理後：2025-03-10（去掉時間部分）
    res.json(rows);
  } catch (error) {
    console.error("❌ 遍歷失敗:", error);
    res.status(500).json({ error: "Summary 取得 失敗" });
  }
});

//Conclusion
app.get("/Conclusion", async (req: Request, res: Response) => {
  const u_id = req.query.user_id;
  try {
    const [rows_conclusion]: [any[], any] = await pool.query("SELECT Conclusion_Content, Conclusion_Times FROM Conclusion WHERE Users_ID = ?", [u_id]);
    if (rows_conclusion.length > 0) {
      const conclusion_times = rows_conclusion[rows_conclusion.length - 1].Conclusion_Times;
      let getsummary_times = conclusion_times * 6;
      const [rows_summary]: [any[], any] = await pool.query("SELECT DATE_FORMAT(Summary_Date, '%Y-%m-%d') AS Summary_Date FROM Summary WHERE Summary_Times <= ? AND Users_ID = ?", [getsummary_times, u_id]);
      res.json({ summary: rows_summary, conclusion: rows_conclusion });
    }
    else {
      res.json({ summary: "no conclusion", conclusion: "no conclusion" });
    }
  } catch (error) {
    console.error("❌ 遍歷失敗:", error);
    res.status(500).json({ error: "conclusion 取得 失敗" });
  }
});

//帳號管理
app.get("/UserManage", async (req: Request, res: Response) => {
  const userId = req.query.user_id;
  if (!userId) {
    return res.status(400).json({ error: "缺少 User_id 參數" });
  }

  try {
    // DATE_FORMAT(MAX(LogTime), '%Y-%m-%d')
    const [rows]: [any[], any] = await pool.query("SELECT * FROM Users WHERE Users_ID = ?", [userId]);
    if (rows.length === 0) {
      return res.status(404).json({ error: "user_manage錯誤" });
    }
    res.json(rows);
  } catch (error) {
    console.error("❌ 查詢失敗:", error);
    res.status(500).json({ error: "資料庫查詢失敗" });
  }
});

//帳號管理-評量成績
app.get("/UserManageScore", async (req: Request, res: Response) => {
  const userId = req.query.user_id;
  if (!userId) {
    return res.status(400).json({ error: "缺少 User_id 參數" });
  }

  try {
    const [rows]: [any[], any] = await pool.query("SELECT * FROM Test WHERE Users_ID = ?", [userId]);
    if (rows.length === 0) {
      return res.status(404).json({ error: "user_manage成績錯誤" });
    }
    res.json(rows);
  } catch (error) {
    console.error("❌ 查詢失敗:", error);
    res.status(500).json({ error: "資料庫查詢失敗" });
  }
});

//帳號管理-修改頭象
app.post("/EditProfile", async (req: Request, res: Response) => {
  const { user_id, finalsrc } = req.body;
  if (!user_id || !finalsrc) {
    return res.status(400).json({ error: "缺少 user_id 或 img 參數" });
  }
  try {
    await pool.query("UPDATE Users SET Users_Img = ? WHERE Users_ID = ?", [finalsrc, user_id]);
    res.json("success");
  } catch (error) {
    console.error("❌ 更新失敗:", error);
    res.status(500).json({ error: "更新頭像失敗" });
  }
});


//帳號管理-改變密碼
app.post("/EditPassword", async (req: Request, res: Response) => {
  const { user_id, u_password } = req.body;
  if (!user_id || !u_password) {
    return res.status(400).json({ error: "缺少 user_id 或 u_password 參數" });
  }
  try {
    await pool.query("UPDATE Users SET Users_Password = ? WHERE Users_ID = ?", [u_password, user_id]);
    res.json({ message: "success" });
  } catch (error) {
    console.error("❌ 更新失敗:", error);
    res.status(500).json({ error: "更新密碼失敗" });
  }
});

//登出
app.post("/logout", async (req: Request, res: Response) => {
  const { user_id } = req.body;
  if (!user_id) {
    return res.status(400).json({ error: "缺少 user_id " });
  }
  try {
    await pool.query("INSERT INTO Log (LogType, Users_ID) VALUES (?, ?)",
      ["O", user_id]);
    res.json({ message: "success" });
  } catch (error) {
    console.error("❌ 新增失敗:", error);
    res.status(500).json({ error: "新增登出狀態失敗" });
  }

})

// 新增 API 來獲取或創建 threadId
app.get("/api/GetOrCreateThreadId", async (req: Request, res: Response) => {
  const userId = req.headers.authorization?.replace("Bearer ", "");
  console.log("📢 伺服器收到 user_id:", userId);
  //const userId = req.query.user_id;
  if (!userId) {
    console.log("❌ user_id 為空，拒絕請求");
    return res.status(400).json({ error: "用戶未登入" });
  }

  try {
    const [rows]: [any[], any] = await pool.query("SELECT Users_ThreadID FROM Users WHERE Users_ID = ?", [userId]);
    let threadId = rows[0]?.Users_ThreadID;
    console.log("✅ 查找到的 threadId:", threadId);
    let isNewUser = false;

    if (!threadId) {
      // 如果 thread_id 為空，創建新的 thread 並存入資料庫
      const thread = await openaiClient.beta.threads.create();
      threadId = thread.id;
      await pool.query("UPDATE Users SET Users_ThreadID = ? WHERE Users_ID = ?", [threadId, userId]);
      isNewUser = true;
    }

    res.json({ threadId, isNewUser });
  } catch (error) {
    console.error("❌ 查詢或創建 threadId 失敗:", error);
    res.status(500).json({ error: "查詢或創建 threadId 失敗" });
  }
});

// 取得使用者最近一次問卷結果 + 遊戲類型
app.get("/api/getLatestQuestionnaire", async (req: Request, res: Response) => {
  const userId = req.headers.authorization?.replace("Bearer ", "");
  if (!userId) {
    return res.status(400).json({ error: "用戶未登入" });
  }
  try {
    // 取得問卷資料
    const [testRows]: [any[], any] = await pool.query(
      `SELECT Test_Q1, Test_Q2, Test_Q3, Test_Q4, Test_Q5, Test_Q6, Test_Q7, Test_Q8, Test_Q9, Test_Q10
       FROM Test WHERE Users_ID = ? ORDER BY Test_Count DESC LIMIT 1`,
      [userId]
    );
    // 取得遊戲類型
    const [userRows]: [any[], any] = await pool.query(
      `SELECT Users_GameType FROM Users WHERE Users_ID = ?`,
      [userId]
    );
    if (testRows.length === 0) {
      return res.status(404).json({ error: "沒有問卷資料" });
    }
    const questionnaire = testRows[0];
    const gameType = userRows.length > 0 ? userRows[0].Users_GameType : null;
    res.json({ questionnaire, gameType });
  } catch (error) {
    console.error("❌ 取得問卷資料或遊戲類型失敗:", error);
    res.status(500).json({ error: "取得問卷資料或遊戲類型失敗" });
  }
});

//Julie's
//取出對話
app.get("/fetchConversations", async (req: Request, res: Response) => {
  const user_id = req.query.user_id;
  try {
    const [rows]: [any[], any] = await pool.query("SELECT Conversation_Role, Conversation_Content FROM Conversation WHERE Users_ID = ? AND DATE(Conversation_Time) = CURDATE() ORDER BY Conversation_Time ASC ", [user_id])
    console.log("對話紀錄抓取成功", rows);
    res.json({ rows });
  }
  catch {
    console.log("抓取對話紀錄失敗");
  }
})

// GPT 生成摘要 獨立的獨立的
interface Conversation {
  Conversation_Role: string;
  Conversation_Content: string;
}

app.post("/generateGptSummary", async (req: Request, res: Response) => {
  try {
    let { rows } = req.body.conversations;

    // 確保 rows 存在，並且是有效的陣列
    if (!Array.isArray(rows) || rows.length === 0) {
      return res.status(400).json({ error: "對話內容無效或為空" });
    }

    // 整理對話資料，讓它變成一個適合 GPT 接收的文字格式
    const formattedConversations = rows
      .filter(conv => conv && typeof conv.Conversation_Content === "string") // 過濾掉無效內容
      .map(conv => `${conv.Conversation_Role === "User" ? "你" : "Avatar"}: ${conv.Conversation_Content}`) // 轉換格式
      .join("\n");

    console.log("整理後的對話內容:", formattedConversations);

    if (!formattedConversations.trim()) {
      return res.status(400).json({ error: "整理後的對話內容為空，無法產生摘要" });
    }

    // GPT 生成摘要
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "請總結這段心理諮商對話的重點，並以'你'稱呼User，以'相談夥伴'稱呼Avatar。",
        },
        { role: "user", content: formattedConversations },
      ],
      temperature: 0,
    });

    // 檢查 OpenAI API 回應是否有效
    if (!response.choices || response.choices.length === 0 || !response.choices[0].message.content) {
      return res.status(500).json({ error: "OpenAI 回傳的結果無效，無法產生摘要" });
    }

    res.json({ summary: response.choices[0].message.content });
  } catch (error: any) {
    console.error("GPT 生成摘要失敗：", error.message);
    res.status(500).json({ error: "伺服器錯誤，請稍後再試" });
  }
});

//存入對話
app.post("/saveSummaryToDb", async (req: Request, res: Response) => {
  const { user_id, summary } = req.body;
  console.log("gpt產生的summary", summary);
  let count;
  try {
    const [rows]: [any[], any] = await pool.query("SELECT COUNT(*) AS Summary_count FROM summary WHERE Users_ID = ?", [user_id]);
    if (rows.length > 0 && rows[0].Summary_count !== null) {
      count = rows[0].Summary_count + 1;// 這次摘要的次數
    } else {
      count = 1; // 若無資料，預設 count 為 1
    }
    await pool.query("INSERT INTO Summary (Users_ID, Summary_Content, Summary_Times, Summary_Content_Highlight)VALUES (?, ?, ?, ?)", [user_id, summary, count, summary]);
    console.log("摘要內容存入成功");
    res.json({ count });
  }
  catch (error) {
    console.log("存入摘要錯誤", error);
  }
})

//總結生成
//取得摘要
app.get("/fetchSummarys", async (req: Request, res: Response) => {
  const user_id = req.query.user_id;
  try {
    const [rows]: [any[], any] = await pool.query(
      `SELECT Summary_Content, Summary_Times 
       FROM Summary 
       WHERE Users_ID = ?
       ORDER BY Summary_Times DESC 
       LIMIT 5`,
      [user_id]
    );
    //根據 Summary_Times 欄位從大到小排序
    //LIMIT 5這是告訴資料庫：只要前 5 筆資料就好

    console.log("摘要紀錄抓取成功", rows);
    res.json({ rows });
  }
  catch (error) {
    console.log("抓取摘要紀錄失敗", error);
  }
})

app.post("/GptConclusion", async (req: Request, res: Response) => {
  try {
    let { rows } = req.body.summarys;

    // 確保 rows 存在，並且是有效的陣列
    if (!Array.isArray(rows) || rows.length === 0) {
      return res.status(400).json({ error: "摘要內容無效或為空" });
    }

    // 整理對話資料，讓它變成一個適合 GPT 接收的文字格式
    const formattedConversations = rows
      .filter(sum => sum && typeof sum.Summary_Content === "string") // 過濾有效的資料
      .map(sum => sum.Summary_Content) // 抽出文字內容
      .join("\n"); // 用換行符號合併起來


    console.log("整理後的摘要內容:", formattedConversations);

    if (!formattedConversations.trim()) {
      return res.status(400).json({ error: "整理後的摘要內容為空，無法產生總結" });
    }

    // GPT 生成總結
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "請總結這段心理諮商對話的重點，並以'你'稱呼User，以'相談夥伴'稱呼Avatar。",
        },
        { role: "user", content: formattedConversations },
      ],
      temperature: 0,
    });

    // 檢查 OpenAI API 回應是否有效
    if (!response.choices || response.choices.length === 0 || !response.choices[0].message.content) {
      return res.status(500).json({ error: "OpenAI 回傳的結果無效，無法產生摘要" });
    }

    res.json({ conclusion: response.choices[0].message.content });
  } catch (error: any) {
    console.error("GPT 生成總結失敗：", error.message);
    res.status(500).json({ error: "伺服器錯誤，請稍後再試" });
  }
});

//存入總結
app.post("/saveConclusionToDb", async (req: Request, res: Response) => {
  const { user_id, conclusion } = req.body;
  console.log("gpt產生的總結", conclusion);
  try {
    const [rows]: [any[], any] = await pool.query("SELECT COUNT(*) AS Conclusion_count FROM Conclusion WHERE Users_ID = ?", [user_id]);
    let count;
    if (rows.length > 0 && rows[0].Conclusion_count !== null) {
      count = rows[0].Conclusion_count + 1;// 這次總結的次數
    } else {
      count = 1; // 若無資料，預設 count 為 1
    }
    await pool.query("INSERT INTO Conclusion (Users_ID, Conclusion_Content, Conclusion_Times, Conclusion_Content_Highlight)VALUES (?, ?, ?, ?)", [user_id, conclusion, count, conclusion]);
    console.log("總結內容存入成功");
  }
  catch (error) {
    console.log("存入總結錯誤", error);
  }
})

// amy's儲存User對話
app.post("/api/saveUserConversation", async (req: Request, res: Response) => {
  const { user_id, user_message } = req.body;

  if (!user_id || !user_message) {
    return res.status(400).json({ error: "缺少必要參數" });
  }

  try {
    await pool.query(
      "INSERT INTO Conversation (Users_ID, Conversation_Role, Conversation_Content) VALUES (?, ?, ?)",
      [user_id, "User", user_message]
    );
    res.json({ message: "User對話已成功存儲" });
  } catch (error) {
    console.error("❌ User存儲對話失敗:", error);
    res.status(500).json({ error: "User存儲對話失敗" });
  }
});

// 儲存Avatar對話
app.post("/api/saveAvatarConversation", async (req: Request, res: Response) => {
  const { user_id, avatar_message } = req.body;

  if (!user_id || !avatar_message) {
    return res.status(400).json({ error: "缺少必要參數" });
  }

  try {
    await pool.query(
      "INSERT INTO Conversation (Users_ID, Conversation_Role, Conversation_Content) VALUES (?, ?, ?)",
      [user_id, "Avatar", avatar_message]
    );
    res.json({ message: "Avatar對話已成功存儲" });
  } catch (error) {
    console.error("❌ Avatar存儲對話失敗:", error);
    res.status(500).json({ error: "Avatar存儲對話失敗" });
  }
});

app.get("/api/getAssistantAndAvatar", async (req: Request, res: Response) => {
  const userId = req.headers.authorization?.replace("Bearer ", "");
  if (!userId) {
    return res.status(400).json({ error: "用戶未登入" });
  }

  try {
    const [rows]: [any[], any] = await pool.query("SELECT Users_PromptID AS assistantId, Users_AvatarID AS avatarName FROM Users WHERE Users_ID = ?", [userId]);
    if (rows.length === 0) {
      return res.status(404).json({ error: "用戶不存在" });
    }
    const { assistantId, avatarName } = rows[0];
    res.json({ assistantId, avatarName });
  } catch (error) {
    console.error("❌ 獲取 assistantId 和 avatarName 失敗:", error);
    res.status(500).json({ error: "獲取 assistantId 和 avatarName 失敗" });
  }
});

// 新增 API 來獲取摘要文字
app.get("/api/getConversationSummary", async (req: Request, res: Response) => {
  const userId = req.headers.authorization?.replace("Bearer ", "");
  if (!userId) {
    return res.status(400).json({ error: "用戶未登入" });
  }

  try {
    const [rows]: [any[], any] = await pool.query(
      "SELECT Summary_Content FROM Summary WHERE Users_id = ? AND Summary_Times = (SELECT MAX(Summary_Times) FROM Summary WHERE Users_id = ?);",
      [userId, userId]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: "沒有找到摘要文字" });
    }
    const summary = rows[0].Summary_Content; // 修正這裡
    res.json({ summary });
  } catch (error) {
    console.error("❌ 獲取摘要文字失敗:", error);
    res.status(500).json({ error: "獲取摘要文字失敗" });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 伺服器運行於 http://localhost:${PORT}`);
});