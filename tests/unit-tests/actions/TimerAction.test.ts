import { TimerAction, TimerContent } from "../../../src/actions/TimerAction";
import { Logger } from "../../../src/utils/Logger";

// Mock the Logger to suppress console output during tests
jest.spyOn(Logger, "log").mockImplementation(() => {});

describe("TimerAction", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.clearAllMocks(); // Clear mocks between tests
  });

  it("should wait for the specified duration", async () => {
    const timerAction = new TimerAction(new TimerContent(1000));
    const executePromise = timerAction.execute();

    jest.advanceTimersByTime(1000);

    await expect(executePromise).resolves.toBeUndefined();
    expect(Logger.log).toHaveBeenCalledWith("Waiting for 1000ms");
  });

  it("should correctly serialize and deserialize", () => {
    const timerAction = new TimerAction(new TimerContent(2000));
    const serialized = timerAction.serialize();
    expect(serialized).toEqual({
      type: "TimerAction",
      content: {
        duration: 2000,
      },
    });

    const deserialized = TimerAction.deserialize(serialized);
    expect(deserialized).toBeInstanceOf(TimerAction);
    expect(deserialized.serialize()).toEqual(serialized);
  });
});
