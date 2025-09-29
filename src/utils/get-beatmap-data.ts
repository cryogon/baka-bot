const beatmapCache = new Map();

export async function getBeatmapData(beatmapId: number) {
  // Check memory cache first
  if (beatmapCache.has(beatmapId)) {
    return beatmapCache.get(beatmapId) as ArrayBuffer;
  }

  // Download and cache in memory
  const response = await fetch(`https://osu.ppy.sh/osu/${beatmapId}`);
  const beatmapData = await response.arrayBuffer();

  // Store in memory (be careful with memory usage)
  beatmapCache.set(beatmapId, beatmapData);
  return beatmapData;
}
