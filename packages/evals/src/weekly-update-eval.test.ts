import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { evaluateWeeklyUpdate } from "./weekly-update-eval.js";

describe("weekly-update evals", () => {
  it("passes citation coverage and excluded-workbook blocking checks", async () => {
    const checks = await evaluateWeeklyUpdate(resolve("fixtures/weekly-update/input.json"));
    expect(checks).toHaveLength(2);
    expect(checks.every((check) => check.passed)).toBe(true);
  });
});
