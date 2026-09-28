import { describe, expect, it } from "vitest";
import { getTapeTextSize } from "../src/utils/tapeText";

describe("tape text sizing", () => {
  it("shrinks continuously as the message gets longer", () => {
    expect(getTapeTextSize("x".repeat(24))).toBe("4.35cqw");
    expect(getTapeTextSize("x".repeat(60))).toBe("3.74cqw");
    expect(getTapeTextSize("x".repeat(100))).toBe("3.06cqw");
    expect(getTapeTextSize("x".repeat(140))).toBe("2.38cqw");
    expect(getTapeTextSize("x".repeat(180))).toBe("1.70cqw");
  });

  it("accounts for manual line breaks and enforces a readable minimum", () => {
    expect(getTapeTextSize("Eine\nNachricht\nmit\nZeilen")).toBe("3.11cqw");
    expect(getTapeTextSize(`${"x\n".repeat(89)}xx`)).toBe("1.65cqw");
  });

  it("scales wider font families without changing the length curve", () => {
    expect(getTapeTextSize("x".repeat(24), .7)).toBe("3.04cqw");
    expect(getTapeTextSize("x".repeat(180), .65)).toBe("1.10cqw");
  });
});
