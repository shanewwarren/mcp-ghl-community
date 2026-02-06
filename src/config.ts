export interface Config {
  ghlToken: string;
  ghlLocationId?: string;
  ghlGroupId?: string;
}

export function loadConfig(): Config {
  const ghlToken = process.env.GHL_TOKEN;
  if (!ghlToken) {
    throw new Error("GHL_TOKEN environment variable is required");
  }

  return {
    ghlToken,
    ghlLocationId: process.env.GHL_LOCATION_ID || undefined,
    ghlGroupId: process.env.GHL_GROUP_ID || undefined,
  };
}
