/**
 * Design Confidence (user amendment #7).
 *
 * Distinguishes measured/user-verified inputs from estimates so the design
 * never presents estimated values as facts. Produces a 1-5 star score and
 * a per-item breakdown for the confidence panel and the proposal.
 */

export function assessConfidence({
  locationConfirmed = false,
  roofDrawn = false,
  tiltUserEdited = false,
  yieldSource = "table",
  usageProvided = false,
  obstaclesMarked = false,
}) {
  const items = [];

  items.push({
    key: "location",
    label: "Location",
    status: locationConfirmed ? "verified" : "estimated",
    note: locationConfirmed ? "Pin confirmed by you" : "Geocoded — pin not confirmed",
  });

  items.push({
    key: "roof",
    label: "Roof outline",
    status: roofDrawn ? "verified" : "estimated",
    note: roofDrawn ? "Drawn by you on satellite imagery" : "Not drawn",
  });

  items.push({
    key: "tilt",
    label: "Tilt / mounting",
    status: tiltUserEdited ? "verified" : "default",
    note: tiltUserEdited
      ? "Provided by you — confirm on site"
      : "Standard default — requires on-site verification",
  });

  const yieldVerified = yieldSource === "pvgis" || yieldSource === "nasa-power";
  items.push({
    key: "irradiance",
    label: "Solar resource",
    status: yieldVerified ? "verified" : "estimated",
    note:
      yieldSource === "pvgis"
        ? "PVGIS satellite-derived data for this location"
        : yieldSource === "nasa-power"
        ? "NASA POWER satellite-derived data"
        : "Regional average table — remote data unavailable",
  });

  items.push({
    key: "usage",
    label: "Electricity usage",
    status: usageProvided ? "verified" : "estimated",
    note: usageProvided ? "Entered by you" : "Skipped — sized to roof capacity",
  });

  items.push({
    key: "shading",
    label: "Shading",
    status: obstaclesMarked ? "estimated" : "default",
    note: obstaclesMarked
      ? "Roof obstacles marked; surrounding buildings/trees not simulated"
      : "No obstacles marked; shading not simulated",
  });

  const score = items.reduce((sum, item) => {
    if (item.status === "verified") return sum + 1;
    if (item.status === "estimated") return sum + 0.5;
    return sum + 0.25;
  }, 0);

  return {
    stars: Math.max(1, Math.round((score / items.length) * 5)),
    items,
  };
}
