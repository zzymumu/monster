import { describe, expect, it } from "vitest";
import {
  CAT_RESCUE_CHOICES,
  getCatRescueStageAfterFriendAdd,
  getCatRescueThreadForStage,
  filterPrankHistoryLines,
  shouldMigrateLegacyPrankReadd,
  shouldShowPrankHistoryLine,
  splitCatRescueMessages,
} from "./AppSkins";
import { createWork } from "./demo";
import { makeItem } from "./schema";

describe("WeChat cat-rescue story configuration", () => {
  it("routes every hospital stage to Broccoli and owner stages to DaG", () => {
    for (const stage of [0, 1, 2, 3, 4, 5, 6, 7, 8, 10, 11, 30, 31, 32, 33, 34]) {
      expect(getCatRescueThreadForStage(stage)).toBe("西蓝花");
    }
    for (const stage of [9, 13, 14, 16, 17, 20, 21, 22, 23, 24, 25, 26, 27, 35]) {
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

  it("shows two reply choices immediately after Broccoli asks whether the user arrived", () => {
    expect(CAT_RESCUE_CHOICES[30]).toHaveLength(2);
    expect(CAT_RESCUE_CHOICES[30].every((choice) => choice.nextStage === 31)).toBe(true);
    expect(CAT_RESCUE_CHOICES[31]).toHaveLength(2);
    expect(CAT_RESCUE_CHOICES[31].every((choice) => choice.nextStage === 4)).toBe(true);
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
    expect(CAT_RESCUE_CHOICES[20]).toHaveLength(3);
    expect(CAT_RESCUE_CHOICES[21]).toHaveLength(2);
    expect(CAT_RESCUE_CHOICES[22]).toHaveLength(2);
    expect(CAT_RESCUE_CHOICES[23]).toHaveLength(2);
    expect(CAT_RESCUE_CHOICES[24]).toHaveLength(2);
    expect(CAT_RESCUE_CHOICES[25]).toHaveLength(2);
    expect(CAT_RESCUE_CHOICES[20].some((choice) => choice.id === "verify-owner-name")).toBe(true);
    expect(CAT_RESCUE_CHOICES[20].find((choice) => choice.id === "verify-owner-name")?.lines.some((line) => /我叫溫尚翊/.test(line.body))).toBe(true);
    expect(CAT_RESCUE_CHOICES[21][0].lines[0].body).toContain("什麼時候方便回來接");
    expect(CAT_RESCUE_CHOICES[21][0].lines[1].body).toContain("這幾天都不在家");
    expect(CAT_RESCUE_CHOICES[22].every((choice) => choice.lines[0].sender === "我" && /照顧牠幾天/.test(choice.lines[0].body))).toBe(true);
    expect(CAT_RESCUE_CHOICES[23]).toHaveLength(1);
    expect(CAT_RESCUE_CHOICES[23][0].nextStage).toBe(27);
    expect(CAT_RESCUE_CHOICES[23][0].lines.map((line) => line.body)).toEqual([
      "對了，聊了半天我還不知道牠叫什麼名字呢？這隻貓叫什麼呀？",
      "牠叫玩玩。",
    ]);
    expect(CAT_RESCUE_CHOICES[26]).toHaveLength(1);
    expect(CAT_RESCUE_CHOICES[26][0].lines.some((line) => /情況我再聯絡你/.test(line.body))).toBe(true);
    expect(CAT_RESCUE_CHOICES[27][0].lines.map((line) => line.body)).toEqual([
      "玩玩……？我靠！",
      "妳？？？怎麼啦？",
    ]);
    expect(CAT_RESCUE_CHOICES[32][0].lines.some((line) => line.body === "我靠我靠我靠，玩玩！！怪獸家的貓就叫玩玩！！！！" && line.thread === "西蓝花")).toBe(true);
    expect(CAT_RESCUE_CHOICES[32][0].lines.some((line) => line.sender === "西蓝花")).toBe(true);
    expect(CAT_RESCUE_CHOICES[33]).toHaveLength(2);
    expect(CAT_RESCUE_CHOICES[34][0].nextStage).toBe(35);
    expect(CAT_RESCUE_CHOICES[35][0].nextStage).toBe(24);
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
  });

  it("returns the correct stage after initial add and after re-adding a deleted friend", () => {
    expect(getCatRescueStageAfterFriendAdd(8, "monster-cat")).toBe(9);
    expect(getCatRescueStageAfterFriendAdd(13, "monster-prank")).toBe(16);
    expect(getCatRescueStageAfterFriendAdd(13, "monster-cat")).toBe(14);
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
