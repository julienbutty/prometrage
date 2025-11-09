import "@testing-library/jest-dom";
import { expect, afterEach } from "vitest";
import { cleanup } from "@testing-library/react";

// Cleanup after each test
afterEach(() => {
  cleanup();
});

// Custom matchers
expect.extend({});

// Polyfill ResizeObserver for Combobox/Popover tests
global.ResizeObserver = class ResizeObserver {
  observe() {
    // do nothing
  }
  unobserve() {
    // do nothing
  }
  disconnect() {
    // do nothing
  }
};

// Polyfill scrollIntoView for Command component
Element.prototype.scrollIntoView = function () {
  // do nothing
};

// Polyfill hasPointerCapture for Select component
Element.prototype.hasPointerCapture = function () {
  return false;
};
