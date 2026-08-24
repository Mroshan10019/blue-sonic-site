
(() => {
  "use strict";

  const header = document.querySelector(".site-header");
  const navToggle = document.querySelector(".nav-toggle");
  const nav = document.querySelector(".nav");
  const year = document.getElementById("year");

  if (year) year.textContent = new Date().getFullYear();

  const updateHeader = () => {
    if (!header) return;
    header.classList.toggle("scrolled", window.scrollY > 18);
  };
  updateHeader();
  window.addEventListener("scroll", updateHeader, { passive: true });

  if (navToggle && nav) {
    navToggle.addEventListener("click", () => {
      const open = nav.classList.toggle("open");
      navToggle.setAttribute("aria-expanded", String(open));
    });

    nav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        nav.classList.remove("open");
        navToggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  const reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });

    reveals.forEach((el) => observer.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add("in"));
  }

  /* ======================================================
     BLUE SONIC PREMIUM MASCOT INTRO
     ====================================================== */

  const intro = document.getElementById("sonicPremiumIntro");
  const frameEl = document.getElementById("sonicPremiumFrame");
  const soundButton = document.getElementById("premiumSoundButton");

  if (!intro || !frameEl) return;

  const frames = Array.from({ length: 10 }, (_, i) =>
    `sonic-frame-${String(i + 1).padStart(2, "0")}.png?v=41`
  );

  /* Preload all frames before playback. */
  frames.forEach((src) => {
    const img = new Image();
    img.src = src;
  });

  /* Frame timing in milliseconds.
     Faster through arm-folding frames, slower on shield/logo lock.
  */
  const timeline = [
    { frame: 1, hold: 180, flash: true,  impact: true  },
    { frame: 2, hold: 260, flash: false, impact: false },
    { frame: 3, hold: 250, flash: false, impact: false },
    { frame: 4, hold: 210, flash: false, impact: false },
    { frame: 5, hold: 220, flash: false, impact: false },
    { frame: 6, hold: 220, flash: false, impact: false },
    { frame: 7, hold: 220, flash: false, impact: false },
    { frame: 8, hold: 270, flash: false, impact: true  },
    { frame: 9, hold: 420, flash: true,  impact: true  },
    { frame:10, hold: 900, flash: true,  impact: true  }
  ];

  let audioContext = null;
  let soundPlayed = false;
  let sequenceStarted = false;
  let timer = null;

  const getAudioContext = () => {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return null;
    if (!audioContext) audioContext = new AudioCtx();
    return audioContext;
  };

  const createNoiseBuffer = (ctx, seconds = 1.8) => {
    const buffer = ctx.createBuffer(
      1,
      Math.floor(ctx.sampleRate * seconds),
      ctx.sampleRate
    );
    const data = buffer.getChannelData(0);

    for (let i = 0; i < data.length; i++) {
      const decay = Math.pow(1 - i / data.length, 2.4);
      data[i] = (Math.random() * 2 - 1) * decay;
    }
    return buffer;
  };

  const playThunder = async () => {
    const ctx = getAudioContext();
    if (!ctx) return false;

    try {
      if (ctx.state === "suspended") await ctx.resume();
      if (ctx.state !== "running") return false;

      const now = ctx.currentTime;

      const noise = ctx.createBufferSource();
      noise.buffer = createNoiseBuffer(ctx, 1.8);

      const lowpass = ctx.createBiquadFilter();
      lowpass.type = "lowpass";
      lowpass.frequency.setValueAtTime(230, now);
      lowpass.frequency.exponentialRampToValueAtTime(65, now + 1.65);

      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(0.0001, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.74, now + 0.014);
      noiseGain.gain.exponentialRampToValueAtTime(0.18, now + 0.52);
      noiseGain.gain.exponentialRampToValueAtTime(0.0001, now + 1.78);

      noise.connect(lowpass).connect(noiseGain).connect(ctx.destination);
      noise.start(now);

      const crack = ctx.createBufferSource();
      crack.buffer = createNoiseBuffer(ctx, 0.17);

      const highpass = ctx.createBiquadFilter();
      highpass.type = "highpass";
      highpass.frequency.value = 950;

      const crackGain = ctx.createGain();
      crackGain.gain.setValueAtTime(0.0001, now);
      crackGain.gain.exponentialRampToValueAtTime(0.34, now + 0.004);
      crackGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.15);

      crack.connect(highpass).connect(crackGain).connect(ctx.destination);
      crack.start(now);

      const sub = ctx.createOscillator();
      const subGain = ctx.createGain();
      sub.type = "sine";
      sub.frequency.setValueAtTime(64, now);
      sub.frequency.exponentialRampToValueAtTime(29, now + 0.82);

      subGain.gain.setValueAtTime(0.0001, now);
      subGain.gain.exponentialRampToValueAtTime(0.42, now + 0.02);
      subGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.95);

      sub.connect(subGain).connect(ctx.destination);
      sub.start(now);
      sub.stop(now + 1.0);

      return true;
    } catch (_) {
      return false;
    }
  };

  const sayBlueSonic = () => {
    if (!("speechSynthesis" in window)) return;

    window.speechSynthesis.cancel();

    const line = new SpeechSynthesisUtterance("Blue Sonic");
    line.rate = 0.80;
    line.pitch = 0.70;
    line.volume = 0.95;

    const voices = window.speechSynthesis.getVoices();
    const voice =
      voices.find(v => /en-US/i.test(v.lang) && /male|david|mark|guy/i.test(v.name)) ||
      voices.find(v => /en-US/i.test(v.lang)) ||
      voices[0];

    if (voice) line.voice = voice;

    try {
      window.speechSynthesis.speak(line);
    } catch (_) {}
  };

  const playBrandSound = async () => {
    if (soundPlayed) return true;
    const ok = await playThunder();
    if (!ok) return false;

    soundPlayed = true;
    intro.classList.remove("needs-audio");

    /* Voice lands with the final logo lock-up. */
    window.setTimeout(sayBlueSonic, 2700);
    return true;
  };

  const pulse = (item) => {
    intro.classList.remove("frame-impact", "flash-now");
    void intro.offsetWidth;

    if (item.impact) intro.classList.add("frame-impact");
    if (item.flash) intro.classList.add("flash-now");

    window.setTimeout(() => {
      intro.classList.remove("frame-impact");
    }, 135);
  };

  const finishIntro = () => {
    intro.classList.add("is-finished");
    window.setTimeout(() => {
      intro.setAttribute("aria-hidden", "true");
    }, 650);
  };

  const runSequence = () => {
    if (sequenceStarted) return;
    sequenceStarted = true;

    let index = 0;

    const step = () => {
      const item = timeline[index];
      frameEl.src = frames[item.frame - 1];
      pulse(item);

      index += 1;

      if (index < timeline.length) {
        timer = window.setTimeout(step, item.hold);
      } else {
        timer = window.setTimeout(finishIntro, item.hold);
      }
    };

    step();
  };

  /* Visual animation always starts. */
  runSequence();

  /* Try audio automatically; show tap fallback if browser blocks it. */
  window.setTimeout(async () => {
    const ok = await playBrandSound();
    if (!ok) intro.classList.add("needs-audio");
  }, 120);

  if (soundButton) {
    soundButton.addEventListener("click", async (event) => {
      event.preventDefault();
      event.stopPropagation();
      await playBrandSound();
    });
  }
})();
