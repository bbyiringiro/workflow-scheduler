import { validateEvent } from "../../../src/services/eventValidator";

describe("validateEvent", () => {
  it("should return null for valid inputs", () => {
    const result = validateEvent("eventName", "user@example.com");
    expect(result).toBeNull();
  });

  it("should return error message for invalid eventName", () => {
    const result = validateEvent("", "user@example.com");
    expect(result).toBe("Invalid or missing eventName");
  });

  it("should return error message for invalid userEmail", () => {
    const result = validateEvent("eventName", "invalid-email");
    expect(result).toBe("Invalid or missing userEmail");
  });
});
