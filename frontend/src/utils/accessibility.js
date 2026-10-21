export function calculateSegmentScore(profile, segment) {
  let score = 100;

  const {
    stairs,
    slope,
    ramp,
    surface,
    obstacles,
  } = segment;

  if (profile === "wheelchair") {
    if (stairs) {
      score -= 40;
    }

    if (slope === "high") {
      score -= 25;
    } else if (slope === "medium") {
      score -= 10;
    }

    if (ramp) {
      score += 5;
    }

    if (surface === "poor") {
      score -= 15;
    }

    if (obstacles) {
      score -= 20;
    }
  }

  if (profile === "walking_difficulty") {
    if (stairs) {
      score -= 25;
    }

    if (slope === "high") {
      score -= 20;
    } else if (slope === "medium") {
      score -= 10;
    }

    if (surface === "poor") {
      score -= 10;
    }

    if (obstacles) {
      score -= 15;
    }
  }

  return Math.max(0, Math.min(100, score));
}

export function calculateRouteScore(profile, segments) {
  if (!segments || segments.length === 0) {
    return 0;
  }

  const segmentScores = segments.map((segment) =>
    calculateSegmentScore(profile, segment)
  );

  const total = segmentScores.reduce(
    (sum, score) => sum + score,
    0
  );

  return Math.round(total / segmentScores.length);
}