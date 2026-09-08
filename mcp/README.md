# pixellens-mcp

Let your AI read pages **from your own browser, with your own session.**

Hosted readers (Jina, Firecrawl and friends) fetch a URL from *their* servers.
They never see anything behind your login, and they render JavaScript apps
poorly or not at all. This one asks your Chrome to read the page you are
actually looking at.

Requires the [PixelLens](https://chromewebstore.google.com/detail/pixellens/mdjbknfjgpehbcdohjejobngijmhnfmm)
extension, version 1.2 or later, with **Pro** unlocked (19 € once, for life).
The server itself is free and open source; it needs a Pro extension to pair with.

## Setup

**1. Start the server once, to get your pairing token**

```bash
npx pixellens-mcp
```

It prints a token and stores it in `~/.pixellens-mcp/token`.

**2. Pair the extension**

Open the PixelLens side panel, go to Settings, turn on **Local AI bridge**, and
paste the token. The status turns to *Connected*.

**3. Register the server with your assistant**

Claude Code:

```bash
claude mcp add pixellens -- npx -y pixellens-mcp
```

Anything else that speaks MCP: run `npx pixellens-mcp` as a stdio server.

## Tools

| Tool | What it does |
| --- | --- |
| `pixellens_read_page` | The tab you are on, as clean Markdown |
| `pixellens_read_url` | Opens a URL in a background tab, renders it, returns Markdown |
| `pixellens_design_system` | Palette, type scale, spacing, shadows, radii of the current page |
| `pixellens_bundle` | Content, design system and metadata in one bundle |

## Security

The bridge exposes the content of your tabs to a program on your machine. It is
built accordingly, and you should hold it to these terms:

- the server listens on `127.0.0.1` only, never on a public interface
- the WebSocket handshake refuses any origin that is not `chrome-extension://`,
  so a malicious web page cannot connect to it
- a shared token is required, compared in constant time
- the extension ships the bridge **off**; turning it on is an explicit action,
  and it requests the localhost permission only at that moment
- one browser connection at a time

If you stop using it, turn the toggle off. The extension then holds no network
permission at all.

## Configuration

| Variable | Default | Purpose |
| --- | --- | --- |
| `PIXELLENS_PORT` | `8787` | Port the bridge listens on |
| `PIXELLENS_TOKEN` | file | Overrides the stored token |

## Development

```bash
npm install
npm run build
npm test        # 9 tests, mostly on the handshake and token checks
```

MIT.
