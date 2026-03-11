# AI Web UI Testing for Claude Code Agents
## Research Report | 2026-03-11

### Executive Summary

For Claude Code agents to test web UIs without human eyes, **Playwright MCP Server** is the optimal choice. It offers Claude Code native integration, structured accessibility-based interaction (no vision dependency), and production maturity. Anthropic Computer Use excels for complex desktop tasks but carries higher latency & vision model costs. Browser-Use and Stagehand are excellent for Python-based standalone agents outside Claude Code.

---

### Solution Comparison

#### 1. **Playwright MCP Server** ⭐ RECOMMENDED

**Setup:** Simple. `claude mcp add playwright npx @playwright/mcp@latest` (requires Node.js 18+)

**Capabilities:**
- Takes screenshots & interprets them
- Clicks, types, navigates, scrolls
- Operates on accessibility tree (no vision model needed)
- Headless or visible Chrome control

**Integration:** Native to Claude Code. No setup friction.

**Maturity:** Production-ready. Official Microsoft package actively maintained.

**Best For:** Claude Code agents testing web apps in headless/visible mode. Self-healing tests on UI changes.

**Limitations:** Requires Node.js environment. Pure headless has limited visual feedback.

---

#### 2. **Anthropic Computer Use**

**Setup:** Requires Claude API with beta header `computer-use-2025-11-24`

**Capabilities:**
- Full desktop control (screenshots, mouse, keyboard)
- Visual understanding via Claude's vision
- Multi-step autonomous workflows
- Works with any application (not just browsers)

**Integration:** API-based, not native to Claude Code CLI yet. Requires custom integration.

**Maturity:** Beta since late 2024. Production use emerging. Opus 4.6 success rates: high 80s% on standard tasks.

**Best For:** Complex multi-application workflows. Tasks requiring visual interpretation beyond accessibility trees. Desktop automation.

**Limitations:** Beta feature (no Zero Data Retention). Higher token cost (vision processing). Slower than structured MCP. 14.5hr context window needed for very long tasks.

---

#### 3. **Browser-Use (Python)**

**Setup:** `uv add browser-use`. Low friction for Python projects.

**Capabilities:**
- Form filling, scraping, multi-step tasks
- Custom tool integration via decorators
- Authentication via browser profiles
- Works with ChatGPT, Anthropic, Google, Gemini

**Integration:** Python library—not native to Claude Code (Node.js CLI).

**Maturity:** Very mature. 80k+ GitHub stars, 118 releases, production deployments.

**Best For:** Standalone Python agents. Job automation, shopping workflows, data collection. Teams preferring Python.

**Limitations:** Separate Python process. Overhead for Node.js-first Claude Code projects. Less suited for CLI integration.

---

#### 4. **Stagehand (Browserbase)**

**Setup:** `npx create-browser-app`. Very accessible quickstart.

**Capabilities:**
- act() for single actions, agent() for multi-step, extract() for data
- Auto-caching & self-healing
- Preview before execution
- Chrome DevTools Protocol access

**Integration:** JavaScript/TypeScript framework. Works well with Claude Code context.

**Maturity:** Production-ready. Actively developed by Browserbase.

**Best For:** Production web automation workflows. Structured data extraction. Requires Browserbase account for cloud scaling.

**Limitations:** Cloud dependency for scaling. Less established than Playwright in enterprise. Requires LLM API key + Browserbase credentials.

---

#### 5. **Puppeteer MCP** (NOT RECOMMENDED)

**Status:** Deprecated. Official `@modelcontextprotocol/server-puppeteer` no longer supported.

**Alternative:** Community forks (jaenster/puppeteer-mcp-claude) still functional but unmaintained.

**Verdict:** Use Playwright MCP instead. Superior cross-browser support, active maintenance.

---

### Visual Regression Testing (Optional Layer)

For UI correctness verification beyond interaction:
- **Percy by BrowserStack**: AI visual diffing, CI/CD integrated, catches layout shifts intelligently
- **Applitools Eyes**: Computer vision approach, not pixel-based. Storybook & Figma plugins.
- **Vitest 4.0**: Built-in `toHaveScreenshot()` for component-level visual regression
- **BackstopJS**: Free, open-source baseline comparison

These complement browser control tools for comprehensive testing.

---

### Recommendation Matrix

| Scenario | Tool | Rationale |
|----------|------|-----------|
| Claude Code agent testing web app | **Playwright MCP** | Native integration, structured, production-ready |
| Complex desktop multi-app tasks | **Computer Use API** | Full control, visual understanding, but beta/costly |
| Python standalone automation | **Browser-Use** | Mature, flexible, community strong |
| Structured data extraction at scale | **Stagehand** | Self-healing, caching, cloud-ready |
| Legacy/deprecated | Puppeteer MCP | Avoid—migrate to Playwright |

---

### Setup Quickstart: Playwright MCP + Claude Code

```bash
# Install Claude Code (if needed)
npm install -g @anthropic-ai/claude-code

# Add Playwright MCP
claude mcp add playwright npx @playwright/mcp@latest

# Use in Claude Code prompt
"Visit https://example.com and verify the login button is visible"
```

Claude Code now controls a browser via natural language. Screenshots + accessibility tree drive decisions. No vision model overhead.

---

### Key Findings

1. **Playwright MCP = fastest on-ramp** for Claude Code agents. No vision cost, structured data, native integration.
2. **Computer Use = most powerful** but requires API integration & beta acceptance. High token cost. Emerging best-practice.
3. **Browser-Use = most mature** but Python-only. Great for standalone agents outside Claude Code.
4. **Stagehand = best for production scaling** with Browserbase backing. Self-healing is strong selling point.
5. **Puppeteer MCP = EOL.** Don't use.

---

### Unresolved Questions

- Will Claude Code add native Computer Use API support in 2026? (Currently API-only)
- Does Playwright MCP support mobile emulation parity with Playwright.dev? (Likely yes, not explicitly confirmed)
- What is Browserbase Stagehand's per-automation cost vs. self-hosted Playwright? (Depends on usage tier)

---

## Sources

- [Browser-Use GitHub](https://github.com/browser-use/browser-use)
- [Stagehand by Browserbase](https://github.com/browserbase/stagehand)
- [Anthropic Computer Use Docs](https://platform.claude.com/docs/en/agents-and-tools/tool-use/computer-use-tool)
- [Microsoft Playwright MCP](https://github.com/microsoft/playwright-mcp)
- [ExecuteAutomation Playwright MCP Community](https://github.com/executeautomation/mcp-playwright)
- [Puppeteer MCP Deprecation Notice](https://medium.com/@alphaneker40/setting-claude-code-with-puppeteer-mcp-browser-automation-for-ai-driven-development-0081280b7e5e)
- [Simon Willison on Playwright MCP + Claude Code](https://til.simonwillison.net/claude-code/playwright-mcp-claude-code)
- [Builder.io Playwright MCP Guide](https://www.builder.io/blog/playwright-mcp-server-claude-code)
- [Anthropic Computer Use 2025 Updates](https://www.anthropic.com/news/3-5-models-and-computer-use)
- [Visual Regression Testing 2026 Guide - BrowserStack](https://www.browserstack.com/guide/automated-visual-regression-testing)
- [Applitools Visual AI](https://www.browserstack.com/guide/visual-regression-testing-tool)
- [Vitest 4.0 Release](https://www.infoinfo.com/news/2025/12/vitest-4-browser-mode/)
