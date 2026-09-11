import {
  getMascotAssetUrl,
  getMascotWatchdogFailure,
} from './watchdog';

describe('mascot watchdog helpers', () => {
  it('adds a version query to mascot assets', () => {
    expect(getMascotAssetUrl('', '/images/mascot/dont-look/sprites/sun.webp', 'build 1'))
      .toBe('/images/mascot/dont-look/sprites/sun.webp?v=build%201');
  });

  it('reports a stuck scheduler after the pose deadline grace window', () => {
    expect(getMascotWatchdogFailure({
      now: 20000,
      pose: { cycle: 1000 },
      poseEndsAt: 4000,
      lastAnimationHeartbeatAt: 19000,
      hasAwakened: true,
      schedulerGraceMs: 10000,
      animationGraceMs: 15000,
    })).toBe('scheduler-timeout');
  });

  it('reports a stalled looping animation heartbeat', () => {
    expect(getMascotWatchdogFailure({
      now: 40000,
      pose: { cycle: 4000 },
      poseEndsAt: 90000,
      lastAnimationHeartbeatAt: 10000,
      hasAwakened: true,
      schedulerGraceMs: 10000,
      animationGraceMs: 15000,
    })).toBe('animation-stalled');
  });

  it('does not require animation heartbeats from finite one-shot poses', () => {
    expect(getMascotWatchdogFailure({
      now: 40000,
      pose: { cycle: 4000, playback: { cycles: 1 } },
      poseEndsAt: 90000,
      lastAnimationHeartbeatAt: 10000,
      hasAwakened: true,
      schedulerGraceMs: 10000,
      animationGraceMs: 15000,
    })).toBeNull();
  });
});
