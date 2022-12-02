import {
  secondsToString as t,
  getTimeLeft,
  TimeFormatOptions,
  ONE_DAY,
  ONE_HR,
  ONE_MIN,
  ONE_SEC,
} from "./time";

describe("time", () => {
  describe("secondsToString", () => {
    it("should return correct string, short length, normal unit format, not removing trailing zeros", () => {
      const options: TimeFormatOptions = {
        length: "short",
        isShortFormat: false,
        removeTrailingZeros: false,
      };
      expect(
        t(-(3 * ONE_DAY + 0 * ONE_HR + 6 * ONE_MIN + 9 * ONE_SEC), options)
      ).toBe("-3days");
      expect(
        t(-(0 * ONE_DAY + 2 * ONE_HR + 0 * ONE_MIN + 4 * ONE_SEC), options)
      ).toBe("-2hrs");
      expect(
        t(-(0 * ONE_DAY + 0 * ONE_HR + 5 * ONE_MIN + 8 * ONE_SEC), options)
      ).toBe("-5mins");
      expect(
        t(-(0 * ONE_DAY + 0 * ONE_HR + 0 * ONE_MIN + 59 * ONE_SEC), options)
      ).toBe("-59secs");
      expect(
        t(-(0 * ONE_DAY + 0 * ONE_HR + 0 * ONE_MIN + 2.1 * ONE_SEC), options)
      ).toBe("-2secs");
      expect(
        t(-(0 * ONE_DAY + 0 * ONE_HR + 0 * ONE_MIN + 1 * ONE_SEC), options)
      ).toBe("-1secs");
      expect(
        t(0 * ONE_DAY + 0 * ONE_HR + 0 * ONE_MIN + 0 * ONE_SEC, options)
      ).toBe("0secs");
      expect(
        t(0 * ONE_DAY + 0 * ONE_HR + 0 * ONE_MIN + 1 * ONE_SEC, options)
      ).toBe("1sec");
      expect(
        t(0 * ONE_DAY + 0 * ONE_HR + 0 * ONE_MIN + 2 * ONE_SEC, options)
      ).toBe("2secs");
      expect(
        t(0 * ONE_DAY + 0 * ONE_HR + 1 * ONE_MIN + 0 * ONE_SEC, options)
      ).toBe("1min");
      expect(
        t(0 * ONE_DAY + 0 * ONE_HR + 1 * ONE_MIN + 30 * ONE_SEC, options)
      ).toBe("1min");
      expect(
        t(0 * ONE_DAY + 0 * ONE_HR + 1 * ONE_MIN + 59.99 * ONE_SEC, options)
      ).toBe("1min");
      expect(
        t(0 * ONE_DAY + 0 * ONE_HR + 2 * ONE_MIN + 0 * ONE_SEC, options)
      ).toBe("2mins");
      expect(
        t(0 * ONE_DAY + 0 * ONE_HR + 59 * ONE_MIN + 59 * ONE_SEC, options)
      ).toBe("59mins");
      expect(
        t(0 * ONE_DAY + 1 * ONE_HR + 0 * ONE_MIN + 0 * ONE_SEC, options)
      ).toBe("1hr");
      expect(
        t(0 * ONE_DAY + 1 * ONE_HR + 0 * ONE_MIN + 42 * ONE_SEC, options)
      ).toBe("1hr");
      expect(
        t(0 * ONE_DAY + 2 * ONE_HR + 0 * ONE_MIN + 0 * ONE_SEC, options)
      ).toBe("2hrs");
      expect(
        t(0 * ONE_DAY + 2 * ONE_HR + 11 * ONE_MIN + 50 * ONE_SEC, options)
      ).toBe("2hrs");
      expect(
        t(1 * ONE_DAY + 0 * ONE_HR + 0 * ONE_MIN + 0 * ONE_SEC, options)
      ).toBe("1day");
      expect(
        t(1 * ONE_DAY + 0 * ONE_HR + 0 * ONE_MIN + 4 * ONE_SEC, options)
      ).toBe("1day");
      expect(
        t(1 * ONE_DAY + 0 * ONE_HR + 3 * ONE_MIN + 0 * ONE_SEC, options)
      ).toBe("1day");
      expect(
        t(1 * ONE_DAY + 0 * ONE_HR + 3 * ONE_MIN + 4 * ONE_SEC, options)
      ).toBe("1day");
      expect(
        t(1 * ONE_DAY + 2 * ONE_HR + 0 * ONE_MIN + 0 * ONE_SEC, options)
      ).toBe("1day");
      expect(
        t(1 * ONE_DAY + 2 * ONE_HR + 0 * ONE_MIN + 4 * ONE_SEC, options)
      ).toBe("1day");
      expect(
        t(1 * ONE_DAY + 2 * ONE_HR + 3 * ONE_MIN + 0 * ONE_SEC, options)
      ).toBe("1day");
      expect(
        t(1 * ONE_DAY + 2 * ONE_HR + 3 * ONE_MIN + 4 * ONE_SEC, options)
      ).toBe("1day");
      expect(
        t(2 * ONE_DAY + 0 * ONE_HR + 0 * ONE_MIN + 0 * ONE_SEC, options)
      ).toBe("2days");
      expect(
        t(42 * ONE_DAY + 0 * ONE_HR + 6 * ONE_MIN + 8 * ONE_SEC, options)
      ).toBe("42days");
    });
    it("should return correct string, short length, short unit format, removing trailing zeros", () => {
      const options: TimeFormatOptions = {
        length: "short",
        isShortFormat: true,
        removeTrailingZeros: true,
      };
      expect(
        t(-(3 * ONE_DAY + 0 * ONE_HR + 6 * ONE_MIN + 9 * ONE_SEC), options)
      ).toBe("-3d");
      expect(
        t(-(0 * ONE_DAY + 2 * ONE_HR + 0 * ONE_MIN + 4 * ONE_SEC), options)
      ).toBe("-2h");
      expect(
        t(-(0 * ONE_DAY + 0 * ONE_HR + 5 * ONE_MIN + 8 * ONE_SEC), options)
      ).toBe("-5m");
      expect(
        t(-(0 * ONE_DAY + 0 * ONE_HR + 0 * ONE_MIN + 59 * ONE_SEC), options)
      ).toBe("-59s");
      expect(
        t(-(0 * ONE_DAY + 0 * ONE_HR + 0 * ONE_MIN + 2.1 * ONE_SEC), options)
      ).toBe("-2s");
      expect(
        t(-(0 * ONE_DAY + 0 * ONE_HR + 0 * ONE_MIN + 1 * ONE_SEC), options)
      ).toBe("-1s");
      expect(
        t(0 * ONE_DAY + 0 * ONE_HR + 0 * ONE_MIN + 0 * ONE_SEC, options)
      ).toBe("0s");
      expect(
        t(0 * ONE_DAY + 0 * ONE_HR + 0 * ONE_MIN + 1 * ONE_SEC, options)
      ).toBe("1s");
      expect(
        t(0 * ONE_DAY + 0 * ONE_HR + 0 * ONE_MIN + 2 * ONE_SEC, options)
      ).toBe("2s");
      expect(
        t(0 * ONE_DAY + 0 * ONE_HR + 1 * ONE_MIN + 0 * ONE_SEC, options)
      ).toBe("1m");
      expect(
        t(0 * ONE_DAY + 0 * ONE_HR + 1 * ONE_MIN + 30 * ONE_SEC, options)
      ).toBe("1m");
      expect(
        t(0 * ONE_DAY + 0 * ONE_HR + 1 * ONE_MIN + 59.99 * ONE_SEC, options)
      ).toBe("1m");
      expect(
        t(0 * ONE_DAY + 0 * ONE_HR + 2 * ONE_MIN + 0 * ONE_SEC, options)
      ).toBe("2m");
      expect(
        t(0 * ONE_DAY + 0 * ONE_HR + 59 * ONE_MIN + 59 * ONE_SEC, options)
      ).toBe("59m");
      expect(
        t(0 * ONE_DAY + 1 * ONE_HR + 0 * ONE_MIN + 0 * ONE_SEC, options)
      ).toBe("1h");
      expect(
        t(0 * ONE_DAY + 1 * ONE_HR + 0 * ONE_MIN + 42 * ONE_SEC, options)
      ).toBe("1h");
      expect(
        t(0 * ONE_DAY + 2 * ONE_HR + 0 * ONE_MIN + 0 * ONE_SEC, options)
      ).toBe("2h");
      expect(
        t(0 * ONE_DAY + 2 * ONE_HR + 11 * ONE_MIN + 50 * ONE_SEC, options)
      ).toBe("2h");
      expect(
        t(1 * ONE_DAY + 0 * ONE_HR + 0 * ONE_MIN + 0 * ONE_SEC, options)
      ).toBe("1d");
      expect(
        t(1 * ONE_DAY + 0 * ONE_HR + 0 * ONE_MIN + 4 * ONE_SEC, options)
      ).toBe("1d");
      expect(
        t(1 * ONE_DAY + 0 * ONE_HR + 3 * ONE_MIN + 0 * ONE_SEC, options)
      ).toBe("1d");
      expect(
        t(1 * ONE_DAY + 0 * ONE_HR + 3 * ONE_MIN + 4 * ONE_SEC, options)
      ).toBe("1d");
      expect(
        t(1 * ONE_DAY + 2 * ONE_HR + 0 * ONE_MIN + 0 * ONE_SEC, options)
      ).toBe("1d");
      expect(
        t(1 * ONE_DAY + 2 * ONE_HR + 0 * ONE_MIN + 4 * ONE_SEC, options)
      ).toBe("1d");
      expect(
        t(1 * ONE_DAY + 2 * ONE_HR + 3 * ONE_MIN + 0 * ONE_SEC, options)
      ).toBe("1d");
      expect(
        t(1 * ONE_DAY + 2 * ONE_HR + 3 * ONE_MIN + 4 * ONE_SEC, options)
      ).toBe("1d");
      expect(
        t(2 * ONE_DAY + 0 * ONE_HR + 0 * ONE_MIN + 0 * ONE_SEC, options)
      ).toBe("2d");
      expect(
        t(42 * ONE_DAY + 0 * ONE_HR + 6 * ONE_MIN + 8 * ONE_SEC, options)
      ).toBe("42d");
    });
    it("should return correct string, medium length, normal unit format, not removing trailing zeros", () => {
      const options: TimeFormatOptions = {
        length: "medium",
        isShortFormat: false,
        removeTrailingZeros: false,
      };
      expect(
        t(-(3 * ONE_DAY + 0 * ONE_HR + 6 * ONE_MIN + 9 * ONE_SEC), options)
      ).toBe("-3days\u00A00hrs");
      expect(
        t(-(0 * ONE_DAY + 2 * ONE_HR + 0 * ONE_MIN + 4 * ONE_SEC), options)
      ).toBe("-2hrs\u00A00mins");
      expect(
        t(-(0 * ONE_DAY + 0 * ONE_HR + 5 * ONE_MIN + 8 * ONE_SEC), options)
      ).toBe("-5mins\u00A0-8secs");
      expect(
        t(-(0 * ONE_DAY + 0 * ONE_HR + 0 * ONE_MIN + 59 * ONE_SEC), options)
      ).toBe("-59secs");
      expect(
        t(-(0 * ONE_DAY + 0 * ONE_HR + 0 * ONE_MIN + 2.1 * ONE_SEC), options)
      ).toBe("-2secs");
      expect(
        t(-(0 * ONE_DAY + 0 * ONE_HR + 0 * ONE_MIN + 1 * ONE_SEC), options)
      ).toBe("-1secs");
      expect(
        t(0 * ONE_DAY + 0 * ONE_HR + 0 * ONE_MIN + 0 * ONE_SEC, options)
      ).toBe("0secs");
      expect(
        t(0 * ONE_DAY + 0 * ONE_HR + 0 * ONE_MIN + 1 * ONE_SEC, options)
      ).toBe("1sec");
      expect(
        t(0 * ONE_DAY + 0 * ONE_HR + 0 * ONE_MIN + 2 * ONE_SEC, options)
      ).toBe("2secs");
      expect(
        t(0 * ONE_DAY + 0 * ONE_HR + 1 * ONE_MIN + 0 * ONE_SEC, options)
      ).toBe("1min\u00A00secs");
      expect(
        t(0 * ONE_DAY + 0 * ONE_HR + 1 * ONE_MIN + 30 * ONE_SEC, options)
      ).toBe("1min\u00A030secs");
      expect(
        t(0 * ONE_DAY + 0 * ONE_HR + 1 * ONE_MIN + 59.99 * ONE_SEC, options)
      ).toBe("1min\u00A059secs");
      expect(
        t(0 * ONE_DAY + 0 * ONE_HR + 2 * ONE_MIN + 0 * ONE_SEC, options)
      ).toBe("2mins\u00A00secs");
      expect(
        t(0 * ONE_DAY + 0 * ONE_HR + 59 * ONE_MIN + 59 * ONE_SEC, options)
      ).toBe("59mins\u00A059secs");
      expect(
        t(0 * ONE_DAY + 1 * ONE_HR + 0 * ONE_MIN + 0 * ONE_SEC, options)
      ).toBe("1hr\u00A00mins");
      expect(
        t(0 * ONE_DAY + 1 * ONE_HR + 0 * ONE_MIN + 42 * ONE_SEC, options)
      ).toBe("1hr\u00A00mins");
      expect(
        t(0 * ONE_DAY + 2 * ONE_HR + 0 * ONE_MIN + 0 * ONE_SEC, options)
      ).toBe("2hrs\u00A00mins");
      expect(
        t(0 * ONE_DAY + 2 * ONE_HR + 11 * ONE_MIN + 50 * ONE_SEC, options)
      ).toBe("2hrs\u00A011mins");
      expect(
        t(1 * ONE_DAY + 0 * ONE_HR + 0 * ONE_MIN + 0 * ONE_SEC, options)
      ).toBe("1day\u00A00hrs");
      expect(
        t(1 * ONE_DAY + 0 * ONE_HR + 0 * ONE_MIN + 4 * ONE_SEC, options)
      ).toBe("1day\u00A00hrs");
      expect(
        t(1 * ONE_DAY + 0 * ONE_HR + 3 * ONE_MIN + 0 * ONE_SEC, options)
      ).toBe("1day\u00A00hrs");
      expect(
        t(1 * ONE_DAY + 0 * ONE_HR + 3 * ONE_MIN + 4 * ONE_SEC, options)
      ).toBe("1day\u00A00hrs");
      expect(
        t(1 * ONE_DAY + 2 * ONE_HR + 0 * ONE_MIN + 0 * ONE_SEC, options)
      ).toBe("1day\u00A02hrs");
      expect(
        t(1 * ONE_DAY + 2 * ONE_HR + 0 * ONE_MIN + 4 * ONE_SEC, options)
      ).toBe("1day\u00A02hrs");
      expect(
        t(1 * ONE_DAY + 2 * ONE_HR + 3 * ONE_MIN + 0 * ONE_SEC, options)
      ).toBe("1day\u00A02hrs");
      expect(
        t(1 * ONE_DAY + 2 * ONE_HR + 3 * ONE_MIN + 4 * ONE_SEC, options)
      ).toBe("1day\u00A02hrs");
      expect(
        t(2 * ONE_DAY + 0 * ONE_HR + 0 * ONE_MIN + 0 * ONE_SEC, options)
      ).toBe("2days\u00A00hrs");
      expect(
        t(42 * ONE_DAY + 0 * ONE_HR + 6 * ONE_MIN + 8 * ONE_SEC, options)
      ).toBe("42days\u00A00hrs");
    });
    it("should return correct string, medium length, normal unit format, remove trailing zeros", () => {
      const options: TimeFormatOptions = {
        length: "medium",
        isShortFormat: false,
        removeTrailingZeros: true,
      };
      expect(
        t(-(3 * ONE_DAY + 0 * ONE_HR + 6 * ONE_MIN + 9 * ONE_SEC), options)
      ).toBe("-3days");
      expect(
        t(-(0 * ONE_DAY + 2 * ONE_HR + 0 * ONE_MIN + 4 * ONE_SEC), options)
      ).toBe("-2hrs");
      expect(
        t(-(0 * ONE_DAY + 0 * ONE_HR + 5 * ONE_MIN + 8 * ONE_SEC), options)
      ).toBe("-5mins\u00A0-8secs");
      expect(
        t(-(0 * ONE_DAY + 0 * ONE_HR + 0 * ONE_MIN + 59 * ONE_SEC), options)
      ).toBe("-59secs");
      expect(
        t(-(0 * ONE_DAY + 0 * ONE_HR + 0 * ONE_MIN + 2.1 * ONE_SEC), options)
      ).toBe("-2secs");
      expect(
        t(-(0 * ONE_DAY + 0 * ONE_HR + 0 * ONE_MIN + 1 * ONE_SEC), options)
      ).toBe("-1secs");
      expect(
        t(0 * ONE_DAY + 0 * ONE_HR + 0 * ONE_MIN + 0 * ONE_SEC, options)
      ).toBe("0secs");
      expect(
        t(0 * ONE_DAY + 0 * ONE_HR + 0 * ONE_MIN + 1 * ONE_SEC, options)
      ).toBe("1sec");
      expect(
        t(0 * ONE_DAY + 0 * ONE_HR + 0 * ONE_MIN + 2 * ONE_SEC, options)
      ).toBe("2secs");
      expect(
        t(0 * ONE_DAY + 0 * ONE_HR + 1 * ONE_MIN + 0 * ONE_SEC, options)
      ).toBe("1min");
      expect(
        t(0 * ONE_DAY + 0 * ONE_HR + 1 * ONE_MIN + 30 * ONE_SEC, options)
      ).toBe("1min\u00A030secs");
      expect(
        t(0 * ONE_DAY + 0 * ONE_HR + 1 * ONE_MIN + 59.99 * ONE_SEC, options)
      ).toBe("1min\u00A059secs");
      expect(
        t(0 * ONE_DAY + 0 * ONE_HR + 2 * ONE_MIN + 0 * ONE_SEC, options)
      ).toBe("2mins");
      expect(
        t(0 * ONE_DAY + 0 * ONE_HR + 59 * ONE_MIN + 59 * ONE_SEC, options)
      ).toBe("59mins\u00A059secs");
      expect(
        t(0 * ONE_DAY + 1 * ONE_HR + 0 * ONE_MIN + 0 * ONE_SEC, options)
      ).toBe("1hr");
      expect(
        t(0 * ONE_DAY + 1 * ONE_HR + 0 * ONE_MIN + 42 * ONE_SEC, options)
      ).toBe("1hr");
      expect(
        t(0 * ONE_DAY + 2 * ONE_HR + 0 * ONE_MIN + 0 * ONE_SEC, options)
      ).toBe("2hrs");
      expect(
        t(0 * ONE_DAY + 2 * ONE_HR + 11 * ONE_MIN + 50 * ONE_SEC, options)
      ).toBe("2hrs\u00A011mins");
      expect(
        t(1 * ONE_DAY + 0 * ONE_HR + 0 * ONE_MIN + 0 * ONE_SEC, options)
      ).toBe("1day");
      expect(
        t(1 * ONE_DAY + 0 * ONE_HR + 0 * ONE_MIN + 4 * ONE_SEC, options)
      ).toBe("1day");
      expect(
        t(1 * ONE_DAY + 0 * ONE_HR + 3 * ONE_MIN + 0 * ONE_SEC, options)
      ).toBe("1day");
      expect(
        t(1 * ONE_DAY + 0 * ONE_HR + 3 * ONE_MIN + 4 * ONE_SEC, options)
      ).toBe("1day");
      expect(
        t(1 * ONE_DAY + 2 * ONE_HR + 0 * ONE_MIN + 0 * ONE_SEC, options)
      ).toBe("1day\u00A02hrs");
      expect(
        t(1 * ONE_DAY + 2 * ONE_HR + 0 * ONE_MIN + 4 * ONE_SEC, options)
      ).toBe("1day\u00A02hrs");
      expect(
        t(1 * ONE_DAY + 2 * ONE_HR + 3 * ONE_MIN + 0 * ONE_SEC, options)
      ).toBe("1day\u00A02hrs");
      expect(
        t(1 * ONE_DAY + 2 * ONE_HR + 3 * ONE_MIN + 4 * ONE_SEC, options)
      ).toBe("1day\u00A02hrs");
      expect(
        t(2 * ONE_DAY + 0 * ONE_HR + 0 * ONE_MIN + 0 * ONE_SEC, options)
      ).toBe("2days");
      expect(
        t(42 * ONE_DAY + 0 * ONE_HR + 6 * ONE_MIN + 8 * ONE_SEC, options)
      ).toBe("42days");
    });
    it("should return correct string, full length, normal unit format, not removing trailing zeros", () => {
      const options: TimeFormatOptions = {
        length: "full",
        isShortFormat: false,
        removeTrailingZeros: false,
      };
      expect(
        t(-(3 * ONE_DAY + 0 * ONE_HR + 6 * ONE_MIN + 9 * ONE_SEC), options)
      ).toBe("-3days\u00A00hrs\u00A0-6mins\u00A0-9secs");
      expect(
        t(-(0 * ONE_DAY + 2 * ONE_HR + 0 * ONE_MIN + 4 * ONE_SEC), options)
      ).toBe("-2hrs\u00A00mins\u00A0-4secs");
      expect(
        t(-(0 * ONE_DAY + 0 * ONE_HR + 5 * ONE_MIN + 8 * ONE_SEC), options)
      ).toBe("-5mins\u00A0-8secs");
      expect(
        t(-(0 * ONE_DAY + 0 * ONE_HR + 0 * ONE_MIN + 59 * ONE_SEC), options)
      ).toBe("-59secs");
      expect(
        t(-(0 * ONE_DAY + 0 * ONE_HR + 0 * ONE_MIN + 2.1 * ONE_SEC), options)
      ).toBe("-2secs");
      expect(
        t(-(0 * ONE_DAY + 0 * ONE_HR + 0 * ONE_MIN + 1 * ONE_SEC), options)
      ).toBe("-1secs");
      expect(
        t(0 * ONE_DAY + 0 * ONE_HR + 0 * ONE_MIN + 0 * ONE_SEC, options)
      ).toBe("0secs");
      expect(
        t(0 * ONE_DAY + 0 * ONE_HR + 0 * ONE_MIN + 1 * ONE_SEC, options)
      ).toBe("1sec");
      expect(
        t(0 * ONE_DAY + 0 * ONE_HR + 0 * ONE_MIN + 2 * ONE_SEC, options)
      ).toBe("2secs");
      expect(
        t(0 * ONE_DAY + 0 * ONE_HR + 1 * ONE_MIN + 0 * ONE_SEC, options)
      ).toBe("1min\u00A00secs");
      expect(
        t(0 * ONE_DAY + 0 * ONE_HR + 1 * ONE_MIN + 30 * ONE_SEC, options)
      ).toBe("1min\u00A030secs");
      expect(
        t(0 * ONE_DAY + 0 * ONE_HR + 1 * ONE_MIN + 59.99 * ONE_SEC, options)
      ).toBe("1min\u00A059secs");
      expect(
        t(0 * ONE_DAY + 0 * ONE_HR + 2 * ONE_MIN + 0 * ONE_SEC, options)
      ).toBe("2mins\u00A00secs");
      expect(
        t(0 * ONE_DAY + 0 * ONE_HR + 59 * ONE_MIN + 59 * ONE_SEC, options)
      ).toBe("59mins\u00A059secs");
      expect(
        t(0 * ONE_DAY + 1 * ONE_HR + 0 * ONE_MIN + 0 * ONE_SEC, options)
      ).toBe("1hr\u00A00mins\u00A00secs");
      expect(
        t(0 * ONE_DAY + 1 * ONE_HR + 0 * ONE_MIN + 42 * ONE_SEC, options)
      ).toBe("1hr\u00A00mins\u00A042secs");
      expect(
        t(0 * ONE_DAY + 2 * ONE_HR + 0 * ONE_MIN + 0 * ONE_SEC, options)
      ).toBe("2hrs\u00A00mins\u00A00secs");
      expect(
        t(0 * ONE_DAY + 2 * ONE_HR + 11 * ONE_MIN + 50 * ONE_SEC, options)
      ).toBe("2hrs\u00A011mins\u00A050secs");
      expect(
        t(1 * ONE_DAY + 0 * ONE_HR + 0 * ONE_MIN + 0 * ONE_SEC, options)
      ).toBe("1day\u00A00hrs\u00A00mins\u00A00secs");
      expect(
        t(1 * ONE_DAY + 0 * ONE_HR + 0 * ONE_MIN + 4 * ONE_SEC, options)
      ).toBe("1day\u00A00hrs\u00A00mins\u00A04secs");
      expect(
        t(1 * ONE_DAY + 0 * ONE_HR + 3 * ONE_MIN + 0 * ONE_SEC, options)
      ).toBe("1day\u00A00hrs\u00A03mins\u00A00secs");
      expect(
        t(1 * ONE_DAY + 0 * ONE_HR + 3 * ONE_MIN + 4 * ONE_SEC, options)
      ).toBe("1day\u00A00hrs\u00A03mins\u00A04secs");
      expect(
        t(1 * ONE_DAY + 2 * ONE_HR + 0 * ONE_MIN + 0 * ONE_SEC, options)
      ).toBe("1day\u00A02hrs\u00A00mins\u00A00secs");
      expect(
        t(1 * ONE_DAY + 2 * ONE_HR + 0 * ONE_MIN + 4 * ONE_SEC, options)
      ).toBe("1day\u00A02hrs\u00A00mins\u00A04secs");
      expect(
        t(1 * ONE_DAY + 2 * ONE_HR + 3 * ONE_MIN + 0 * ONE_SEC, options)
      ).toBe("1day\u00A02hrs\u00A03mins\u00A00secs");
      expect(
        t(1 * ONE_DAY + 2 * ONE_HR + 3 * ONE_MIN + 4 * ONE_SEC, options)
      ).toBe("1day\u00A02hrs\u00A03mins\u00A04secs");
      expect(
        t(2 * ONE_DAY + 0 * ONE_HR + 0 * ONE_MIN + 0 * ONE_SEC, options)
      ).toBe("2days\u00A00hrs\u00A00mins\u00A00secs");
      expect(
        t(42 * ONE_DAY + 0 * ONE_HR + 6 * ONE_MIN + 8 * ONE_SEC, options)
      ).toBe("42days\u00A00hrs\u00A06mins\u00A08secs");
    });
    it("should return correct string, full length, normal unit format, remove trailing zeros", () => {
      const options: TimeFormatOptions = {
        length: "full",
        isShortFormat: false,
        removeTrailingZeros: true,
      };
      expect(
        t(-(3 * ONE_DAY + 0 * ONE_HR + 6 * ONE_MIN + 9 * ONE_SEC), options)
      ).toBe("-3days\u00A00hrs\u00A0-6mins\u00A0-9secs");
      expect(
        t(-(0 * ONE_DAY + 2 * ONE_HR + 0 * ONE_MIN + 4 * ONE_SEC), options)
      ).toBe("-2hrs\u00A00mins\u00A0-4secs");
      expect(
        t(-(0 * ONE_DAY + 0 * ONE_HR + 5 * ONE_MIN + 8 * ONE_SEC), options)
      ).toBe("-5mins\u00A0-8secs");
      expect(
        t(-(0 * ONE_DAY + 0 * ONE_HR + 0 * ONE_MIN + 59 * ONE_SEC), options)
      ).toBe("-59secs");
      expect(
        t(-(0 * ONE_DAY + 0 * ONE_HR + 0 * ONE_MIN + 2.1 * ONE_SEC), options)
      ).toBe("-2secs");
      expect(
        t(-(0 * ONE_DAY + 0 * ONE_HR + 0 * ONE_MIN + 1 * ONE_SEC), options)
      ).toBe("-1secs");
      expect(
        t(0 * ONE_DAY + 0 * ONE_HR + 0 * ONE_MIN + 0 * ONE_SEC, options)
      ).toBe("0secs");
      expect(
        t(0 * ONE_DAY + 0 * ONE_HR + 0 * ONE_MIN + 1 * ONE_SEC, options)
      ).toBe("1sec");
      expect(
        t(0 * ONE_DAY + 0 * ONE_HR + 0 * ONE_MIN + 2 * ONE_SEC, options)
      ).toBe("2secs");
      expect(
        t(0 * ONE_DAY + 0 * ONE_HR + 1 * ONE_MIN + 0 * ONE_SEC, options)
      ).toBe("1min");
      expect(
        t(0 * ONE_DAY + 0 * ONE_HR + 1 * ONE_MIN + 30 * ONE_SEC, options)
      ).toBe("1min\u00A030secs");
      expect(
        t(0 * ONE_DAY + 0 * ONE_HR + 1 * ONE_MIN + 59.99 * ONE_SEC, options)
      ).toBe("1min\u00A059secs");
      expect(
        t(0 * ONE_DAY + 0 * ONE_HR + 2 * ONE_MIN + 0 * ONE_SEC, options)
      ).toBe("2mins");
      expect(
        t(0 * ONE_DAY + 0 * ONE_HR + 59 * ONE_MIN + 59 * ONE_SEC, options)
      ).toBe("59mins\u00A059secs");
      expect(
        t(0 * ONE_DAY + 1 * ONE_HR + 0 * ONE_MIN + 0 * ONE_SEC, options)
      ).toBe("1hr");
      expect(
        t(0 * ONE_DAY + 1 * ONE_HR + 0 * ONE_MIN + 42 * ONE_SEC, options)
      ).toBe("1hr\u00A00mins\u00A042secs");
      expect(
        t(0 * ONE_DAY + 2 * ONE_HR + 0 * ONE_MIN + 0 * ONE_SEC, options)
      ).toBe("2hrs");
      expect(
        t(0 * ONE_DAY + 2 * ONE_HR + 11 * ONE_MIN + 50 * ONE_SEC, options)
      ).toBe("2hrs\u00A011mins\u00A050secs");
      expect(
        t(1 * ONE_DAY + 0 * ONE_HR + 0 * ONE_MIN + 0 * ONE_SEC, options)
      ).toBe("1day");
      expect(
        t(1 * ONE_DAY + 0 * ONE_HR + 0 * ONE_MIN + 4 * ONE_SEC, options)
      ).toBe("1day\u00A00hrs\u00A00mins\u00A04secs");
      expect(
        t(1 * ONE_DAY + 0 * ONE_HR + 3 * ONE_MIN + 0 * ONE_SEC, options)
      ).toBe("1day\u00A00hrs\u00A03mins");
      expect(
        t(1 * ONE_DAY + 0 * ONE_HR + 3 * ONE_MIN + 4 * ONE_SEC, options)
      ).toBe("1day\u00A00hrs\u00A03mins\u00A04secs");
      expect(
        t(1 * ONE_DAY + 2 * ONE_HR + 0 * ONE_MIN + 0 * ONE_SEC, options)
      ).toBe("1day\u00A02hrs");
      expect(
        t(1 * ONE_DAY + 2 * ONE_HR + 0 * ONE_MIN + 4 * ONE_SEC, options)
      ).toBe("1day\u00A02hrs\u00A00mins\u00A04secs");
      expect(
        t(1 * ONE_DAY + 2 * ONE_HR + 3 * ONE_MIN + 0 * ONE_SEC, options)
      ).toBe("1day\u00A02hrs\u00A03mins");
      expect(
        t(1 * ONE_DAY + 2 * ONE_HR + 3 * ONE_MIN + 4 * ONE_SEC, options)
      ).toBe("1day\u00A02hrs\u00A03mins\u00A04secs");
      expect(
        t(2 * ONE_DAY + 0 * ONE_HR + 0 * ONE_MIN + 0 * ONE_SEC, options)
      ).toBe("2days");
      expect(
        t(42 * ONE_DAY + 0 * ONE_HR + 6 * ONE_MIN + 8 * ONE_SEC, options)
      ).toBe("42days\u00A00hrs\u00A06mins\u00A08secs");
    });
  });

  describe("getTimeLeft", () => {
    const RealDate = Date;

    const getTimestamp = (datetime: string) => new Date(datetime).getTime();

    beforeAll(() => {
      global.Date.now = jest.fn(() => getTimestamp("2022-04-17T00:00:00"));
    });

    it("should return 0 if elapsed", () => {
      expect(getTimeLeft(getTimestamp("2022-04-15T11:00:00"), ONE_DAY)).toBe(0);
      expect(getTimeLeft(getTimestamp("2022-04-16T00:00:00"), ONE_DAY)).toBe(0);
    });

    it("should return correct time left", () => {
      expect(getTimeLeft(getTimestamp("2022-04-16T01:00:00"), ONE_DAY)).toBe(
        ONE_HR
      );
      expect(getTimeLeft(getTimestamp("2022-04-16T23:59:30"), ONE_MIN)).toBe(
        30 * ONE_SEC
      );
      expect(getTimeLeft(getTimestamp("2022-04-16T23:30:00"), ONE_HR)).toBe(
        30 * ONE_MIN
      );
    });

    afterAll(() => {
      global.Date = RealDate;
    });
  });
});
