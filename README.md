# mcp-ghl-community

An MCP server for the GoHighLevel Communities API. Provides tools to manage community posts — create, read, update, delete, pin/unpin, and more — directly from Claude or any MCP client.

## Install

Download the latest binary for your platform from [GitHub Releases](https://github.com/shanewwarren/mcp-ghl-community/releases/latest):

**macOS (Apple Silicon):**

```bash
curl -fSL https://github.com/shanewwarren/mcp-ghl-community/releases/latest/download/mcp-ghl-community-darwin-arm64 -o mcp-ghl-community
chmod +x mcp-ghl-community
sudo mv mcp-ghl-community /usr/local/bin/
```

**macOS (Intel):**

```bash
curl -fSL https://github.com/shanewwarren/mcp-ghl-community/releases/latest/download/mcp-ghl-community-darwin-x64 -o mcp-ghl-community
chmod +x mcp-ghl-community
sudo mv mcp-ghl-community /usr/local/bin/
```

**Linux (x64):**

```bash
curl -fSL https://github.com/shanewwarren/mcp-ghl-community/releases/latest/download/mcp-ghl-community-linux-x64 -o mcp-ghl-community
chmod +x mcp-ghl-community
sudo mv mcp-ghl-community /usr/local/bin/
```

**Linux (arm64):**

```bash
curl -fSL https://github.com/shanewwarren/mcp-ghl-community/releases/latest/download/mcp-ghl-community-linux-arm64 -o mcp-ghl-community
chmod +x mcp-ghl-community
sudo mv mcp-ghl-community /usr/local/bin/
```

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `GHL_TOKEN` | Yes | Your GoHighLevel API token |
| `GHL_LOCATION_ID` | No | Default location ID (can also be passed per-tool call) |
| `GHL_GROUP_ID` | No | Default group ID (can also be passed per-tool call) |

## Configure in Claude

**Claude Code** (`~/.claude.json` or project `.mcp.json`):

```json
{
  "mcpServers": {
    "ghl-community": {
      "command": "mcp-ghl-community",
      "env": {
        "GHL_TOKEN": "your-token-here",
        "GHL_LOCATION_ID": "optional-location-id",
        "GHL_GROUP_ID": "optional-group-id"
      }
    }
  }
}
```

**Claude Desktop** (`~/Library/Application Support/Claude/claude_desktop_config.json` on macOS):

```json
{
  "mcpServers": {
    "ghl-community": {
      "command": "mcp-ghl-community",
      "env": {
        "GHL_TOKEN": "your-token-here",
        "GHL_LOCATION_ID": "optional-location-id",
        "GHL_GROUP_ID": "optional-group-id"
      }
    }
  }
}
```

If you didn't install to `/usr/local/bin/`, replace `"mcp-ghl-community"` with the full path to the binary.

## Build from Source

Requires [Bun](https://bun.sh) v1.1+.

```bash
git clone https://github.com/shanewwarren/mcp-ghl-community.git
cd mcp-ghl-community
bun install
bun run build
```

This compiles a standalone binary to `bin/mcp-ghl-community`.

## Available Tools

| Tool | Description |
|---|---|
| `get_channel_posts` | Get posts from a specific channel |
| `get_post` | Get a single post by ID |
| `get_public_posts` | Get public posts for a group |
| `get_posts_by_user` | Get posts filtered by user |
| `get_user_home_timeline` | Get home timeline for a user |
| `get_channel_pinned_posts` | Get pinned posts for a channel |
| `get_home_pinned_posts` | Get pinned posts for the group home feed |
| `create_post` | Create a new post in a channel |
| `update_post` | Update an existing post's content |
| `update_post_channel` | Move a post to a different channel |
| `update_post_status` | Update the live status of a post |
| `pin_post_to_channel` | Pin a post to its channel |
| `pin_post_to_home` | Pin a post to the group home feed |
| `unpin_post_from_channel` | Unpin a post from its channel |
| `unpin_post_from_home` | Unpin a post from the group home feed |
| `toggle_post_comments` | Enable or disable comments on a post |
| `delete_post` | Delete a post |
| `mark_posts_read_bulk` | Mark multiple posts as read in bulk |

## Development

Run the server directly without compiling:

```bash
bun run dev
```
