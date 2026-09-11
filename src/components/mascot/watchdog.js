import { getPlayback } from './playback';

export function getMascotAssetUrl(publicBase, assetPath, version) {
  const separator = assetPath.includes('?') ? '&' : '?';
  return `${publicBase}${assetPath}${separator}v=${encodeURIComponent(version)}`;
}

export function getMascotWatchdogFailure({
  now,
  pose,
  poseEndsAt,
  lastAnimationHeartbeatAt,
  hasAwakened,
  schedulerGraceMs,
  animationGraceMs,
}) {
  if (poseEndsAt > 0 && now - poseEndsAt > schedulerGraceMs) {
    return 'scheduler-timeout';
  }

  const playback = getPlayback(pose);
  const isLoopingPose = !Number.isFinite(playback.cycles);
  const animationDeadline = Math.max(animationGraceMs, pose.cycle * 2 + animationGraceMs);

  if (hasAwakened && isLoopingPose && now - lastAnimationHeartbeatAt > animationDeadline) {
    return 'animation-stalled';
  }

  return null;
}
