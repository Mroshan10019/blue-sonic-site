(() => {
  "use strict";

  const header = document.querySelector(".site-header");
  const navToggle = document.querySelector(".nav-toggle");
  const nav = document.querySelector(".nav");
  const year = document.getElementById("year");

  if (year) {
    year.textContent = new Date().getFullYear();
  }

  const updateHeader = () => {
    if (!header) return;

    header.classList.toggle("scrolled", window.scrollY > 18);
  };

  updateHeader();

  window.addEventListener("scroll", updateHeader, {
    passive: true
  });

  if (navToggle && nav) {
    navToggle.addEventListener("click", () => {
      const open = nav.classList.toggle("open");

      navToggle.setAttribute(
        "aria-expanded",
        String(open)
      );
    });

    nav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        nav.classList.remove("open");

        navToggle.setAttribute(
          "aria-expanded",
          "false"
        );
      });
    });
  }

  const reveals = document.querySelectorAll(".reveal");

  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in");
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.12
      }
    );

    reveals.forEach((el) => {
      observer.observe(el);
    });
  } else {
    reveals.forEach((el) => {
      el.classList.add("in");
    });
  }

  /*
   * BLUE SONIC SIMPLE THUNDER INTRO
   *
   * Sequence:
   * 1. Lightning flashes
   * 2. Blue Sonic logo pops into place
   * 3. Electric sweep crosses the logo
   * 4. Intro fades away
   *
   * Thunder audio is attempted automatically.
   * Some mobile browsers block automatic audio,
   * so a "Tap for thunder" button appears if needed.
   */

  const intro = document.getElementById("sonicThunderIntro");
  const audioButton = document.getElementById("sonicThunderAudio");

  if (!intro) {
    return;
  }

  let audioContext = null;
  let thunderPlayed = false;

  const getAudioContext = () => {
    const AudioCtx =
      window.AudioContext ||
      window.webkitAudioContext;

    if (!AudioCtx) {
      return null;
    }

    if (!audioContext) {
      audioContext = new AudioCtx();
    }

    return audioContext;
  };

  const createNoiseBuffer = (
    ctx,
    seconds = 1.45
  ) => {
    const buffer = ctx.createBuffer(
      1,
      Math.floor(ctx.sampleRate * seconds),
      ctx.sampleRate
    );

    const data = buffer.getChannelData(0);

    for (let i = 0; i < data.length; i++) {
      const decay = Math.pow(
        1 - i / data.length,
        2.45
      );

      data[i] =
        (Math.random() * 2 - 1) * decay;
    }

    return buffer;
  };

  const playThunder = async () => {
    if (thunderPlayed) {
      return true;
    }

    const ctx = getAudioContext();

    if (!ctx) {
      return false;
    }

    try {
      if (ctx.state === "suspended") {
        await ctx.resume();
      }

      if (ctx.state !== "running") {
        return false;
      }

      const now = ctx.currentTime;

      /*
       * DEEP THUNDER RUMBLE
       */
      const rumble = ctx.createBufferSource();

      rumble.buffer =
        createNoiseBuffer(ctx, 1.55);

      const lowpass =
        ctx.createBiquadFilter();

      lowpass.type = "lowpass";

      lowpass.frequency.setValueAtTime(
        220,
        now
      );

      lowpass.frequency
        .exponentialRampToValueAtTime(
          68,
          now + 1.4
        );

      const rumbleGain =
        ctx.createGain();

      rumbleGain.gain.setValueAtTime(
        0.0001,
        now
      );

      rumbleGain.gain
        .exponentialRampToValueAtTime(
          0.72,
          now + 0.018
        );

      rumbleGain.gain
        .exponentialRampToValueAtTime(
          0.18,
          now + 0.44
        );

      rumbleGain.gain
        .exponentialRampToValueAtTime(
          0.0001,
          now + 1.5
        );

      rumble
        .connect(lowpass)
        .connect(rumbleGain)
        .connect(ctx.destination);

      rumble.start(now);

      /*
       * SHARP LIGHTNING CRACK
       */
      const crack =
        ctx.createBufferSource();

      crack.buffer =
        createNoiseBuffer(ctx, 0.17);

      const highpass =
        ctx.createBiquadFilter();

      highpass.type = "highpass";
      highpass.frequency.value = 1050;

      const crackGain =
        ctx.createGain();

      crackGain.gain.setValueAtTime(
        0.0001,
        now
      );

      crackGain.gain
        .exponentialRampToValueAtTime(
          0.30,
          now + 0.005
        );

      crackGain.gain
        .exponentialRampToValueAtTime(
          0.0001,
          now + 0.15
        );

      crack
        .connect(highpass)
        .connect(crackGain)
        .connect(ctx.destination);

      crack.start(now);

      /*
       * LOW BASS IMPACT
       */
      const sub =
        ctx.createOscillator();

      const subGain =
        ctx.createGain();

      sub.type = "sine";

      sub.frequency.setValueAtTime(
        62,
        now
      );

      sub.frequency
        .exponentialRampToValueAtTime(
          31,
          now + 0.76
        );

      subGain.gain.setValueAtTime(
        0.0001,
        now
      );

      subGain.gain
        .exponentialRampToValueAtTime(
          0.38,
          now + 0.02
        );

      subGain.gain
        .exponentialRampToValueAtTime(
          0.0001,
          now + 0.84
        );

      sub
        .connect(subGain)
        .connect(ctx.destination);

      sub.start(now);
      sub.stop(now + 0.9);

      thunderPlayed = true;

      intro.classList.remove(
        "needs-audio"
      );

      return true;

    } catch (error) {
      return false;
    }
  };

  const finishIntro = () => {
    intro.classList.add(
      "is-finished"
    );

    window.setTimeout(() => {
      intro.setAttribute(
        "aria-hidden",
        "true"
      );
    }, 600);
  };

  /*
   * Try to play thunder automatically.
   * Some mobile browsers may block it.
   */
  window.setTimeout(
    async () => {
      const success =
        await playThunder();

      if (!success) {
        intro.classList.add(
          "needs-audio"
        );
      }
    },
    120
  );

  /*
   * Fade away and reveal the website.
   */
  window.setTimeout(
    finishIntro,
    2400
  );

  /*
   * If autoplay is blocked,
   * let the visitor tap for thunder.
   */
  if (audioButton) {
    audioButton.addEventListener(
      "click",
      async (event) => {
        event.preventDefault();
        event.stopPropagation();

        await playThunder();
      }
    );
  }
})();
