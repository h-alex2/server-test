const { App, ExpressReceiver } = require("@slack/bolt");
const schedule = require("node-schedule");
const generateRandomReviewer = require("./utils/generateRandomReviewer.js");

const expressReceiver = new ExpressReceiver({
  signingSecret: process.env.SLACK_SIGNING_SECRET,
});

// Initializes your app with your bot token and signing secret
const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  port: process.env.PORT || 3000,
  receiver: expressReceiver,
});

const expressApp = expressReceiver.app;

const { WebClient } = require("@slack/web-api");
app.client = new WebClient(process.env.SLACK_BOT_TOKEN);

const joinedAlgoMembers = [];

const member = {
  U04F2A0HT0Q: "공재혁",
  U04EG0SPEBV: "임현정",
  U04F5QP3WE4: "길지문",
  U04FCUV0DCY: "text계정",
};

// receiver.router.get("/slack/events", (_req, res) => {
//   console.log("req");
//   res.send("You can access this page without x-slack- headers!");
// });

// receiver.router.post("/slack/actions", (_req, res) => {
//   // app.action("button_click", async ({ body, ack, say }) => {
//   //   try {
//   //     console.log("click", body);
//   //     joinedAlgoMembers.push(member[body.user.id]);
//   //     const join = joinedAlgoMembers.join();

//   //     await ack();
//   //     await say(`<${join}> joined in today's Algo`);
//   //   } catch (err) {
//   //     console.log(err);
//   //   }
//   // });
//   console.log("pst");
//   res.send({ text: "test" });
// });

async function sendMorningMessage() {
  try {
    const result = await app.client.chat.postMessage({
      token: process.env.SLACK_BOT_TOKEN,
      channel: process.env.MESSAGE_CHANNEL,
      text: "Good Morning",
      blocks: [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `Good Morning Vas Members!🌼\n Are you ready to become a Algo King?🔥`,
          },
        },
        {
          type: "divider",
        },
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: "Click the *Join* Button!",
          },
          accessory: {
            type: "button",
            text: {
              type: "plain_text",
              text: "Join",
            },
            value: "click_me_123",
            action_id: "button_click",
          },
        },
      ],
    });

    console.log(result);
  } catch (error) {
    console.error(error);
  }
}

async function sendReviewer() {
  try {
    const reviewer = generateRandomReviewer(joinedAlgoMembers);
    const result = await app.client.chat.postMessage({
      token: process.env.SLACK_BOT_TOKEN,
      channel: process.env.MESSAGE_CHANNEL,
      text: `⭐️Today's Reviewer \n ${reviewer}`,
    });

    console.log(result);
  } catch (error) {
    console.error(error);
  }
}

app.action("button_click", async ({ body, ack, say }) => {
  try {
    console.log("click", body);
    joinedAlgoMembers.push(member[body.user.id]);
    const join = joinedAlgoMembers.join();

    await ack();
    await say(`<${join}> joined in today's Algo`);
  } catch (err) {
    console.log(err);
  }
});

let morningSheduleObj = null;
let reviewerSheduleObj = null;

const scheduleSet = () => {
  const morningMessageRule = new schedule.RecurrenceRule();
  const reviewerMatchRule = new schedule.RecurrenceRule();

  morningMessageRule.dayOfWeek = [0, 1, 2, 4, 6];
  morningMessageRule.hour = 16;
  morningMessageRule.minute = 30;
  morningMessageRule.tz = "Asia/Seoul";

  reviewerMatchRule.dayOfWeek = [0, 1, 2, 4, 6];
  reviewerMatchRule.hour = 16;
  reviewerMatchRule.minute = 31;
  reviewerMatchRule.tz = "Asia/Seoul";

  const firstJob = schedule.scheduleJob(morningMessageRule, () => {
    console.log("스케줄 스타트");
    sendMorningMessage();
  });

  const secondJob = schedule.scheduleJob(reviewerMatchRule, () => {
    console.log("스케줄 스타트");
    sendReviewer();
  });

  morningSheduleObj = firstJob;
  reviewerSheduleObj = secondJob;
};

const cancel = () => {
  if (morningSheduleObj !== null && reviewerSheduleObj !== null) {
    morningSheduleObj.cancel();
    reviewerSheduleObj.cancel();
  }
};

const setSchedueler = () => {
  cancel();
  scheduleSet();
};

setSchedueler();

app.message("문제 업로드 완료", async ({ message, say }) => {
  try {
    await say(
      `Today's algo upload complete.✨ \n\n Please follow the process below. \n 1. git fetch algo main \n2. git merge algo/main`
    );
  } catch (error) {
    console.log("문제 업로드 완료 에러", error);
  }
});

app.message("스케줄 테스트", async ({ message, say }) => {
  await sendMorningMessage();
  // const today = new Date();

  // const testMessageRule = new schedule.RecurrenceRule();

  // testMessageRule.dayOfWeek = [0, 1, 2, 4, 6];
  // testMessageRule.hour = today.getHours() + 9;
  // testMessageRule.minute = today.getMinutes() + 1;
  // testMessageRule.tz = "Asia/Seoul";

  // schedule.scheduleJob(testMessageRule, () => {
  //   console.log("테스트 메시지 실행");
  //   sendMorningMessage();
  // });

  // schedule.scheduleJob(
  //   { ...testMessageRule, minute: testMessageRule.minute + 1 },
  //   () => {
  //     console.log("테스트 메시지2 실행");
  //     sendReviewer();
  //   }
  // );

  // await say(
  //   `스케줄 테스트 실행 ${today.getHours() + 9}시 ${
  //     today.getMinutes() + 1
  //   }분에 실행됩니다.`
  // );
});

(async () => {
  // Start your app
  // await app.start();
  expressApp.listen(process.env.PORT || 3000);

  console.log("⚡️ Bolt app is running!");
})();

module.exports.app = function (req, res) {
  console.log(`Got a request: ${JSON.stringify(req.headers)}`);
  if (req.rawBody) {
    console.log(`Got raw request: ${req.rawBody}`);
  }
  expressApp(req, res);
};
