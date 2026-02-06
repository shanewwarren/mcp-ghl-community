import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { GhlClient } from "../client.js";
import type { Config } from "../config.js";

function resolveIds(
  params: { locationId?: string; groupId?: string },
  config: Config,
): { locationId: string; groupId: string } {
  const locationId = params.locationId || config.ghlLocationId;
  const groupId = params.groupId || config.ghlGroupId;
  if (!locationId) throw new Error("locationId is required (pass it or set GHL_LOCATION_ID)");
  if (!groupId) throw new Error("groupId is required (pass it or set GHL_GROUP_ID)");
  return { locationId, groupId };
}

function ok(data: unknown) {
  return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
}

function err(e: unknown) {
  const message = e instanceof Error ? e.message : String(e);
  return { content: [{ type: "text" as const, text: message }], isError: true };
}

const locationIdSchema = z.string().optional().describe("GHL location ID (falls back to GHL_LOCATION_ID env var)");
const groupIdSchema = z.string().optional().describe("GHL group ID (falls back to GHL_GROUP_ID env var)");

export function registerPostTools(server: McpServer, client: GhlClient, config: Config) {
  // 1. get_channel_posts
  server.registerTool("get_channel_posts", {
    description: "Get posts from a specific channel",
    inputSchema: {
      locationId: locationIdSchema,
      groupId: groupIdSchema,
      channelId: z.string().describe("Channel ID to fetch posts from"),
      limit: z.number().optional().describe("Max number of posts to return"),
      offset: z.number().optional().describe("Offset for pagination"),
    },
  }, async (params) => {
    try {
      const { locationId, groupId } = resolveIds(params, config);
      const data = await client.get(
        `/${locationId}/groups/${groupId}/channels/${params.channelId}/posts`,
        { limit: params.limit, offset: params.offset },
      );
      return ok(data);
    } catch (e) {
      return err(e);
    }
  });

  // 2. get_post
  server.registerTool("get_post", {
    description: "Get a single post by ID",
    inputSchema: {
      locationId: locationIdSchema,
      groupId: groupIdSchema,
      postId: z.string().describe("Post ID to fetch"),
    },
  }, async (params) => {
    try {
      const { locationId, groupId } = resolveIds(params, config);
      const data = await client.get(`/${locationId}/groups/${groupId}/posts/${params.postId}`);
      return ok(data);
    } catch (e) {
      return err(e);
    }
  });

  // 3. get_public_posts
  server.registerTool("get_public_posts", {
    description: "Get public posts for a group",
    inputSchema: {
      locationId: locationIdSchema,
      groupId: groupIdSchema,
      limit: z.number().optional().describe("Max number of posts to return"),
      offset: z.number().optional().describe("Offset for pagination"),
    },
  }, async (params) => {
    try {
      const { locationId, groupId } = resolveIds(params, config);
      const data = await client.get(
        `/${locationId}/groups/${groupId}/public/posts`,
        { limit: params.limit, offset: params.offset },
      );
      return ok(data);
    } catch (e) {
      return err(e);
    }
  });

  // 4. get_posts_by_user
  server.registerTool("get_posts_by_user", {
    description: "Get posts filtered by user",
    inputSchema: {
      locationId: locationIdSchema,
      groupId: groupIdSchema,
      userId: z.string().optional().describe("User ID to filter posts by"),
      limit: z.number().optional().describe("Max number of posts to return"),
      offset: z.number().optional().describe("Offset for pagination"),
    },
  }, async (params) => {
    try {
      const { locationId, groupId } = resolveIds(params, config);
      const data = await client.get(
        `/${locationId}/groups/${groupId}/posts`,
        { userId: params.userId, limit: params.limit, offset: params.offset },
      );
      return ok(data);
    } catch (e) {
      return err(e);
    }
  });

  // 5. get_user_home_timeline
  server.registerTool("get_user_home_timeline", {
    description: "Get home timeline for a specific user",
    inputSchema: {
      locationId: locationIdSchema,
      groupId: groupIdSchema,
      userId: z.string().describe("User ID for the home timeline"),
      limit: z.number().optional().describe("Max number of posts to return"),
      offset: z.number().optional().describe("Offset for pagination"),
    },
  }, async (params) => {
    try {
      const { locationId, groupId } = resolveIds(params, config);
      const data = await client.get(
        `/${locationId}/groups/${groupId}/${params.userId}/home-timeline`,
        { limit: params.limit, offset: params.offset },
      );
      return ok(data);
    } catch (e) {
      return err(e);
    }
  });

  // 6. get_channel_pinned_posts
  server.registerTool("get_channel_pinned_posts", {
    description: "Get pinned posts for a specific channel",
    inputSchema: {
      locationId: locationIdSchema,
      groupId: groupIdSchema,
      channelId: z.string().describe("Channel ID"),
    },
  }, async (params) => {
    try {
      const { locationId, groupId } = resolveIds(params, config);
      const data = await client.get(
        `/${locationId}/groups/${groupId}/channels/${params.channelId}/posts/pinned`,
      );
      return ok(data);
    } catch (e) {
      return err(e);
    }
  });

  // 7. get_home_pinned_posts
  server.registerTool("get_home_pinned_posts", {
    description: "Get pinned posts for the group home feed",
    inputSchema: {
      locationId: locationIdSchema,
      groupId: groupIdSchema,
    },
  }, async (params) => {
    try {
      const { locationId, groupId } = resolveIds(params, config);
      const data = await client.get(`/${locationId}/groups/${groupId}/posts/pinned`);
      return ok(data);
    } catch (e) {
      return err(e);
    }
  });

  // 8. create_post
  server.registerTool("create_post", {
    description: "Create a new post in a channel",
    inputSchema: {
      locationId: locationIdSchema,
      groupId: groupIdSchema,
      channelId: z.string().describe("Channel ID to create the post in"),
      title: z.string().optional().describe("Post title"),
      body: z.string().describe("Post body content (HTML supported)"),
      mediaUrls: z.array(z.string()).optional().describe("Array of media URLs to attach"),
    },
  }, async (params) => {
    try {
      const { locationId, groupId } = resolveIds(params, config);
      const payload: Record<string, unknown> = { body: params.body };
      if (params.title) payload.title = params.title;
      if (params.mediaUrls) payload.mediaUrls = params.mediaUrls;
      const data = await client.post(
        `/${locationId}/groups/${groupId}/channels/${params.channelId}/posts`,
        payload,
      );
      return ok(data);
    } catch (e) {
      return err(e);
    }
  });

  // 9. update_post
  server.registerTool("update_post", {
    description: "Update an existing post's content",
    inputSchema: {
      locationId: locationIdSchema,
      groupId: groupIdSchema,
      channelId: z.string().describe("Channel ID the post belongs to"),
      postId: z.string().describe("Post ID to update"),
      title: z.string().optional().describe("Updated post title"),
      body: z.string().optional().describe("Updated post body content (HTML supported)"),
      mediaUrls: z.array(z.string()).optional().describe("Updated media URLs"),
    },
  }, async (params) => {
    try {
      const { locationId, groupId } = resolveIds(params, config);
      const payload: Record<string, unknown> = { action: "UPDATE_POST" };
      if (params.title !== undefined) payload.title = params.title;
      if (params.body !== undefined) payload.body = params.body;
      if (params.mediaUrls !== undefined) payload.mediaUrls = params.mediaUrls;
      const data = await client.patch(
        `/${locationId}/groups/${groupId}/channels/${params.channelId}/posts/${params.postId}`,
        payload,
      );
      return ok(data);
    } catch (e) {
      return err(e);
    }
  });

  // 10. update_post_channel
  server.registerTool("update_post_channel", {
    description: "Move a post to a different channel",
    inputSchema: {
      locationId: locationIdSchema,
      groupId: groupIdSchema,
      postId: z.string().describe("Post ID to move"),
      newChannelId: z.string().describe("Destination channel ID"),
    },
  }, async (params) => {
    try {
      const { locationId, groupId } = resolveIds(params, config);
      const data = await client.post(
        `/${locationId}/groups/${groupId}/posts/${params.postId}/update-channel`,
        { channelId: params.newChannelId },
      );
      return ok(data);
    } catch (e) {
      return err(e);
    }
  });

  // 11. update_post_status
  server.registerTool("update_post_status", {
    description: "Update the live status of a post (e.g. draft, published)",
    inputSchema: {
      locationId: locationIdSchema,
      groupId: groupIdSchema,
      postId: z.string().describe("Post ID"),
      status: z.string().describe("New status for the post"),
    },
  }, async (params) => {
    try {
      const { locationId, groupId } = resolveIds(params, config);
      const data = await client.patch(
        `/${locationId}/groups/${groupId}/posts/${params.postId}/live-status`,
        { status: params.status },
      );
      return ok(data);
    } catch (e) {
      return err(e);
    }
  });

  // 12. pin_post_to_channel
  server.registerTool("pin_post_to_channel", {
    description: "Pin a post to its channel",
    inputSchema: {
      locationId: locationIdSchema,
      groupId: groupIdSchema,
      channelId: z.string().describe("Channel ID"),
      postId: z.string().describe("Post ID to pin"),
    },
  }, async (params) => {
    try {
      const { locationId, groupId } = resolveIds(params, config);
      const data = await client.patch(
        `/${locationId}/groups/${groupId}/channels/${params.channelId}/posts/${params.postId}`,
        { action: "PIN_TO_CHANNEL" },
      );
      return ok(data);
    } catch (e) {
      return err(e);
    }
  });

  // 13. pin_post_to_home
  server.registerTool("pin_post_to_home", {
    description: "Pin a post to the group home feed",
    inputSchema: {
      locationId: locationIdSchema,
      groupId: groupIdSchema,
      channelId: z.string().describe("Channel ID the post belongs to"),
      postId: z.string().describe("Post ID to pin"),
    },
  }, async (params) => {
    try {
      const { locationId, groupId } = resolveIds(params, config);
      const data = await client.patch(
        `/${locationId}/groups/${groupId}/channels/${params.channelId}/posts/${params.postId}`,
        { action: "PIN_TO_HOME" },
      );
      return ok(data);
    } catch (e) {
      return err(e);
    }
  });

  // 14. unpin_post_from_channel
  server.registerTool("unpin_post_from_channel", {
    description: "Unpin a post from its channel",
    inputSchema: {
      locationId: locationIdSchema,
      groupId: groupIdSchema,
      channelId: z.string().describe("Channel ID"),
      postId: z.string().describe("Post ID to unpin"),
    },
  }, async (params) => {
    try {
      const { locationId, groupId } = resolveIds(params, config);
      const data = await client.patch(
        `/${locationId}/groups/${groupId}/channels/${params.channelId}/posts/${params.postId}`,
        { action: "UNPIN_FROM_CHANNEL" },
      );
      return ok(data);
    } catch (e) {
      return err(e);
    }
  });

  // 15. unpin_post_from_home
  server.registerTool("unpin_post_from_home", {
    description: "Unpin a post from the group home feed",
    inputSchema: {
      locationId: locationIdSchema,
      groupId: groupIdSchema,
      channelId: z.string().describe("Channel ID the post belongs to"),
      postId: z.string().describe("Post ID to unpin"),
    },
  }, async (params) => {
    try {
      const { locationId, groupId } = resolveIds(params, config);
      const data = await client.patch(
        `/${locationId}/groups/${groupId}/channels/${params.channelId}/posts/${params.postId}`,
        { action: "UNPIN_FROM_HOME" },
      );
      return ok(data);
    } catch (e) {
      return err(e);
    }
  });

  // 16. toggle_post_comments
  server.registerTool("toggle_post_comments", {
    description: "Enable or disable comments on a post",
    inputSchema: {
      locationId: locationIdSchema,
      groupId: groupIdSchema,
      channelId: z.string().describe("Channel ID the post belongs to"),
      postId: z.string().describe("Post ID"),
      enable: z.boolean().describe("true to enable comments, false to disable"),
    },
  }, async (params) => {
    try {
      const { locationId, groupId } = resolveIds(params, config);
      const action = params.enable ? "ENABLE_COMMENTS" : "DISABLE_COMMENTS";
      const data = await client.patch(
        `/${locationId}/groups/${groupId}/channels/${params.channelId}/posts/${params.postId}`,
        { action },
      );
      return ok(data);
    } catch (e) {
      return err(e);
    }
  });

  // 17. delete_post
  server.registerTool("delete_post", {
    description: "Delete a post",
    inputSchema: {
      locationId: locationIdSchema,
      groupId: groupIdSchema,
      postId: z.string().describe("Post ID to delete"),
    },
  }, async (params) => {
    try {
      const { locationId, groupId } = resolveIds(params, config);
      const data = await client.delete(`/${locationId}/groups/${groupId}/posts/${params.postId}`);
      return ok(data);
    } catch (e) {
      return err(e);
    }
  });

  // 18. mark_posts_read_bulk
  server.registerTool("mark_posts_read_bulk", {
    description: "Mark multiple posts as read in bulk",
    inputSchema: {
      locationId: locationIdSchema,
      groupId: groupIdSchema,
      postIds: z.array(z.string()).describe("Array of post IDs to mark as read"),
    },
  }, async (params) => {
    try {
      const { locationId, groupId } = resolveIds(params, config);
      const data = await client.post(
        `/${locationId}/groups/${groupId}/posts/read-bulk`,
        { postIds: params.postIds },
      );
      return ok(data);
    } catch (e) {
      return err(e);
    }
  });
}
