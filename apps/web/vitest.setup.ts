import { expect } from "vitest";
import * as matchers from "@testing-library/jest-dom/matchers";
import { afterAll, afterEach, beforeAll } from "vitest";
import { server } from "./mocks/server";

expect.extend(matchers);

beforeAll(() => {
  server.listen({ onUnhandledFrame: "error" });
});

afterEach(() => {
  server.resetHandlers();
});

afterAll(() => {
  server.close();
});