const { App } = require("@slack/bolt");
const schedule = require("node-schedule");
const generateRandomReviewer = require("./utils/generateRandomReviewer.js");

// Initializes your app with your bot token and signing secret
const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  port: process.env.PORT || 3000,
});

const joinedAlgoMembers = [];

const member = {
  U04F2A0HT0Q: "공재혁",
  U04EG0SPEBV: "임현정",
  U04F5QP3WE4: "길지문",
};

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
            text: `Good Morning Vas Members!🌼\n Are you ready to become a Algo King?🔥 \n Click the Join Button!`,
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
              emoji: true,
            },
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

const today = new Date();

let morningSheduleObj = null;
let reviewerSheduleObj = null;

const scheduleSet = () => {
  const morningMessageRule = new schedule.RecurrenceRule();
  const reviewerMatchRule = new schedule.RecurrenceRule();

  morningMessageRule.dayOfWeek = [0, 1, 2, 4, 6];
  morningMessageRule.hour = 9;
  morningMessageRule.minute = 30;
  morningMessageRule.tz = "Asia/Seoul";

  reviewerMatchRule.dayOfWeek = [0, 1, 2, 4, 6];
  reviewerMatchRule.hour = 10;
  reviewerMatchRule.minute = 30;
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
  const testMessageRule = new schedule.RecurrenceRule();

  testMessageRule.dayOfWeek = [0, 1, 2, 4, 6];
  testMessageRule.hour = today.getHours() + 9;
  testMessageRule.minute = today.getMinutes() + 1;
  testMessageRule.tz = "Asia/Seoul";

  schedule.scheduleJob(testMessageRule, () => {
    console.log("테스트 메시지 실행");
    sendMorningMessage();
  });

  schedule.scheduleJob(
    { ...testMessageRule, minute: testMessageRule.minute + 1 },
    () => {
      console.log("테스트 메시지2 실행");
      sendMorningMessage();
    }
  );
});

(async () => {
  // Start your app
  await app.start();

  console.log("⚡️ Bolt app is running!");
})();
