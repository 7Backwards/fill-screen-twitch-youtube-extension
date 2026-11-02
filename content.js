(() => {
  // Where to put the button on each site: inside `controls`, just left of `fullscreen`.
  const SITES = {
    twitch: {
      controls: ".player-controls__right-control-group",
      fullscreen: '[data-a-target="player-fullscreen-button"]',
    },
    youtube: {
      controls: ".ytp-right-controls-right",
      fullscreen: ".ytp-fullscreen-button",
    },
  };
  const site = location.hostname.endsWith("youtube.com") ? SITES.youtube : SITES.twitch;

  const MODE_ATTR = "data-tfs-mode";
  const BUTTON_CLASS = "tfs-button";
  const SVG_NS = "http://www.w3.org/2000/svg";

  // Click order. "fit" is Twitch's default (letterboxed); the others are applied via content.css.
  const MODES = [
    {
      id: "fit",
      label: "Fit",
      // Arrows pointing outward.
      path: "M2 2h6v2H5.41l3.3 3.29-1.42 1.42L4 5.41V8H2V2zm16 0v6h-2V5.41l-3.29 3.3-1.42-1.42L14.59 4H12V2h6zM2 18v-6h2v2.59l3.29-3.3 1.42 1.42L5.41 16H8v2H2zm16 0h-6v-2h2.59l-3.3-3.29 1.42-1.42L16 14.59V12h2v6z",
    },
    {
      id: "stretch",
      label: "Stretch",
      // Horizontal double arrow.
      path: "M1 10l5-5v3.5h8V5l5 5-5 5v-3.5H6V15z",
    },
    {
      id: "crop",
      label: "Crop",
      // Crop marks.
      path: "M5 1h2v12h12v2H5zM1 5h14v14h-2V7H1z",
    },
  ];

  const STORAGE_KEY = "mode";

  let modeIndex = 0;

  function createIcon() {
    const svg = document.createElementNS(SVG_NS, "svg");
    svg.setAttribute("viewBox", "0 0 20 20");
    svg.setAttribute("aria-hidden", "true");
    svg.appendChild(document.createElementNS(SVG_NS, "path"));
    return svg;
  }

  function render(button) {
    const mode = MODES[modeIndex];
    const next = MODES[(modeIndex + 1) % MODES.length];
    const label = `Video: ${mode.label} (click for ${next.label})`;
    button.querySelector("path").setAttribute("d", mode.path);
    button.setAttribute("aria-label", label);
    button.title = label;
  }

  function applyMode(id) {
    const index = MODES.findIndex((m) => m.id === id);
    modeIndex = index === -1 ? 0 : index;
    document.documentElement.setAttribute(MODE_ATTR, MODES[modeIndex].id);
    document.querySelectorAll(`.${BUTTON_CLASS}`).forEach(render);
  }

  function cycle() {
    const next = MODES[(modeIndex + 1) % MODES.length].id;
    applyMode(next);
    browser.storage.local.set({ [STORAGE_KEY]: next });
  }

  function injectButtons() {
    document.querySelectorAll(site.controls).forEach((group) => {
      if (group.querySelector(`.${BUTTON_CLASS}`)) return;

      const button = document.createElement("button");
      button.type = "button";
      button.className = BUTTON_CLASS;
      button.appendChild(createIcon());
      button.addEventListener("click", (e) => {
        e.stopPropagation();
        cycle();
      });
      render(button);

      // Sit just left of the fullscreen button; fall back to the end of the group.
      let anchor = group.querySelector(site.fullscreen);
      while (anchor && anchor.parentElement !== group) anchor = anchor.parentElement;
      group.insertBefore(button, anchor);
    });
  }

  // Restore the saved mode, and follow changes made in other Twitch tabs.
  browser.storage.local.get(STORAGE_KEY).then((data) => applyMode(data[STORAGE_KEY]));
  browser.storage.onChanged.addListener((changes, area) => {
    if (area === "local" && STORAGE_KEY in changes) applyMode(changes[STORAGE_KEY].newValue);
  });

  // Twitch is a SPA and re-renders the player on navigation, so keep re-injecting.
  injectButtons();
  new MutationObserver(injectButtons).observe(document.body, {
    childList: true,
    subtree: true,
  });
})();
