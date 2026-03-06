import { describe, it, expect, vi } from "vitest";

// Mock Next.js server modules
vi.mock("next/server", () => {
  class MockNextURL {
    pathname: string;
    constructor(url: string, base?: string) {
      this.pathname = new URL(url, base || "http://localhost").pathname;
    }
    clone() {
      const cloned = new MockNextURL("http://localhost" + this.pathname);
      return cloned;
    }
  }

  class MockNextRequest {
    headers: Headers;
    nextUrl: MockNextURL;

    constructor(url: string, opts?: { headers?: Record<string, string> }) {
      this.headers = new Headers(opts?.headers || {});
      this.nextUrl = new MockNextURL(url);
    }
  }

  return {
    NextRequest: MockNextRequest,
    NextResponse: {
      next: vi.fn(() => ({ type: "next" })),
      rewrite: vi.fn((url: any) => ({ type: "rewrite", url })),
    },
  };
});

import { proxy, config } from "./proxy";
import { NextRequest, NextResponse } from "next/server";

function makeRequest(host: string, pathname = "/") {
  return new NextRequest(`http://${host}${pathname}`, {
    headers: { host },
  }) as any;
}

describe("proxy", () => {
  it("passes through for localhost", () => {
    const req = makeRequest("localhost:3000");
    proxy(req);
    expect(NextResponse.next).toHaveBeenCalled();
  });

  it("passes through for sweeneysnap.com", () => {
    const req = makeRequest("sweeneysnap.com");
    proxy(req);
    expect(NextResponse.next).toHaveBeenCalled();
  });

  it("passes through for www.sweeneysnap.com", () => {
    const req = makeRequest("www.sweeneysnap.com");
    proxy(req);
    expect(NextResponse.next).toHaveBeenCalled();
  });

  it("passes through for sweeneysnap.vercel.app", () => {
    const req = makeRequest("sweeneysnap.vercel.app");
    proxy(req);
    expect(NextResponse.next).toHaveBeenCalled();
  });

  it("rewrites custom domain to /_custom-domain/{hostname}", () => {
    const req = makeRequest("myevent.example.com");
    proxy(req);
    expect(NextResponse.rewrite).toHaveBeenCalled();
    const call = (NextResponse.rewrite as any).mock.calls.at(-1)[0];
    expect(call.pathname).toBe("/_custom-domain/myevent.example.com");
  });

  it("rewrites custom domain with path", () => {
    const req = makeRequest("myevent.example.com", "/gallery");
    proxy(req);
    const call = (NextResponse.rewrite as any).mock.calls.at(-1)[0];
    expect(call.pathname).toBe("/_custom-domain/myevent.example.com/gallery");
  });

  it("is case-insensitive for hostname", () => {
    const req = makeRequest("SWEENEYSNAP.COM");
    proxy(req);
    expect(NextResponse.next).toHaveBeenCalled();
  });

  it("exports matcher config", () => {
    expect(config.matcher).toBeDefined();
    expect(config.matcher[0]).toContain("_next");
  });
});
