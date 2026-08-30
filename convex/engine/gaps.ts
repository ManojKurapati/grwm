/**
 * The Missing Piece Engine.
 *
 * After GRWM has picked the best outfit your wardrobe can actually produce, it
 * asks a narrower question: *what is the smallest single addition that would
 * have made this better?*
 *
 * It answers by simulation, not by vibes — each archetype is inserted into the
 * real wardrobe, the whole recommendation is re-run, and only pieces that
 * measurably raise the score AND unlock outfits across the rest of your life
 * are surfaced.
 */

import { ARCHETYPES, type Archetype } from "./archetypes";
import { evaluateCandidate, type CompatibilityResult, isRedundantWith } from "./compatibility";
import { bestScoreFor } from "./outfits";
import type { EngineContext, EngineItem, EngineProfile } from "./score";

export type Gap = {
  archetype: Archetype;
  /** points the recommended outfit would gain today */
  todayGain: number;
  /** score of the best outfit today once this piece exists */
  improvedScore: number;
  compatibility: CompatibilityResult;
  /** ranking value combining today's gain with wider wardrobe value */
  priority: number;
};

const CANDIDATE_ID_PREFIX = "gap:";

export function archetypeAsItem(archetype: Archetype): EngineItem {
  return {
    id: `${CANDIDATE_ID_PREFIX}${archetype.id}`,
    name: archetype.label,
    spec: archetype.spec,
    wearCount: 0,
    availability: "available",
  };
}

/**
 * Find the strongest wardrobe gaps.
 *
 * @param todayContext the live recommendation context (weather + intent)
 * @param lifeContexts the spread of situations used for wider wardrobe value
 */
export function findGaps(
  wardrobe: EngineItem[],
  profile: EngineProfile,
  todayContext: EngineContext,
  lifeContexts: EngineContext[],
  options: { limit?: number; minTodayGain?: number } = {},
): { gaps: Gap[]; baselineScore: number } {
  const baselineScore = bestScoreFor(wardrobe, todayContext, profile);
  const minTodayGain = options.minTodayGain ?? 1;

  const gaps: Gap[] = [];

  for (const archetype of ARCHETYPES) {
    // Skip anything the user effectively already owns.
    if (wardrobe.some((item) => isRedundantWith(archetype.spec, item.spec))) continue;

    const candidate = archetypeAsItem(archetype);
    const improvedScore = bestScoreFor([...wardrobe, candidate], todayContext, profile);
    const todayGain = improvedScore - baselineScore;

    const compatibility = evaluateCandidate(wardrobe, candidate, profile, lifeContexts);

    // A real gap must help today *or* meaningfully expand the wardrobe.
    const helpsToday = todayGain >= minTodayGain;
    const helpsWardrobe =
      compatibility.newOutfitsUnlocked >= 3 && compatibility.wardrobeCompatibility >= 62;
    if (!helpsToday && !helpsWardrobe) continue;

    gaps.push({
      archetype,
      todayGain,
      improvedScore,
      compatibility,
      priority:
        todayGain * 3.2 +
        compatibility.newOutfitsUnlocked * 0.5 +
        compatibility.wardrobeCompatibility * 0.08 +
        compatibility.occasionCoverageGain.length * 1.1,
    });
  }

  gaps.sort((a, b) => b.priority - a.priority);

  return { gaps: gaps.slice(0, options.limit ?? 3), baselineScore };
}

/**
 * One-line framing of the gap, shown under the outfit result.
 * e.g. "Your wardrobe is missing one thing: brown suede loafers"
 */
export function gapHeadline(gap: Gap): string {
  return gap.archetype.label;
}

export function gapReason(gap: Gap, baselineScore: number): string {
  if (gap.todayGain >= 2) {
    return `Adding this would take tonight's fit from ${baselineScore}% to ${gap.improvedScore}% — ${gap.archetype.rationale}`;
  }
  return gap.archetype.rationale;
}

/** When we tell someone to SKIP a product, tell them what to buy instead. */
export function suggestInsteadOf(
  wardrobe: EngineItem[],
  profile: EngineProfile,
  lifeContexts: EngineContext[],
  excludeCategory?: string,
): Archetype | null {
  let best: { archetype: Archetype; score: number } | null = null;
  for (const archetype of ARCHETYPES) {
    if (wardrobe.some((item) => isRedundantWith(archetype.spec, item.spec))) continue;
    const candidate = archetypeAsItem(archetype);
    const result = evaluateCandidate(wardrobe, candidate, profile, lifeContexts);
    // Prefer a suggestion in the same category so the advice is actionable.
    const categoryBonus = excludeCategory && archetype.spec.category === excludeCategory ? 12 : 0;
    const score = result.wardrobeCompatibility + result.newOutfitsUnlocked * 0.6 + categoryBonus;
    if (!best || score > best.score) best = { archetype, score };
  }
  return best?.archetype ?? null;
}
