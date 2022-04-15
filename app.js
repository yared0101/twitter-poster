const { TwitterApi } = require("twitter-api-v2");
const readline = require("readline-sync");
require("dotenv").config();
const { execSync } = require("child_process");
const { readFileSync } = require("fs");
const secrets = {
    ACCOUNT1APIKEY: process.env.ACCOUNT1APIKEY,
    ACCOUNT1APISECRET: process.env.ACCOUNT1APISECRET,
    ACCOUNT1ACCESSTOKEN: process.env.ACCOUNT1ACCESSTOKEN,
    ACCOUNT1ACCESSTOKENSECRET: process.env.ACCOUNT1ACCESSTOKENSECRET,
    ACCOUNT2APIKEY: process.env.ACCOUNT2APIKEY,
    ACCOUNT2APISECRET: process.env.ACCOUNT2APISECRET,
    ACCOUNT2ACCESSTOKEN: process.env.ACCOUNT2ACCESSTOKEN,
    ACCOUNT2ACCESSTOKENSECRET: process.env.ACCOUNT2ACCESSTOKENSECRET,
    ACCOUNT3APIKEY: process.env.ACCOUNT3APIKEY,
    ACCOUNT3APISECRET: process.env.ACCOUNT3APISECRET,
    ACCOUNT3ACCESSTOKEN: process.env.ACCOUNT3ACCESSTOKEN,
    ACCOUNT3ACCESSTOKENSECRET: process.env.ACCOUNT3ACCESSTOKENSECRET,
    ACCOUNT4APIKEY: process.env.ACCOUNT4APIKEY,
    ACCOUNT4APISECRET: process.env.ACCOUNT4APISECRET,
    ACCOUNT4ACCESSTOKEN: process.env.ACCOUNT4ACCESSTOKEN,
    ACCOUNT4ACCESSTOKENSECRET: process.env.ACCOUNT4ACCESSTOKENSECRET,
    ACCOUNT5APIKEY: process.env.ACCOUNT5APIKEY,
    ACCOUNT5APISECRET: process.env.ACCOUNT5APISECRET,
    ACCOUNT5ACCESSTOKEN: process.env.ACCOUNT5ACCESSTOKEN,
    ACCOUNT5ACCESSTOKENSECRET: process.env.ACCOUNT5ACCESSTOKENSECRET,
};
console.table(secrets);
for (let i in secrets) {
    if (secrets[i]) {
        continue;
    } else {
        console.log(`======> Please input ${i} in .env file`);
    }
}
const users = {
    user1: process.env.ACCOUNT1,
    user2: process.env.ACCOUNT2,
    user3: process.env.ACCOUNT3,
    user4: process.env.ACCOUNT4,
    user5: process.env.ACCOUNT5,
};
const userNames = [
    `@${users.user1}`,
    `@${users.user2}`,
    `@${users.user3}`,
    `@${users.user4}`,
    `@${users.user5}`,
];
const tweetClient1 = new TwitterApi({
    appKey: secrets.ACCOUNT1APIKEY,
    appSecret: secrets.ACCOUNT1APISECRET,
    accessToken: secrets.ACCOUNT1ACCESSTOKEN,
    accessSecret: secrets.ACCOUNT1ACCESSTOKENSECRET,
});
const tweetClient2 = new TwitterApi({
    appKey: secrets.ACCOUNT2APIKEY,
    appSecret: secrets.ACCOUNT2APISECRET,
    accessToken: secrets.ACCOUNT2ACCESSTOKEN,
    accessSecret: secrets.ACCOUNT2ACCESSTOKENSECRET,
});
const tweetClient3 = new TwitterApi({
    appKey: secrets.ACCOUNT3APIKEY,
    appSecret: secrets.ACCOUNT3APISECRET,
    accessToken: secrets.ACCOUNT3ACCESSTOKEN,
    accessSecret: secrets.ACCOUNT3ACCESSTOKENSECRET,
});
const tweetClient4 = new TwitterApi({
    appKey: secrets.ACCOUNT4APIKEY,
    appSecret: secrets.ACCOUNT4APISECRET,
    accessToken: secrets.ACCOUNT4ACCESSTOKEN,
    accessSecret: secrets.ACCOUNT4ACCESSTOKENSECRET,
});
const tweetClient5 = new TwitterApi({
    appKey: secrets.ACCOUNT5APIKEY,
    appSecret: secrets.ACCOUNT5APISECRET,
    accessToken: secrets.ACCOUNT5ACCESSTOKEN,
    accessSecret: secrets.ACCOUNT5ACCESSTOKENSECRET,
});
const tweetClients = [
    tweetClient1,
    tweetClient2,
    tweetClient3,
    tweetClient4,
    tweetClient5,
];

let tweetActions = {};

/**
 *
 * @param {*} tweetNo
 * @param {number} userNo
 * @param {boolean} success
 * @param {"liked"|"commented"|"retweeted"|"followed"} action string between liked, commented, retweeted and followed
 */
const logTweetActions = (tweetNo, userNo, success, action) => {
    if (tweetActions[`tweet${tweetNo}`])
        tweetActions[`tweet${tweetNo}`][`user${userNo}`] = {
            ...tweetActions[`tweet${tweetNo}`][`user${userNo}`],
            username: users[`user${userNo}`],
            [action]: success,
        };
    else {
        tweetActions[`tweet${tweetNo}`] = {
            ...tweetActions[`tweet${tweetNo}`],
            [`user${userNo}`]: {
                ...tweetActions[`tweet${tweetNo}`],
                username: users[`user${userNo}`],
                [action]: success,
            },
        };
    }
    try {
        process.stdout.write("\033c");
    } catch {
        try {
            execSync("clear");
            console.log("clear working");
        } catch {}
    }
    for (let i = 1; i <= tweetNo; i++) {
        console.log(
            `--------------------------tweeet  ${i}--------------------------\n\n`
        );
        console.table(tweetActions[`tweet${i}`]);
        console.log(
            `\n--------------------------tweeet done --------------------------\n\n`
        );
        console.log("\n\n\n");
    }
};

const main = async () => {
    let allAreAdded = true;
    for (let i in secrets) {
        if (secrets[i]) {
            continue;
        } else {
            console.log(`======> Please input ${i} in .env file`);
            allAreAdded = false;
        }
    }
    if (!allAreAdded) {
        return;
    }
    const tweetIds = await getTweetIds();
    if (!tweetIds || !tweetIds.length) {
        console.log(
            "No tweets were found!! on tweets.csv\n ps. make sure it's in the same folder as this app"
        );
        return;
    }
    /**[[user1,user3],[user3,user5]]*/
    const taggedUsers = await getTaggedUsers(tweetIds);
    const comments = getComments();
    let tweetNum = 0;
    for (let i in tweetIds) {
        const tweetId = tweetIds[i];
        let userNum = 0;
        for (let _k in users) {
            //#region like
            const tweetLiked = await likeTweet(tweetId, userNum);
            logTweetActions(tweetNum + 1, userNum + 1, tweetLiked, "liked");
            await sleep();
            //#endregion

            //#region comment
            const tweetCommented = await commentTweet(
                tweetId,
                comments[userNum],
                userNum
            );
            logTweetActions(
                tweetNum + 1,
                userNum + 1,
                tweetCommented,
                "commented"
            );
            await sleep();
            //#endregion

            //#region retweet
            const retweeted = await retweet(tweetId, userNum);
            logTweetActions(tweetNum + 1, userNum + 1, retweeted, "retweeted");
            await sleep();
            //#endregion
            //#region follow tagged
            const followed = await follow(taggedUsers[i], userNum);

            logTweetActions(tweetNum + 1, userNum + 1, followed, "followed");
            await sleep();

            await sleep(1000);

            //#endregion
            userNum++;
        }
        tweetNum++;
    }
    console.log("!!!!!!!!!!!!!!!! SUCCESS !!!!!!!!!!!! it's all done!");
};
const getComments = () => {
    while (true) {
        const comment1 = readline.question(
            `Please input comment for user 1 (${users.user1}) : `
        );
        const comment2 = readline.question(
            `Please input comment for user 2 (${users.user2}) : `
        );
        const comment3 = readline.question(
            `Please input comment for user 3 (${users.user3}) : `
        );
        const comment4 = readline.question(
            `Please input comment for user 4 (${users.user4}) : `
        );
        const comment5 = readline.question(
            `Please input comment for user 5 (${users.user5}) : `
        );

        console.log("you have inputted comments");
        console.table({
            comment1,
            comment2,
            comment3,
            comment4,
            comment5,
        });

        const stop = readline.keyInYN("Do you want to continue");
        if (stop) {
            return [
                comment1 || "no comment",
                comment2 || "no comment",
                comment3 || "no comment",
                comment4 || "no comment",
                comment5 || "no comment",
            ];
        }
    }
};
async function sleep() {
    console.log("\nsleeping 1 second\n");
    return new Promise((resolve) => {
        setTimeout(resolve, 1000);
    });
}
const getTweetIds = async () => {
    let tweets = readFileSync("tweets.csv", "utf-8") || "";
    tweets = tweets.split(",");
    let tweetIds = [];
    for (const i in tweets) {
        let tweet = tweets[i].trim();
        tweetIds.push(tweet.split("/").pop());
    }
    return tweetIds;
};
const getTaggedUsers = async (tweetIds) => {
    let tweets = [];
    for (let i in tweetIds) {
        const tweet = await tweetClient1.v2.singleTweet(tweetIds[i], {
            expansions: ["entities.mentions.username"],
        });
        tweets.push(tweet);
    }
    return tweets
        .filter((tweet) => tweet?.data?.entities?.mentions?.length)
        .map((tweet) => tweet.data.entities.mentions.map((elem) => elem.id));
};
/**
 *
 * @param {string} tweetId
 * @param {number} userNum
 * @returns
 */
const likeTweet = async (tweetId, userNum) => {
    try {
        console.log(userNum);
        const meUser = await tweetClients[userNum].v2.me();
        const meid = meUser.data.id;
        await tweetClients[userNum].v2.like(meid, tweetId);
        return true;
    } catch (e) {
        console.log(e);
        return false;
    }
};
/**
 *
 * @param {string} tweetId
 * @param {string} comment
 * @param {number} userNum
 * @returns
 */
const commentTweet = async (tweetId, comment, userNum) => {
    try {
        let randomSelected = [...userNames];
        randomSelected.splice(userNum, 1);
        randomSelected.splice(Math.floor(Math.random() * 4), 1);
        await tweetClients[userNum].v2.reply(
            comment +
                " " +
                randomSelected[0] +
                " " +
                randomSelected[1] +
                " " +
                randomSelected[2],
            tweetId
        );
        return true;
    } catch (e) {
        console.log(e);
        return false;
    }
};
/**
 *
 * @param {string} tweetId
 * @param {number} userNum
 * @returns
 */
const retweet = async (tweetId, userNum) => {
    try {
        console.log(userNum);
        const meUser = await tweetClients[userNum].v2.me();
        const meid = meUser.data.id;
        await tweetClients[userNum].v2.retweet(meid, tweetId);
        return true;
    } catch (e) {
        console.log(e);
        return false;
    }
};
/**
 *
 * @param {string[]} taggedUsers
 * @param {number} userNum
 * @returns
 */
const follow = async (taggedUsers, userNum) => {
    try {
        const meUser = await tweetClients[userNum].v2.me();
        const meid = meUser.data.id;
        for (const i in taggedUsers) {
            await tweetClients[userNum].v2.follow(meid, taggedUsers[i]);
        }
        return true;
    } catch (e) {
        console.log(e);
        return false;
    }
};
const test = async () => {
    // await retweet((await getTweetIds())[0], 4);
    // await follow((await getTaggedUsers(await getTweetIds()))[0], 4);
    const data = await likeTweet((await getTweetIds())[0], 0);
    console.log("success", data);
    // commentTweet((await getTweetIds())[0], "awesome! I love this guy", 0);
    // console.log(await getTaggedUsers(await getTweetIds()));
};
// test();
main()
    .then(() => {
        readline.question(" --  ");
    })
    .catch(() => {
        readline.question(" --  ");
    })
    .finally(() => {
        readline.question(" --  ");
    });
