import { describe, expect, it } from "vitest";
import {
  CAT_RESCUE_CHOICES,
  getCatRescueStageAfterFriendAdd,
  getCatRescueThreadForStage,
  filterPrankHistoryLines,
  shouldMigrateLegacyPrankReadd,
  shouldShowPrankHistoryLine,
  splitCatRescueMessages,
  orderCatRescueThreadItems,
} from "./AppSkins";
import { createWork } from "./demo";
import { makeItem } from "./schema";

describe("WeChat cat-rescue story configuration", () => {
  it("routes every hospital stage to Broccoli and owner stages to DaG", () => {
    for (const stage of [0, 1, 2, 3, 4, 5, 6, 7, 8, 10, 11, 12, 30, 31, 32, 33, 34, 37, 38, 39, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52]) {
      expect(getCatRescueThreadForStage(stage)).toBe("西蓝花");
    }
    for (const stage of [9, 13, 14, 16, 17, 20, 21, 22, 23, 24, 25, 26, 27, 35, 40, 53]) {
      expect(getCatRescueThreadForStage(stage)).toBe("大G");
    }
  });

  it("keeps the leave-first return-to-kitten choices in the Broccoli thread", () => {
    expect(getCatRescueThreadForStage(10)).toBe("西蓝花");
    expect(getCatRescueThreadForStage(11)).toBe("西蓝花");
    expect(CAT_RESCUE_CHOICES[10]).toHaveLength(2);
    expect(CAT_RESCUE_CHOICES[11]).toHaveLength(2);
    expect(CAT_RESCUE_CHOICES[10].every((choice) => choice.nextStage !== 8)).toBe(true);
    expect(CAT_RESCUE_CHOICES[11].every((choice) => choice.nextStage !== 8)).toBe(true);
  });

  it("has a defined next state for every visible story choice", () => {
    const systemStates = new Set([8, 13, 17]);
    for (const [stage, choices] of Object.entries(CAT_RESCUE_CHOICES)) {
      for (const choice of choices) {
        expect(choice.id, `stage ${stage}`).toBeTruthy();
        expect(choice.lines.length, choice.id).toBeGreaterThan(0);
        expect(
          CAT_RESCUE_CHOICES[choice.nextStage] !== undefined ||
            systemStates.has(choice.nextStage),
          `${choice.id} points to missing stage ${choice.nextStage}`,
        ).toBe(true);
      }
    }
  });

  it("offers exactly two player-controlled replies at every active story turn", () => {
    const systemOrTerminalStages = new Set([8, 13, 36]);
    for (const [stage, choices] of Object.entries(CAT_RESCUE_CHOICES)) {
      if (systemOrTerminalStages.has(Number(stage))) continue;
      expect(choices, `stage ${stage} must have two choices`).toHaveLength(2);
    }
  });

  it("shows two reply choices immediately after Broccoli asks whether the user arrived", () => {
    expect(CAT_RESCUE_CHOICES[12]).toHaveLength(2);
    expect(CAT_RESCUE_CHOICES[12].every((choice) => choice.nextStage === 30)).toBe(true);
    expect(CAT_RESCUE_CHOICES[30]).toHaveLength(2);
    expect(CAT_RESCUE_CHOICES[30][1].lines[0].body).not.toContain("玩玩");
    expect(CAT_RESCUE_CHOICES[30].every((choice) => choice.nextStage === 31)).toBe(true);
    expect(CAT_RESCUE_CHOICES[31]).toHaveLength(2);
    expect(CAT_RESCUE_CHOICES[31].every((choice) => choice.nextStage === 46)).toBe(true);
    expect(CAT_RESCUE_CHOICES[31].every((choice) => !choice.lines[0].body.includes("！！！！"))).toBe(true);
    for (const stage of [46, 47, 48, 49, 50, 51, 52]) expect(CAT_RESCUE_CHOICES[stage]).toHaveLength(2);
    expect(CAT_RESCUE_CHOICES[46].every((choice) => choice.nextStage === 47)).toBe(true);
    expect(CAT_RESCUE_CHOICES[47][0].lines[0].body).toContain("溫尚翊");
    expect(CAT_RESCUE_CHOICES[48][0].lines[1].body).toContain("怪獸");
    expect(CAT_RESCUE_CHOICES[49].every((choice) => choice.nextStage === 50)).toBe(true);
    expect(CAT_RESCUE_CHOICES[50].every((choice) => choice.nextStage === 51)).toBe(true);
    expect(CAT_RESCUE_CHOICES[51].every((choice) => choice.nextStage === 52)).toBe(true);
    expect(CAT_RESCUE_CHOICES[52].every((choice) => choice.nextStage === 8)).toBe(true);
  });

  it("contains the complete delete, failed-send, re-add, apology sequence", () => {
    const prank = CAT_RESCUE_CHOICES[9].find((choice) => choice.id === "monster-prank");
    const apology = CAT_RESCUE_CHOICES[16].find((choice) => choice.id === "monster-apology-explain");
    expect(prank?.nextStage).toBe(17);
    expect(prank?.lines.map((line) => line.body)).toEqual([
      "我是你爸爸。", "……蛤？", "妳哪位？我不認識妳喔。", "好喔，那我先把妳刪掉了。掰。",
    ]);
    expect(CAT_RESCUE_CHOICES[17]).toHaveLength(2);
    expect(shouldShowPrankHistoryLine(makeItem({ id: "first-greeting", title: "大G", sender: "大G", body: "妳是？" }), "monster-prank")).toBe(true);
    expect(shouldShowPrankHistoryLine(makeItem({ id: "old-delete", title: "大G", sender: "大G", body: "好喔，那我先把妳刪掉了。掰。" }), "monster-prank")).toBe(true);
    expect(shouldShowPrankHistoryLine(makeItem({ id: "old-question", title: "大G", sender: "大G", body: "……蛤？" }), "monster-cat", true)).toBe(true);
    expect(shouldShowPrankHistoryLine(makeItem({ id: "owner-reply", title: "大G", sender: "大G", body: "妳哪位？我不認識妳喔。" }), "monster-cat", true)).toBe(true);
    expect(shouldShowPrankHistoryLine(makeItem({ id: "delete-notice", title: "大G", sender: "大G", body: "好喔，那我先把妳刪掉了。掰。" }), "monster-cat", true)).toBe(true);
    expect(shouldShowPrankHistoryLine(makeItem({ id: "first-greeting", title: "大G", sender: "大G", body: "妳是？" }), "monster-cat", true)).toBe(true);
    expect(shouldShowPrankHistoryLine(makeItem({ id: "post-readd", title: "大G", sender: "大G", body: "？？？" }), "monster-cat", true)).toBe(true);
    const prankHistory = filterPrankHistoryLines([
      makeItem({ id: "greeting", body: "妳是？" }),
      makeItem({ id: "prank", body: "我是你爸爸。" }),
      makeItem({ id: "duplicate-greeting", body: "妳是？" }),
      makeItem({ id: "confused", body: "……蛤？" }),
      makeItem({ id: "who", body: "妳哪位？我不認識妳喔。" }),
      makeItem({ id: "deleted", body: "好喔，那我先把妳刪掉了。掰。" }),
    ], true);
    expect(prankHistory.map((item) => item.id)).toEqual(["greeting", "prank", "confused", "who", "deleted"]);
    expect(shouldMigrateLegacyPrankReadd(14, true, true, true)).toBe(true);
    expect(shouldMigrateLegacyPrankReadd(14, true, false, true)).toBe(false);
    expect(shouldMigrateLegacyPrankReadd(14, false, true, true)).toBe(false);
    expect(CAT_RESCUE_CHOICES[17].some((choice) => /發錯人/.test(choice.lines[0].body))).toBe(true);
    expect(CAT_RESCUE_CHOICES[17].every((choice) => choice.nextStage === 13)).toBe(true);
    expect(CAT_RESCUE_CHOICES[16]).toHaveLength(2);
    expect(CAT_RESCUE_CHOICES[16].every((choice) => choice.nextStage === 20)).toBe(true);
    const shortApology = CAT_RESCUE_CHOICES[16].find((choice) => choice.id === "monster-apology-after-prank");
    expect(shortApology?.lines.map((line) => line.sender)).toEqual(["我", "大G", "我", "大G"]);
    expect(shortApology?.lines[1].body).toBe("我說呢，怎麼有人一上來就說奇奇怪怪的話，原來是這樣喔……");
    expect(apology?.nextStage).toBe(20);
    expect(apology?.lines.some((line) => /小黑貓/.test(line.body))).toBe(true);
    expect(apology?.lines.map((line) => line.sender)).toEqual(["我", "大G", "我", "大G"]);
    expect(apology?.lines.map((line) => line.body)).toEqual([
      "真的對不起！我剛剛只是想開個玩笑，沒想到你真的把我刪掉了。",
      "我說呢，怎麼有人一上來就說奇奇怪怪的話，原來是這樣喔……",
      "我是在路邊撿到一隻小黑貓，牠脖子上的牌子有你的微信號，所以才急著聯絡你。",
      "蛤？原來是這樣……小黑貓現在在哪裡？牠有沒有受傷？妳先跟我說一下。",
    ]);
    expect(CAT_RESCUE_CHOICES[20]).toHaveLength(2);
    expect(CAT_RESCUE_CHOICES[21]).toHaveLength(2);
    expect(CAT_RESCUE_CHOICES[22]).toHaveLength(2);
    expect(CAT_RESCUE_CHOICES[23]).toHaveLength(2);
    expect(CAT_RESCUE_CHOICES[24]).toHaveLength(2);
    expect(CAT_RESCUE_CHOICES[25]).toHaveLength(2);
    expect(CAT_RESCUE_CHOICES[20].some((choice) => choice.id === "verify-owner-name")).toBe(true);
    expect(CAT_RESCUE_CHOICES[20].find((choice) => choice.id === "verify-owner-name")?.lines.some((line) => /我叫溫尚翊/.test(line.body))).toBe(true);
    expect(CAT_RESCUE_CHOICES[21][0].lines[0].body).toContain("什麼時候方便回來接");
    expect(CAT_RESCUE_CHOICES[21][0].lines[1].body).toContain("這幾天都不在家");
    expect(CAT_RESCUE_CHOICES[22].every((choice) => choice.lines[0].sender === "我" && /照顧.{0,3}幾天/.test(choice.lines[0].body))).toBe(true);
    expect(CAT_RESCUE_CHOICES[23]).toHaveLength(2);
    expect(CAT_RESCUE_CHOICES[23][0].nextStage).toBe(27);
    expect(CAT_RESCUE_CHOICES[23][0].lines.map((line) => line.body)).toEqual([
      "對了，聊了半天我還不知道牠叫什麼名字呢？這隻貓叫什麼呀？",
      "牠叫玩玩。",
    ]);
    expect(CAT_RESCUE_CHOICES[26]).toHaveLength(2);
    expect(CAT_RESCUE_CHOICES[26][0].lines.some((line) => /情況我再聯絡你/.test(line.body))).toBe(true);
    expect(CAT_RESCUE_CHOICES[27][0].lines.map((line) => line.body)).toEqual([
      "玩玩……？我靠！",
      "妳？？？怎麼啦？",
    ]);
    expect(CAT_RESCUE_CHOICES[27][0].nextStage).toBe(53);
    expect(CAT_RESCUE_CHOICES[53]).toHaveLength(2);
    expect(CAT_RESCUE_CHOICES[53][0].lines[0].body).toContain("名字太好了");
    expect(CAT_RESCUE_CHOICES[53].every((choice) => choice.nextStage === 32)).toBe(true);
    expect(getCatRescueThreadForStage(53)).toBe("大G");
    expect(CAT_RESCUE_CHOICES[32][0].lines[0].body).toContain("我靠我靠");
    expect(CAT_RESCUE_CHOICES[32][0].nextStage).toBe(33);
    expect(CAT_RESCUE_CHOICES[41]).toHaveLength(2);
    expect(CAT_RESCUE_CHOICES[41][0].lines[1].body).toContain("怪獸");
    expect(CAT_RESCUE_CHOICES[41][0].nextStage).toBe(42);
    expect(CAT_RESCUE_CHOICES[40]).toHaveLength(2);
    expect(CAT_RESCUE_CHOICES[40].every((choice) => choice.nextStage === 35)).toBe(true);
    expect(getCatRescueThreadForStage(40)).toBe("大G");
    expect(CAT_RESCUE_CHOICES[40][0].lines[0].body).toContain("不好意思");
    expect(CAT_RESCUE_CHOICES[42]).toHaveLength(2);
    expect(CAT_RESCUE_CHOICES[42][0].lines.some((line) => /同名同姓/.test(line.body))).toBe(true);
    expect(CAT_RESCUE_CHOICES[42][0].nextStage).toBe(43);
    expect(CAT_RESCUE_CHOICES[43][0].nextStage).toBe(44);
    expect(CAT_RESCUE_CHOICES[44]).toHaveLength(2);
    expect(CAT_RESCUE_CHOICES[44][0].lines[1].body).toContain("沒人接");
    expect(CAT_RESCUE_CHOICES[44][0].nextStage).toBe(45);
    expect(CAT_RESCUE_CHOICES[45]).toHaveLength(2);
    expect(CAT_RESCUE_CHOICES[45].every((choice) => choice.nextStage === 8)).toBe(true);
    expect(CAT_RESCUE_CHOICES[32][0].lines.map((line) => line.sender)).toEqual(["我", "西蓝花"]);
    expect(CAT_RESCUE_CHOICES[32][0].lines[0].body).toContain("名字太好了");
    expect(CAT_RESCUE_CHOICES[32][0].lines[1].body).toContain("怪獸家的貓就叫玩玩");
    expect(CAT_RESCUE_CHOICES[32][1].lines[1].body).toContain("怪獸家的貓就叫玩玩");
    expect(CAT_RESCUE_CHOICES[33]).toHaveLength(2);
    expect(CAT_RESCUE_CHOICES[33][0].lines.map((line) => line.sender)).toEqual(["我", "西蓝花"]);
    expect(CAT_RESCUE_CHOICES[33][0].lines[0].body).toContain("沒想到牠會叫玩玩");
    expect(CAT_RESCUE_CHOICES[33][0].lines[1].body).toContain("先相信妳");
    expect(CAT_RESCUE_CHOICES[33][0].nextStage).toBe(37);
    expect(CAT_RESCUE_CHOICES[37]).toHaveLength(2);
    expect(CAT_RESCUE_CHOICES[38]).toHaveLength(2);
    expect(CAT_RESCUE_CHOICES[39][0].nextStage).toBe(40);
    expect(CAT_RESCUE_CHOICES[40][0].nextStage).toBe(35);
    expect(CAT_RESCUE_CHOICES[42][0].nextStage).toBe(43);
    expect(CAT_RESCUE_CHOICES[43][0].nextStage).toBe(44);
  });


  it("preserves the full seeded Broccoli chat history in its own conversation", () => {
    const work = createWork();
    const history = work.data.wechat.filter((item) => item.title === "西蓝花");
    expect(history).toHaveLength(18);
    expect(history.every((item) => item.sender !== "大G")).toBe(true);
    expect(history.some((item) => item.body.includes("五月天"))).toBe(true);
    expect(history.some((item) => item.body.includes("小黑猫"))).toBe(true);
  });

  it("keeps legacy misrouted hospital messages in Broccoli and prank messages with DaG", () => {
    const mixed = [
      makeItem({ id: "clinic-wrong-title", title: "大G", sender: "我", body: "到了到了！我刚到医院。", outgoing: true, meta: { storyThread: "大G" } }),
      makeItem({ id: "clinic-question", title: "大G", sender: "西蓝花", body: "医生有开始帮它检查了吗？", meta: { storyThread: "大G" } }),
      makeItem({ id: "prank-wrong-title", title: "西蓝花", sender: "我", body: "我是你爸爸。", outgoing: true }),
      makeItem({ id: "owner-reply", title: "大G", sender: "大G", body: "妳哪位？我不認識妳喔。" }),
    ];
    const split = splitCatRescueMessages(mixed);
    expect(split.broccoli.map((item) => item.id)).toEqual(["clinic-wrong-title", "clinic-question"]);
    expect(split.owner.map((item) => item.id)).toEqual(["prank-wrong-title", "owner-reply"]);
    const wanwanLines = [
      makeItem({ id: "wanwan-owner-start", title: "大G", sender: "大G", body: "妳？？？怎麼啦？" }),
      makeItem({ id: "wanwan-broccoli-reply", title: "大G", sender: "我", body: "我靠我靠我靠，玩玩！！", outgoing: true, meta: { storyThread: "西蓝花" } }),
      makeItem({ id: "wanwan-broccoli-excitement", title: "大G", sender: "西蓝花", body: "玩玩？？？怪獸的貓就叫玩玩啊！！！", meta: { storyThread: "西蓝花" } }),
    ];
    const revealSplit = splitCatRescueMessages(wanwanLines);
    expect(revealSplit.broccoli.map((item) => item.id)).toEqual(["wanwan-broccoli-reply", "wanwan-broccoli-excitement"]);
    expect(revealSplit.owner.map((item) => item.id)).toEqual(["wanwan-owner-start"]);
  });

  it("returns the correct stage after initial add and after re-adding a deleted friend", () => {
    expect(getCatRescueStageAfterFriendAdd(8, "monster-cat")).toBe(9);
    expect(getCatRescueStageAfterFriendAdd(13, "monster-prank")).toBe(16);
    expect(getCatRescueStageAfterFriendAdd(13, "monster-cat")).toBe(14);
  });

  it("keeps player replies in the transcript and places the newest message last", () => {
    const oldReply = makeItem({
      id: "player-old",
      title: "西蓝花",
      sender: "我",
      body: "我先看看它。",
      time: "2026-11-02 14:20",
      outgoing: true,
    });
    const delayedReply = makeItem({
      id: "friend-later",
      title: "西蓝花",
      sender: "西蓝花",
      body: "好，那你慢慢来。",
      time: "2026-11-02 14:21",
    });
    const newestReply = makeItem({
      id: "player-new",
      title: "西蓝花",
      sender: "我",
      body: "我已经到医院了。",
      time: "2026-11-02 14:22",
      outgoing: true,
    });
    const ordered = orderCatRescueThreadItems([
      oldReply,
      newestReply,
      delayedReply,
      newestReply,
    ]);
    expect(ordered.map((item) => item.id)).toEqual([
      "player-old",
      "friend-later",
      "player-new",
    ]);
    expect(ordered.at(-1)?.body).toBe("我已经到医院了。");
  });

  it("keeps the prank and apology branches in the owner's conversation", () => {
    for (const stage of [9, 16, 17, 20, 21, 22, 23, 24, 25, 26, 27, 35]) {
      expect(getCatRescueThreadForStage(stage)).toBe("大G");
      for (const choice of CAT_RESCUE_CHOICES[stage] ?? []) {
        expect(choice.lines.every((line) => line.thread === "西蓝花" || line.sender === "我" || line.sender === "大G")).toBe(true);
      }
    }
  });
});
