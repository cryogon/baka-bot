import type { UserBestScore, UserScore } from "osu-web.js";
import * as rosu from "rosu-pp-js";

const FREE_MEMORY_IN = 10; // in sec

/**
 * can Throw
 * @param score
 */
export async function getScore(score: UserScore | UserBestScore) {
  if (!score || !score.beatmap) throw new Error("No Recent Score Found");
  const response = await fetch(`https://osu.ppy.sh/osu/${score.beatmap.id}`);
  const beatmapData = await response.arrayBuffer();
  const beatmap = new rosu.Beatmap(Buffer.from(beatmapData));

  const perf = new rosu.Performance({
    mods: score.mods || [], // Mod combination as bitwise value
    accuracy: score.accuracy * 100, // Accuracy as percentage (0-100)
    combo: score.max_combo, // Max combo achieved
    misses: score.statistics.miss || 0, // Number of misses
    n300: score.statistics.great, // Perfect hits
    n100: score.statistics.ok, // Good hits
    n50: score.statistics.meh, // Okay hits,
  });
  const result = perf.calculate(beatmap);
  const ifFcPerf = new rosu.Performance({
    mods: score.mods || [], // Mod combination as bitwise value
    accuracy: score.accuracy * 100, // Accuracy as percentage (0-100)
    combo: score.max_combo, // Max combo achieved
    misses: score.statistics.miss || 0, // Number of misses
    n300: Math.max(
      (result.difficulty.maxCombo || 0) -
        (score.statistics?.ok || 0) -
        (score.statistics?.meh || 0) -
        (score.statistics?.miss || 0),
      0
    ), // Perfect hits
    n100: score.statistics.ok, // Good hits
    n50: score.statistics.meh, // Okay hits
  });
  const ifFcResult = ifFcPerf.calculate(beatmap);

  const maxPerf = new rosu.Performance({
    mods: score.mods || [], // Mod combination as bitwise value
    accuracy: score.accuracy * 100, // Accuracy as percentage (0-100)
    combo: score.max_combo, // Max combo achieved
    n300: result.difficulty.maxCombo,
  });
  const maxResult = maxPerf.calculate(beatmap);
  // free memory after some time
  setTimeout(() => {
    result.free();
    ifFcResult.free();
    maxResult.free();
  }, FREE_MEMORY_IN * 1000);

  return { result, ifFcResult, maxResult };
}
