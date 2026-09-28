import { describe, expect, it } from "vitest";
import { buildPageTheme } from "../src/utils/pageTheme";

describe("page theme", () => {
  it("uses dark text and the original logo on light backgrounds", () => {
    expect(buildPageTheme("#f5e9dc")).toMatchObject({
      color: "#f5e9dc",
      ink: "#20231f",
      brandFilter: "none",
      usesLightInk: false,
    });
  });

  it("uses light text and an inverted logo on dark backgrounds", () => {
    expect(buildPageTheme("#18233a")).toMatchObject({
      color: "#18233a",
      ink: "#fffaf0",
      brandFilter: "invert(1)",
      usesLightInk: true,
    });
  });
});
