import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import TinkerHubMascot from './TinkerHubMascot';

jest.mock('../../utils/api/weatherService', () => ({
  getCurrentWeather: jest.fn(() => Promise.resolve(null)),
}));

describe('TinkerHubMascot fail-safe lifecycle', () => {
  let container;
  let root;
  let originalImage;

  beforeEach(() => {
    global.IS_REACT_ACT_ENVIRONMENT = true;
    jest.useFakeTimers();
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
    originalImage = global.Image;

    global.Image = class {
      set src(_value) {
        setTimeout(() => this.onerror?.(), 0);
      }
    };
  });

  afterEach(() => {
    act(() => {
      root.unmount();
    });
    document.body.removeChild(container);
    global.Image = originalImage;
    jest.useRealTimers();
    delete global.IS_REACT_ACT_ENVIRONMENT;
  });

  it('does not resume mascot scheduling after fail-safe activation', async () => {
    const setTimeoutSpy = jest.spyOn(window, 'setTimeout');

    await act(async () => {
      root.render(
        <TinkerHubMascot
          makerCount={1}
          currentView="makers"
          isVisible
        />,
      );
      await Promise.resolve();
    });

    await act(async () => {
      jest.runOnlyPendingTimers();
      await Promise.resolve();
    });

    expect(container.querySelector('.tinkerhub-mascot--fallback')).not.toBeNull();

    setTimeoutSpy.mockClear();

    await act(async () => {
      root.render(
        <TinkerHubMascot
          makerCount={2}
          currentView="makers"
          isVisible
        />,
      );
      await Promise.resolve();
    });

    expect(container.querySelector('.tinkerhub-mascot--fallback')).not.toBeNull();
    expect(setTimeoutSpy).not.toHaveBeenCalled();

    setTimeoutSpy.mockRestore();
  });
});
