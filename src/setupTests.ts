import "@testing-library/jest-dom/vitest";
import { afterEach, vi } from "vitest";
import { cleanup } from "@testing-library/react";
import React from "react";

// limpa o DOM após cada teste
afterEach(() => cleanup());

// Mocks mínimos de Next para o JSDOM
vi.mock("next/image", () => ({
  default: (props: any) => React.createElement("img", props),
}));

vi.mock("next/link", () => ({
  default: ({ href, children, ...rest }: any) =>
    React.createElement("a", { href, ...rest }, children),
}));

vi.mock("next/router", () => ({
  useRouter() {
    return {
      push: vi.fn(),
      replace: vi.fn(),
      prefetch: vi.fn(),
      route: "/",
      pathname: "/",
      query: {},
      asPath: "/",
    };
  },
}));
