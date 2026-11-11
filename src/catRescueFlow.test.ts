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
    for (const stage of [0, 1, 2, 3, 4, 5, 6, 7, 8, 10, 11, 12, 30, 31, 32, 33, 34, 37, 38, 39, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 77, 78, 79, 90, 91, 92, 93, 94, 95, 96]) {
      expect(getCatRescueThreadForStage(stage)).toBe("西蓝花");
    }
    for (const stage of [9, 13, 14, 16, 17, 18, 20, 21, 22, 23, 24, 25, 26, 27, 35, 40, 53, 85, 86, 87]) {
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

  it("keeps the rewritten opening, Vava isolation objection, and clinic route", () => {
    expect(CAT_RESCUE_CHOICES[0]).toHaveLength(1);
    expect(CAT_RESCUE_CHOICES[0][0].nextStage).toBe(1);
    expect(CAT_RESCUE_CHOICES[0][0].lines.map((line) => line.body)).toContain("结果它居然主动跑过来蹭我的腿！！");
    expect(CAT_RESCUE_CHOICES[0][0].lines[0]).toMatchObject({ sender: "西蓝花", body: "你在哪里碰到的？" });
    expect(CAT_RESCUE_CHOICES[1][0].nextStage).toBe(2);
    expect(CAT_RESCUE_CHOICES[1][0].lines.some((line) => line.body === "hold on hold on🤺")).toBe(true);
    expect(CAT_RESCUE_CHOICES[1][0].lines.some((line) => /Vava/.test(line.body))).toBe(true);
    expect(CAT_RESCUE_CHOICES[1][0].lines.some((line) => /传染病/.test(line.body))).toBe(true);
    expect(CAT_RESCUE_CHOICES[2][0].nextStage).toBe(3);
    expect(CAT_RESCUE_CHOICES[2][0].lines.some((line) => line.body.includes("不是简单关个门就好的事情"))).toBe(true);
    expect(CAT_RESCUE_CHOICES[3][0].nextStage).toBe(34);
    expect(CAT_RESCUE_CHOICES[3][0].lines.some((line) => line.body === "要不然先带它去医院检查一下？")).toBe(true);
    expect(CAT_RESCUE_CHOICES[34][0].nextStage).toBe(12);
    expect(CAT_RESCUE_CHOICES[34][0].lines.map((line) => line.body)).toContain("知道啦！");
    expect(CAT_RESCUE_CHOICES[3][0].lines.some((line) => /带它去医院/.test(line.body))).toBe(true);
    expect(CAT_RESCUE_CHOICES[12][0].nextStage).toBe(30);
    expect(CAT_RESCUE_CHOICES[30][0].nextStage).toBe(31);
    expect(CAT_RESCUE_CHOICES[31][0].nextStage).toBe(4);
    expect(CAT_RESCUE_CHOICES[4][0].nextStage).toBe(8);
    for (const obsoleteStage of [67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 80, 81]) {
      expect(CAT_RESCUE_CHOICES[obsoleteStage]).toBeUndefined();
    }
  });

  it("starts the Broccoli dinner reveal by asking why he offered to pay", () => {
    expect(CAT_RESCUE_CHOICES[63][0].lines[1].body).toContain("怎麼會突然說要請妳吃飯");
    expect(CAT_RESCUE_CHOICES[63][1].lines[1].body).toContain("怎麼會突然說要請妳吃飯");
    expect(CAT_RESCUE_CHOICES[64][0].lines[0].body).toContain("隨口一說");
    expect(CAT_RESCUE_CHOICES[64][0].lines[1].body).toContain("瘋了瘋了瘋了");
  });

  it("does not force the terminal Broccoli conversation open after the user exits", () => {
    expect(shouldAutoReturnToBroccoli(65, 0, "")).toBe(true);
    expect(shouldAutoReturnToBroccoli(66, 0, "")).toBe(false);
    expect(shouldAutoReturnToBroccoli(66, 0, "大G")).toBe(false);
    expect(shouldAutoReturnToBroccoli(65, 1, "")).toBe(false);
    expect(shouldAutoReturnToBroccoli(66, 0, "西蓝花")).toBe(false);
    // The autograph and return-date stages are Broccoli dialogue. When the
    // branch is reached from DaG, switch contacts after queued replies drain.
    for (const stage of [88, 89, 90, 91, 92, 93, 94, 95, 96]) {
      expect(shouldAutoReturnToBroccoli(stage, 0, "大G")).toBe(true);
      expect(shouldAutoReturnToBroccoli(stage, 0, "西蓝花")).toBe(false);
      expect(shouldAutoReturnToBroccoli(stage, 1, "大G")).toBe(false);
    }
  });

  it("keeps the remaining rescue choices in the Broccoli thread without a return-home branch", () => {
    for (const stage of [88, 89, 90, 91, 92, 93, 94, 95, 96]) {
      expect(getCatRescueThreadForStage(stage)).toBe("西蓝花");
    }
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
    const intentionalSingleChoiceStages = new Set([0, 1, 2, 3, 4, 5, 12, 30, 31, 34, 25, 82, 85, 86, 87]);
    for (const [stage, choices] of Object.entries(CAT_RESCUE_CHOICES)) {
      if (systemOrTerminalStages.has(Number(stage))) continue;
      const expectedCount = intentionalSingleChoiceStages.has(Number(stage)) ? 1 : 2;
      expect(choices, `stage ${stage} must have ${expectedCount} choices`).toHaveLength(expectedCount);
    }
  });

  it("keeps the single-choice carrier and hospital arrival flow", () => {
    expect(CAT_RESCUE_CHOICES[12]).toHaveLength(1);
    expect(CAT_RESCUE_CHOICES[12].every((choice) => choice.nextStage === 30)).toBe(true);
    expect(CAT_RESCUE_CHOICES[30]).toHaveLength(1);
    expect(CAT_RESCUE_CHOICES[30][0].lines.some((line) => line.body.includes("玩玩"))).toBe(false);
    expect(CAT_RESCUE_CHOICES[30].every((choice) => choice.nextStage === 31)).toBe(true);
    expect(CAT_RESCUE_CHOICES[31]).toHaveLength(1);
    expect(CAT_RESCUE_CHOICES[31].every((choice) => choice.nextStage === 4)).toBe(true);
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
    expect(CAT_RESCUE_CHOICES[16].every((choice) => choice.nextStage === 18)).toBe(true);
    const shortApology = CAT_RESCUE_CHOICES[16].find((choice) => choice.id === "monster-apology-after-prank");
    expect(shortApology?.nextStage).toBe(18);
    expect(shortApology?.lines.map((line) => line.sender)).toEqual(["我", "大G", "大G"]);
    expect(shortApology?.lines[1].body).toBe("我說呢，怎麼有人一上來就說奇奇怪怪的話，原來是這樣喔……");
    expect(shortApology?.lines[2].body).toBe("所以妳找我有事嗎？");
    expect(apology?.nextStage).toBe(18);
    expect(apology?.lines.map((line) => line.sender)).toEqual(["我", "大G", "大G"]);
    expect(apology?.lines.some((line) => /小黑貓|撿到你的貓/.test(line.body))).toBe(false);
    expect(CAT_RESCUE_CHOICES[18]).toHaveLength(2);
    expect(CAT_RESCUE_CHOICES[18].every((choice) => choice.nextStage === 20)).toBe(true);
    expect(CAT_RESCUE_CHOICES[18].every((choice) => choice.lines[0].sender === "我" && choice.lines[1].sender === "大G")).toBe(true);
    expect(CAT_RESCUE_CHOICES[18][0].lines[0].body).toContain("撿到你的貓");
    expect(CAT_RESCUE_CHOICES[18][0].lines[1].body).toContain("夭壽");
    expect(CAT_RESCUE_CHOICES[20]).toHaveLength(2);
    expect(CAT_RESCUE_CHOICES[21]).toHaveLength(2);
    expect(CAT_RESCUE_CHOICES[22]).toHaveLength(2);
    expect(CAT_RESCUE_CHOICES[23]).toHaveLength(2);
    expect(CAT_RESCUE_CHOICES[24]).toHaveLength(2);
    expect(CAT_RESCUE_CHOICES[25]).toHaveLength(1);
    const dinnerPromise = CAT_RESCUE_CHOICES[25].find((choice) => choice.id === "tease-owner");
    expect(dinnerPromise?.nextStage).toBe(85);
    expect(CAT_RESCUE_CHOICES[25]).toHaveLength(1);
    expect(dinnerPromise?.lines.map((line) => line.sender)).toEqual(["我", "大G"]);
    expect(dinnerPromise?.lines[0].body).toContain("請我吃飯");
    expect(dinnerPromise?.lines[1].body).toContain("請妳吃飯");
    expect(CAT_RESCUE_CHOICES[85]).toHaveLength(1);
    expect(CAT_RESCUE_CHOICES[85][0].nextStage).toBe(86);
    expect(CAT_RESCUE_CHOICES[85][0].lines.map((line) => line.sender)).toEqual(["我", "大G"]);
    expect(CAT_RESCUE_CHOICES[85][0].lines[0].body).toContain("開玩笑");
    expect(CAT_RESCUE_CHOICES[85][0].lines[1].body).toContain("不麻煩");
    expect(CAT_RESCUE_CHOICES[86]).toHaveLength(1);
    expect(CAT_RESCUE_CHOICES[86][0].nextStage).toBe(87);
    expect(CAT_RESCUE_CHOICES[86][0].lines[0].body).toContain("飯量很大");
    expect(CAT_RESCUE_CHOICES[86][0].lines[1].body).toContain("吃得多才好");
    expect(CAT_RESCUE_CHOICES[87]).toHaveLength(1);
    expect(CAT_RESCUE_CHOICES[87][0].nextStage).toBe(59);
    expect(CAT_RESCUE_CHOICES[87][0].lines[0].body).toContain("等你回來再說");
    expect(CAT_RESCUE_CHOICES[87][0].lines[1].body).toContain("就這麼說定");
    expect(CAT_RESCUE_CHOICES[87][0].lines[2].body).toContain("照顧方式整理");
    expect(CAT_RESCUE_CHOICES[87][0].lines[3].body).toContain("玩玩照顧小指南");
    
    
    expect(CAT_RESCUE_CHOICES[58]).toBeUndefined();
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
    expect(CAT_RESCUE_CHOICES[64][0].nextStage).toBe(88);
    expect(CAT_RESCUE_CHOICES[88][0].nextStage).toBe(89);
    expect(CAT_RESCUE_CHOICES[89][0].nextStage).toBe(94);
    expect(CAT_RESCUE_CHOICES[94][0].nextStage).toBe(95);
    expect(CAT_RESCUE_CHOICES[95][0].nextStage).toBe(96);
    expect(CAT_RESCUE_CHOICES[96][0].nextStage).toBe(90);
    expect(CAT_RESCUE_CHOICES[90][0].nextStage).toBe(91);
    expect(CAT_RESCUE_CHOICES[91][0].nextStage).toBe(65);
    expect(CAT_RESCUE_CHOICES[89][0].lines.some((line) => line.body.includes("幫我找簽名") && line.body.includes("姐妹發達了"))).toBe(true);
    expect(CAT_RESCUE_CHOICES[95][0].lines.some((line) => line.body.includes("見面吃飯"))).toBe(true);
    expect(CAT_RESCUE_CHOICES[91][0].lines.some((line) => line.body.includes("好像在北京"))).toBe(true);
    expect(CAT_RESCUE_CHOICES[91][0].lines.some((line) => line.body.includes("最晚就下週"))).toBe(true);
    expect(CAT_RESCUE_CHOICES[65][0].nextStage).toBe(79);
    expect(CAT_RESCUE_CHOICES[65][0].lines.filter((line) => line.sender === "西蓝花")).toHaveLength(2);
    expect(CAT_RESCUE_CHOICES[65][1].lines.filter((line) => line.sender === "西蓝花")).toHaveLength(2);
    expect(CAT_RESCUE_CHOICES[77][0].nextStage).toBe(78);
    expect(CAT_RESCUE_CHOICES[78][0].nextStage).toBe(79);
    expect(CAT_RESCUE_CHOICES[79][0].nextStage).toBe(84);
    expect(CAT_RESCUE_CHOICES[84].every((choice) => choice.nextStage === 66)).toBe(true);
    expect(CAT_RESCUE_CHOICES[83]).toBeUndefined();
    
    for (const [stage, next, count] of [[25,85,1],[85,86,1],[86,87,1],[87,59,1],[56,61,2],[59,60,2],[60,61,2],[61,82,2],[82,63,1],[62,63,2],[63,64,2],[64,88,2],[88,89,2],[89,94,2],[94,95,2],[95,96,2],[96,90,2],[90,91,2],[91,65,2],[65,79,2],[77,78,2],[78,79,2],[79,84,2],[84,66,2]] as const) {
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
    for (const stage of [64, 88, 89, 90, 91]) expect(getCatRescueThreadForStage(stage)).toBe("西蓝花");
    expect(CAT_RESCUE_CHOICES[63][0].lines[0].body).toBe("你敢信！！他要請我吃飯！！！！");
    expect(CAT_RESCUE_CHOICES[63][0].lines[0].sender).toBe("我");
    expect(CAT_RESCUE_CHOICES[63][0].lines[1].sender).toBe("西蓝花");
    expect(CAT_RESCUE_CHOICES[63][0].lines[1].body).toContain("怎麼會突然");
    expect(CAT_RESCUE_CHOICES[63][0].lines[1].body).toContain("怎麼會突然");
    expect(CAT_RESCUE_CHOICES[65][0].lines.filter((line) => line.sender === "西蓝花")).toHaveLength(2);
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
    expect(CAT_RESCUE_CHOICES[64]).toHaveLength(2);
    expect(CAT_RESCUE_CHOICES[64]).toHaveLength(2);
    expect(CAT_RESCUE_CHOICES[64][0].lines[0].body).toContain("隨口一說");
    expect(CAT_RESCUE_CHOICES[64][0].lines[1].body).toContain("瘋了瘋了瘋了");
    expect(CAT_RESCUE_CHOICES[88][0].lines[0].body).toContain("穿什麼");
    // The autograph conversation now sits between the outfit discussion and
    // the original return-date question; keep every branch in that sequence.
    expect(CAT_RESCUE_CHOICES[89]).toHaveLength(2);
    expect(CAT_RESCUE_CHOICES[89].every((choice) => choice.nextStage === 94)).toBe(true);
    expect(CAT_RESCUE_CHOICES[89][0].lines[1].body).toContain("找簽名");
    expect(CAT_RESCUE_CHOICES[89][1].lines[1].body).toContain("簽名");
    expect(CAT_RESCUE_CHOICES[94]).toHaveLength(2);
    expect(CAT_RESCUE_CHOICES[94].every((choice) => choice.nextStage === 95)).toBe(true);
    expect(CAT_RESCUE_CHOICES[94].some((choice) => choice.lines.some((line) => line.body.includes("簽名")))).toBe(true);
    expect(CAT_RESCUE_CHOICES[95]).toHaveLength(2);
    expect(CAT_RESCUE_CHOICES[95].every((choice) => choice.nextStage === 96)).toBe(true);
    expect(CAT_RESCUE_CHOICES[95].some((choice) => choice.lines.some((line) => line.body.includes("見面吃飯")))).toBe(true);
    expect(CAT_RESCUE_CHOICES[96]).toHaveLength(2);
    expect(CAT_RESCUE_CHOICES[96].every((choice) => choice.nextStage === 90)).toBe(true);
    expect(CAT_RESCUE_CHOICES[96].some((choice) => choice.lines.some((line) => line.body.includes("什麼時候回來")))).toBe(true);
    expect(CAT_RESCUE_CHOICES[90][0].lines[0].body).toContain("忘了問");
    expect(CAT_RESCUE_CHOICES[90][0].lines[1].body).toContain("重要的事情");
    expect(CAT_RESCUE_CHOICES[91][0].lines[0].body).toContain("太激動");
    expect(CAT_RESCUE_CHOICES[91][0].lines[1].body).toContain("北京");
    expect(CAT_RESCUE_CHOICES[65]).toHaveLength(2);
    expect(CAT_RESCUE_CHOICES[65][0].lines[0].body).toContain("哦哦，先不想啦");
    expect(CAT_RESCUE_CHOICES[65].every((choice) => choice.nextStage === 79)).toBe(true);
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

  it("removes orphaned pre-choice prank replies and keeps one canonical reaction sequence", () => {
    const orphaned = [
      makeItem({ id: "old-huh", title: "大G", sender: "温尚翊", body: "……蛤？", time: "2026-11-02 20:58" }),
      makeItem({ id: "old-who", title: "大G", sender: "温尚翊", body: "妳哪位？我不認識妳喔。", time: "2026-11-02 20:59" }),
      makeItem({ id: "old-delete", title: "大G", sender: "温尚翊", body: "好喔，那我先把妳刪掉了。掰。", time: "2026-11-02 20:59" }),
    ];
    const addedNotice = makeItem({
      id: "added-notice",
      title: "大G",
      sender: "我",
      body: "你已添加了大G，现在可以开始聊天了。",
      time: "2026-11-02 21:00",
      outgoing: true,
      kind: "event",
    });
    const firstGreeting = makeItem({ id: "greeting-1", title: "大G", sender: "大G", body: "妳是？", time: "2026-11-02 21:01" });
    const prank = makeItem({ id: "prank-1", title: "大G", sender: "我", body: "我是你爸爸。", time: "2026-11-02 21:02", outgoing: true });
    const reaction = [
      makeItem({ id: "new-huh", title: "大G", sender: "大G", body: "……蛤？", time: "2026-11-02 21:03" }),
      makeItem({ id: "new-who", title: "大G", sender: "大G", body: "妳哪位？我不認識妳喔。", time: "2026-11-02 21:04" }),
      makeItem({ id: "new-delete", title: "大G", sender: "大G", body: "好喔，那我先把妳刪掉了。掰。", time: "2026-11-02 21:05" }),
      makeItem({ id: "duplicate-alias", title: "大G", sender: "温尚翊", body: "妳哪位？我不認識妳喔。", time: "2026-11-02 21:06" }),
    ];
    const ordered = orderCatRescueThreadItems([...orphaned, addedNotice, firstGreeting, prank, ...reaction]);
    const clean = filterPrankHistoryLines(ordered, true);
    expect(clean.map((item) => item.body)).toEqual([
      "你已添加了大G，现在可以开始聊天了。",
      "妳是？",
      "我是你爸爸。",
      "……蛤？",
      "妳哪位？我不認識妳喔。",
      "好喔，那我先把妳刪掉了。掰。",
    ]);
  });

  it("keeps the prank and apology branches in the owner's conversation", () => {
    for (const stage of [9, 16, 17, 18, 20, 21, 22, 23, 24, 25, 26, 27, 35]) {
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
  });

});
