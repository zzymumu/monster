import { describe, expect, it } from "vitest";
import {
  CAT_RESCUE_CHOICES,
  getCatRescueStageAfterFriendAdd,
  getCatRescueThreadForStage,
  shouldAutoReturnToBroccoli,
  shouldCloseBroccoliAtStoryEnd,
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
    for (const stage of [0, 1, 2, 3, 4, 5, 6, 7, 8, 10, 11, 12, 30, 31, 32, 33, 34, 37, 38, 39, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 77, 78, 79]) {
      expect(getCatRescueThreadForStage(stage)).toBe("西蓝花");
    }
    for (const stage of [9, 13, 14, 16, 17, 20, 21, 22, 23, 24, 25, 26, 27, 35, 40, 53]) {
      expect(getCatRescueThreadForStage(stage)).toBe("大G");
    }
  });

  it("returns to the WeChat conversation list after the final Broccoli exchange", () => {
    expect(shouldCloseBroccoliAtStoryEnd(66, 0, "西蓝花")).toBe(false);
    expect(shouldCloseBroccoliAtStoryEnd(66, 1, "西蓝花")).toBe(false);
    expect(shouldCloseBroccoliAtStoryEnd(65, 0, "西蓝花")).toBe(false);
    expect(shouldCloseBroccoliAtStoryEnd(66, 0, "")).toBe(false);
    expect(CAT_RESCUE_CHOICES[79].every((choice) => choice.nextStage === 84)).toBe(true);
    expect(CAT_RESCUE_CHOICES[84]).toHaveLength(2);
    expect(CAT_RESCUE_CHOICES[84].every((choice) => choice.nextStage === 66)).toBe(true);
    expect(CAT_RESCUE_CHOICES[66]).toHaveLength(0);
  });

  it("keeps the Vava isolation objection and then takes the kitten to the clinic", () => {
    expect(CAT_RESCUE_CHOICES[0].every((choice) => choice.nextStage === 1)).toBe(true);
    expect(CAT_RESCUE_CHOICES[0].every((choice) => choice.lines[0].body.includes("帶") && !/隔離/.test(choice.lines[0].body))).toBe(true);
    expect(CAT_RESCUE_CHOICES[0].every((choice) => choice.lines[1].body.includes("Vava") && /傳染病/.test(choice.lines[1].body))).toBe(true);
    expect(CAT_RESCUE_CHOICES[1].some((choice) => /隔离|隔離/.test(choice.label))).toBe(true);
    expect(CAT_RESCUE_CHOICES[1].every((choice) => choice.nextStage === 2)).toBe(true);
    expect(CAT_RESCUE_CHOICES[2].every((choice) => choice.nextStage === 3)).toBe(true);
    expect(CAT_RESCUE_CHOICES[2].every((choice) => choice.lines.some((line) => /醫院|医院/.test(line.body)))).toBe(true);
    expect(CAT_RESCUE_CHOICES[0].every((choice) => choice.nextStage === 1)).toBe(true);
    expect(CAT_RESCUE_CHOICES[1].every((choice) => choice.nextStage === 2)).toBe(true);
    expect(CAT_RESCUE_CHOICES[2].every((choice) => choice.nextStage === 3)).toBe(true);
    for (const obsoleteStage of [67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 80, 81]) {
      expect(CAT_RESCUE_CHOICES[obsoleteStage]).toBeUndefined();
    }
  });

  it("separates the name surprise from the nameplate explanation", () => {
    expect(CAT_RESCUE_CHOICES[63][1].lines.some((line) => /吃(?:什麼|什么)/.test(line.body))).toBe(true);
    expect(CAT_RESCUE_CHOICES[78][0].lines[0].body).toContain("我哪知道啦");
  });

  it("does not force the terminal Broccoli conversation open after the user exits", () => {
    expect(shouldAutoReturnToBroccoli(65, 0, "")).toBe(true);
    expect(shouldAutoReturnToBroccoli(66, 0, "")).toBe(false);
    expect(shouldAutoReturnToBroccoli(66, 0, "大G")).toBe(false);
    expect(shouldAutoReturnToBroccoli(65, 1, "")).toBe(false);
    expect(shouldAutoReturnToBroccoli(66, 0, "西蓝花")).toBe(false);
  });

  it("keeps the remaining rescue choices in the Broccoli thread without a return-home branch", () => {
    expect(getCatRescueThreadForStage(10)).toBe("西蓝花");
    expect(getCatRescueThreadForStage(11)).toBe("西蓝花");
    expect(CAT_RESCUE_CHOICES[10]).toHaveLength(2);
    expect(CAT_RESCUE_CHOICES[11]).toHaveLength(2);
    expect(CAT_RESCUE_CHOICES[10].every((choice) => choice.nextStage === 0)).toBe(true);
    expect(CAT_RESCUE_CHOICES[11].every((choice) => choice.nextStage === 5)).toBe(true);
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

  it("offers player-controlled replies at every active story turn", () => {
    const systemOrTerminalStages = new Set([8, 13, 57, 66]);
    const intentionalSingleChoiceStages = new Set([25, 58, 82, 86, 87, 90]);
    for (const [stage, choices] of Object.entries(CAT_RESCUE_CHOICES)) {
      if (systemOrTerminalStages.has(Number(stage))) continue;
      const expectedCount = intentionalSingleChoiceStages.has(Number(stage)) ? 1 : 2;
      expect(choices, `stage ${stage} must have ${expectedCount} choices`).toHaveLength(expectedCount);
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
    const dinnerPromise = CAT_RESCUE_CHOICES[25].find((choice) => choice.id === "tease-owner");
    expect(dinnerPromise?.nextStage).toBe(58);
    expect(CAT_RESCUE_CHOICES[25]).toHaveLength(1);
    expect(dinnerPromise?.lines).toHaveLength(8);
    expect(dinnerPromise?.lines[0].body).toContain("请我吃饭");
    expect(dinnerPromise?.lines[1].body).toContain("請妳吃飯");
    expect(dinnerPromise?.lines.map((line) => line.body).join("\n")).toContain("開玩笑");
    expect(dinnerPromise?.lines.map((line) => line.body).join("\n")).toContain("飯量很大");
    expect(dinnerPromise?.lines.map((line) => line.body).join("\n")).toContain("等你回來再說");
    expect(CAT_RESCUE_CHOICES[58]).toHaveLength(1);
    expect(CAT_RESCUE_CHOICES[58][0].label).toBe("说好了，不许赖账！");
    expect(CAT_RESCUE_CHOICES[58][0].lines[0].body).toBe("說好了，不許賴帳！");
    expect(CAT_RESCUE_CHOICES[58][0].lines[1].body).toContain("答應妳的事");
    expect(CAT_RESCUE_CHOICES[58][0].lines[2].body).toContain("整理給妳");
    expect(CAT_RESCUE_CHOICES[58][0].lines[3].body).toContain("玩玩照顧小指南");
    expect(CAT_RESCUE_CHOICES[58].every((choice) => choice.nextStage === 59)).toBe(true);
    expect(CAT_RESCUE_CHOICES[61].every((choice) =>
      choice.lines.slice(1).some((line) => /沒辦法馬上回覆|回覆得比較慢/.test(line.body))
    )).toBe(true);
    expect(CAT_RESCUE_CHOICES[82]).toHaveLength(1);
    expect(CAT_RESCUE_CHOICES[82][0].label).toContain("好的，掰掰");
    expect(CAT_RESCUE_CHOICES[82][0].lines).toHaveLength(1);
    expect(CAT_RESCUE_CHOICES[82][0].lines[0].sender).toBe("我");
    expect(CAT_RESCUE_CHOICES[82][0].lines[0].body).toContain("看玩玩吃飯了沒有");
    expect(CAT_RESCUE_CHOICES[82][0].nextStage).toBe(63);
    expect(CAT_RESCUE_CHOICES[63][0].lines[0].body).toBe("你敢信！！他要請我吃飯！！！！");
    expect(CAT_RESCUE_CHOICES[63][0].nextStage).toBe(64);
    expect(CAT_RESCUE_CHOICES[64][0].nextStage).toBe(65);
    expect(CAT_RESCUE_CHOICES[65][0].nextStage).toBe(77);
    expect(CAT_RESCUE_CHOICES[77][0].nextStage).toBe(78);
    expect(CAT_RESCUE_CHOICES[78][0].nextStage).toBe(79);
    expect(CAT_RESCUE_CHOICES[79][0].nextStage).toBe(84);
    expect(CAT_RESCUE_CHOICES[84].every((choice) => choice.nextStage === 66)).toBe(true);
    for (const obsoleteStage of [86,87,88,89,90,91]) {
      expect(CAT_RESCUE_CHOICES[obsoleteStage]).toBeUndefined();
    }
    expect(CAT_RESCUE_CHOICES[83]).toBeUndefined();
    expect(CAT_RESCUE_CHOICES[85]).toBeUndefined();
    for (const [stage, next, count] of [[25,58,1],[56,61,2],[58,59,1],[59,60,2],[60,61,2],[61,82,2],[82,63,1],[62,63,2],[63,64,2],[64,65,2],[65,77,2],[77,78,2],[78,79,2],[79,84,2],[84,66,2]] as const) {
      expect(CAT_RESCUE_CHOICES[stage]).toHaveLength(count);
      expect(CAT_RESCUE_CHOICES[stage].every((choice) => choice.nextStage === next)).toBe(true);
    }
    expect(CAT_RESCUE_CHOICES[62]).toHaveLength(2);
    expect(CAT_RESCUE_CHOICES[62][0].nextStage).toBe(63);
    expect(CAT_RESCUE_CHOICES[62].every((choice) =>
      choice.lines.every((line) => !/西藍花|西蓝花/.test(line.body))
    )).toBe(true);
    expect(CAT_RESCUE_CHOICES[62].every((choice) =>
      choice.lines.every((line) => line.thread === "大G")
    )).toBe(true);
    expect(CAT_RESCUE_CHOICES[62][0].lines[1].sender).toBe("大G");
    expect(getCatRescueThreadForStage(62)).toBe("大G");
    expect(getCatRescueThreadForStage(63)).toBe("西蓝花");
    expect(CAT_RESCUE_CHOICES[63][0].lines[0].body).toBe("你敢信！！他要請我吃飯！！！！");
    expect(CAT_RESCUE_CHOICES[63][0].lines[0].sender).toBe("我");
    expect(CAT_RESCUE_CHOICES[63][0].lines[1].sender).toBe("西蓝花");
    expect(CAT_RESCUE_CHOICES[63][0].lines[1].body).toContain("真的假的");
    expect(CAT_RESCUE_CHOICES[63][0].lines[1].body).toContain("你們吃什麼");
    expect(CAT_RESCUE_CHOICES[64][0].lines[0].body).toContain("我哪知道啊");
    expect(CAT_RESCUE_CHOICES[64][0].lines[0].body).toContain("根本没想到要问");
    expect(CAT_RESCUE_CHOICES[65][0].lines.filter((line) => line.sender === "西蓝花")).toHaveLength(2);
    expect(CAT_RESCUE_CHOICES[63][0].lines[1].body).toContain("你們吃什麼");
    expect(CAT_RESCUE_CHOICES[64][0].lines[0].body).toContain("我哪知道啊");
    expect(CAT_RESCUE_CHOICES[64][0].lines[0].body).toMatch(/根本(?:沒想到要問|没想到要问)/);
    expect(CAT_RESCUE_CHOICES[65][0].lines.filter((line) => line.sender === "西蓝花")).toHaveLength(2);
    expect(CAT_RESCUE_CHOICES[65][0].nextStage).toBe(77);
    expect(CAT_RESCUE_CHOICES[63][0].lines.every((line) => line.thread === "西蓝花")).toBe(true);
    // Language/script style is intentionally not a release-blocking condition.
    expect(getCatRescueThreadForStage(63)).toBe("西蓝花");
    expect(getCatRescueThreadForStage(59)).toBe("大G");
    expect(CAT_RESCUE_CHOICES[66]).toHaveLength(0);
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
    expect(CAT_RESCUE_CHOICES[26].every((choice) => choice.nextStage === 36)).toBe(true);
    expect(CAT_RESCUE_CHOICES[36]).toHaveLength(2);
    expect(CAT_RESCUE_CHOICES[36].every((choice) => choice.nextStage === 54)).toBe(true);
    expect(CAT_RESCUE_CHOICES[36][0].lines[2].body).toContain("玩玩照顧小指南");
    expect(CAT_RESCUE_CHOICES[54]).toHaveLength(2);
    expect(CAT_RESCUE_CHOICES[54].every((choice) => choice.nextStage === 55)).toBe(true);
    expect(CAT_RESCUE_CHOICES[55]).toHaveLength(2);
    expect(CAT_RESCUE_CHOICES[55].every((choice) => choice.nextStage === 56)).toBe(true);
    expect(CAT_RESCUE_CHOICES[56]).toHaveLength(2);
    expect(CAT_RESCUE_CHOICES[56].every((choice) => choice.nextStage === 61)).toBe(true);
    expect(CAT_RESCUE_CHOICES[57]).toHaveLength(0);
    expect(CAT_RESCUE_CHOICES[27][0].lines.map((line) => line.body)).toEqual([
      "玩玩……？我靠！",
      "妳？？？怎麼啦？",
    ]);
    expect(CAT_RESCUE_CHOICES[27][0].nextStage).toBe(53);
    expect(CAT_RESCUE_CHOICES[53]).toHaveLength(2);
    expect(CAT_RESCUE_CHOICES[53][0].lines[0].body).toContain("名字太好了");
    expect(CAT_RESCUE_CHOICES[53][0].lines[2].body).toContain("找牠找了半天");
    expect(CAT_RESCUE_CHOICES[53][0].lines[2].thread).toBe("大G");
    expect(CAT_RESCUE_CHOICES[53][1].lines[2].body).toContain("怎麼找都找不到");
    expect(CAT_RESCUE_CHOICES[53][1].lines[2].thread).toBe("大G");
    expect(CAT_RESCUE_CHOICES[53].every((choice) => choice.nextStage === 32)).toBe(true);
    expect(getCatRescueThreadForStage(32)).toBe("西蓝花");
    expect(getCatRescueThreadForStage(53)).toBe("大G");
    expect(CAT_RESCUE_CHOICES[53][0].nextStage).toBe(32);
    expect(CAT_RESCUE_CHOICES[38][0].id).toBe("notice-traditional-typing");
    expect(CAT_RESCUE_CHOICES[38][0].lines[1].body).toContain("五月天的怪獸本人");
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
    expect(CAT_RESCUE_CHOICES[32][0].lines[0].body).toContain("我靠我靠");
    expect(CAT_RESCUE_CHOICES[32][0].lines[1].body).toContain("跟怪獸家那隻貓同一個名字");
    expect(CAT_RESCUE_CHOICES[32][1].lines[1].body).toContain("溫尚翊又是怪獸本名");
    expect(CAT_RESCUE_CHOICES[33]).toHaveLength(2);
    expect(CAT_RESCUE_CHOICES[33][0].lines.map((line) => line.sender)).toEqual(["我", "西蓝花"]);
    expect(CAT_RESCUE_CHOICES[33][0].lines[0].body).toContain("可能只是重名");
    expect(CAT_RESCUE_CHOICES[33][0].lines[1].body).toContain("主人名字跟寵物名字都重合");
    expect(CAT_RESCUE_CHOICES[33][0].nextStage).toBe(37);
    expect(CAT_RESCUE_CHOICES[37]).toHaveLength(2);
    expect(CAT_RESCUE_CHOICES[37][0].lines[1].body).toContain("不知道該怎麼吐槽妳");
    expect(CAT_RESCUE_CHOICES[37].every((choice) => choice.nextStage === 38)).toBe(true);
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
  it("ends DaG's conversation with the user's single goodbye reply", () => {
    expect(CAT_RESCUE_CHOICES[61].every((choice) =>
      choice.lines.slice(1).some((line) => /沒辦法馬上回覆|回覆得比較慢/.test(line.body))
    )).toBe(true);
    expect(CAT_RESCUE_CHOICES[82]).toHaveLength(1);
    expect(CAT_RESCUE_CHOICES[82][0].label).toContain("好的，掰掰");
    expect(CAT_RESCUE_CHOICES[82][0].lines).toHaveLength(1);
    expect(CAT_RESCUE_CHOICES[82][0].lines[0].sender).toBe("我");
    expect(CAT_RESCUE_CHOICES[82][0].lines[0].body).toContain("看玩玩吃飯了沒有");
    expect(CAT_RESCUE_CHOICES[82][0].nextStage).toBe(63);
    for (const obsoleteStage of [86, 87, 88, 89, 90, 91]) {
      expect(CAT_RESCUE_CHOICES[obsoleteStage]).toBeUndefined();
    }
  });

});
