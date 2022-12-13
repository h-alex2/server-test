const { App } = require("@slack/bolt");
const schedule = require("node-schedule");
const generateRandomReviewer = require("./utils/generateRandomReviewer.js");
const removeDuplication = require("./utils/removeDuplication.js");

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  port: process.env.PORT || 3000,
});

const joinedAlgoMembers = [];

const member = {
  U04F2A0HT0Q: "공재혁",
  U04F5QP3WE4: "길지문",
  U04EQSZ4MSS: "사공은혜",
  U04EXF5FSTC: "안형우",
  U04EGULQY5V: "이세영",
  U04EQSZ6GHL: "이정진",
  U04EG0SPEBV: "임현정",
  U04EGUM5ZFH: "최송이",
  U04FM6DECP2: "한아름",
  U04ERNNE11S: "test1",
  U04FCUV0DCY: "test2",
};

async function sendMorningMessage() {
  try {
    joinedAlgoMembers.length = 0;

    const result = await app.client.chat.postMessage({
      token: process.env.SLACK_BOT_TOKEN,
      channel: process.env.MESSAGE_CHANNEL,
      text: "Good Morning",
      blocks: [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `Good Morning Vas Members!🌼\n Are you ready to become a Algo King?`,
          },
        },
        {
          type: "divider",
        },
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: "Click the *Join* Button!🔥",
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

let morningSheduleObj = null;
let reviewerSheduleObj = null;

const scheduleSet = () => {
  const morningMessageRule = new schedule.RecurrenceRule();
  const reviewerMatchRule = new schedule.RecurrenceRule();

  morningMessageRule.dayOfWeek = [0, 2, 4, 6];
  morningMessageRule.hour = 17;
  morningMessageRule.minute = 30;
  morningMessageRule.tz = "Asia/Seoul";

  reviewerMatchRule.dayOfWeek = [0, 2, 4, 6];
  reviewerMatchRule.hour = 17;
  reviewerMatchRule.minute = 32;
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

app.action("button_click", async ({ body, ack, say }) => {
  try {
    const clickedMember = member[body.user.id];

    if (
      joinedAlgoMembers.find((joinedMember) => joinedMember === clickedMember)
    ) {
      return;
    } else {
      joinedAlgoMembers.push(clickedMember);

      await ack();
      await say(`<${joinedAlgoMembers.join()}> joined in today's Algo`);
    }
  } catch (err) {
    console.log(err);
  }
});

app.message("문제 업로드 완료", async ({ message, say }) => {
  try {
    await say(
      `Today's algo upload complete.✨ \n\n Please follow the process below. \n⚠️git pull algo *problems*`
    );
  } catch (error) {
    console.log("문제 업로드 완료 에러", error);
  }
});

app.message("내가 누규?", async ({ message, say }) => {
  try {
    console.log(message);
    await say(`나는 ${member[message.user.id]}😎`);
  } catch (error) {
    console.log("내가 누구? 에러", error);
  }
});

app.message("스케줄 테스트", async ({ message, say }) => {
  await sendMorningMessage();
});

app.error((error) => {
  console.error(error);
});

(async () => {
  await app.start();

  console.log("⚡️ Bolt app is running!");
})();
