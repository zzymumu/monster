import { describe, expect, it } from "vitest";
import {
  CAT_RESCUE_CHOICES,
  getCatRescueThreadForStage,
} from "./AppSkins";

describe("WeChat cat-rescue story configuration", () => {
  it("routes every hospital stage to Broccoli and owner stages to DaG", () => {
    for (const stage of [0, 1, 2, 3, 4, 5, 6, 7, 8, 10, 11, 30, 31]) {
      expect(getCatRescueThreadForStage(stage)).toBe("西蓝花");
    }
    for (const stage of [9, 13, 14, 16, 17, 20, 21, 22, 23, 24, 25, 26]) {
      expect(getCatRescueThreadForStage(stage)).toBe("大G");
    }
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

  it("requires the player to type the hospital arrival before check-in choices appear", () => {
    expect(CAT_RESCUE_CHOICES[30]).toEqual([]);
    expect(CAT_RESCUE_CHOICES[31]).toHaveLength(2);
    expect(CAT_RESCUE_CHOICES[31].every((choice) => choice.nextStage === 4)).toBe(true);
  });

  it("contains the complete delete, failed-send, re-add, apology sequence", () => {
    const prank = CAT_RESCUE_CHOICES[9].find((choice) => choice.id === "monster-prank");
    const apology = CAT_RESCUE_CHOICES[16].find((choice) => choice.id === "monster-apology-after-prank");
    expect(prank?.nextStage).toBe(17);
    expect(prank?.lines.map((line) => line.body)).toEqual([
      "我是你爸爸。",
      "妳是？",
      "……蛤？",
      "妳哪位？我不認識妳喔。",
      "好喔，那我先把妳刪掉了。掰。",
    ]);
    expect(apology?.nextStage).toBe(20);
    expect(apology?.lines.some((line) => /發錯人/.test(line.body))).toBe(true);
    expect(CAT_RESCUE_CHOICES[20]).toHaveLength(2);
    expect(CAT_RESCUE_CHOICES[21]).toHaveLength(2);
    expect(CAT_RESCUE_CHOICES[22]).toHaveLength(2);
    expect(CAT_RESCUE_CHOICES[23]).toHaveLength(2);
    expect(CAT_RESCUE_CHOICES[24]).toHaveLength(2);
    expect(CAT_RESCUE_CHOICES[25]).toHaveLength(2);
  });

  it("keeps the prank and apology branches in the owner's conversation", () => {
    for (const stage of [9, 16, 17, 20, 21, 22, 23, 24, 25]) {
      expect(getCatRescueThreadForStage(stage)).toBe("大G");
      for (const choice of CAT_RESCUE_CHOICES[stage] ?? []) {
        expect(choice.lines.every((line) => line.sender === "我" || line.sender === "大G")).toBe(true);
      }
    }
  });
});
