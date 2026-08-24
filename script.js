

(() => {
  "use strict";

  const header = document.querySelector(".site-header");
  const navToggle = document.querySelector(".nav-toggle");
  const nav = document.querySelector(".nav");
  const year = document.getElementById("year");
  const intro = document.getElementById("sonicIntro");
  const soundButton = document.getElementById("sonicSoundButton");

  /* Existing site behavior */
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
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );

    reveals.forEach((el) => observer.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add("in"));
  }

  /*
   * BLUE SONIC INTRO SOUND
   *
   * Creates a short thunder sound with the Web Audio API.
   * Then uses the browser's speech voice to say "Blue Sonic".
   *
   * IMPORTANT:
   * Most phones and browsers block automatic sound until
   * the visitor interacts with the page. If that happens,
   * the "Tap for thunder" button appears.
   */

  let audioContext = null;
  let soundPlayed = false;

  const getAudioContext = () => {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;

    if (!AudioCtx) return null;

    if (!audioContext) {
      audioContext = new AudioCtx();
    }

    return audioContext;
  };

  const createNoiseBuffer = (ctx, seconds = 1.65) => {
    const buffer = ctx.createBuffer(
      1,
      Math.floor(ctx.sampleRate * seconds),
      ctx.sampleRate
    );

    const data = buffer.getChannelData(0);

    for (let i = 0; i < data.length; i++) {
      const decay = Math.pow(1 - i / data.length, 2.5);
      data[i] = (Math.random() * 2 - 1) * decay;
    }

    return buffer;
  };

  const thunder = async () => {
    const ctx = getAudioContext();

    if (!ctx) return false;

    try {
      if (ctx.state === "suspended") {
        await ctx.resume();
      }

      if (ctx.state !== "running") {
        return false;
      }

      const now = ctx.currentTime;

      /*
       * LOW THUNDER BODY
       */
      const noise = ctx.createBufferSource();
      noise.buffer = createNoiseBuffer(ctx, 1.75);

      const lowpass = ctx.createBiquadFilter();
      lowpass.type = "lowpass";
      lowpass.frequency.setValueAtTime(210, now);
      lowpass.frequency.exponentialRampToValueAtTime(72, now + 1.55);

      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(0.0001, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.72, now + 0.018);
      noiseGain.gain.exponentialRampToValueAtTime(0.18, now + 0.43);
      noiseGain.gain.exponentialRampToValueAtTime(0.0001, now + 1.72);

      noise
        .connect(lowpass)
        .connect(noiseGain)
        .connect(ctx.destination);

      noise.start(now);

      /*
       * LIGHTNING CRACK
       */
      const crack = ctx.createBufferSource();
      crack.buffer = createNoiseBuffer(ctx, 0.19);

      const crackFilter = ctx.createBiquadFilter();
      crackFilter.type = "highpass";
      crackFilter.frequency.value = 1050;

      const crackGain = ctx.createGain();
      crackGain.gain.setValueAtTime(0.0001, now);
      crackGain.gain.exponentialRampToValueAtTime(0.28, now + 0.006);
      crackGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.16);

      crack
        .connect(crackFilter)
        .connect(crackGain)
        .connect(ctx.destination);

      crack.start(now + 0.01);

      /*
       * LOW BASS IMPACT
       */
      const sub = ctx.createOscillator();
      const subGain = ctx.createGain();

      sub.type = "sine";
      sub.frequency.setValueAtTime(62, now);
      sub.frequency.exponentialRampToValueAtTime(31, now + 0.72);

      subGain.gain.setValueAtTime(0.0001, now);
      subGain.gain.exponentialRampToValueAtTime(0.40, now + 0.02);
      subGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.88);

      sub
        .connect(subGain)
        .connect(ctx.destination);

      sub.start(now);
      sub.stop(now + 0.92);

      return true;
    } catch (error) {
      return false;
    }
  };

  const sayBlueSonic = () => {
    if (!("speechSynthesis" in window)) {
      return;
    }

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance("Blue Sonic");

    utterance.rate = 0.83;
    utterance.pitch = 0.72;
    utterance.volume = 0.92;

    const voices = window.speechSynthesis.getVoices();

    const preferredVoice =
      voices.find(
        (voice) =>
          /en-US/i.test(voice.lang) &&
          /male|david|mark|guy/i.test(voice.name)
      ) ||
      voices.find((voice) => /en-US/i.test(voice.lang)) ||
      voices[0];

    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    window.setTimeout(() => {
      try {
        window.speechSynthesis.speak(utterance);
      } catch (error) {}
    }, 760);
  };

  const playBrandSound = async () => {
    if (soundPlayed) {
      return true;
    }

    const success = await thunder();

    if (!success) {
      return false;
    }

    soundPlayed = true;

    sayBlueSonic();

    if (intro) {
      intro.classList.remove("needs-audio");
    }

    return true;
  };

  const finishIntro = () => {
    if (!intro) return;

    intro.classList.add("is-finished");

    window.setTimeout(() => {
      intro.setAttribute("aria-hidden", "true");
    }, 600);
  };

  if (intro) {
    /*
     * Try to play the sound automatically.
     * Some browsers will block this.
     */
    window.setTimeout(async () => {
      const success = await playBrandSound();

      if (!success) {
        intro.classList.add("needs-audio");
      }
    }, 250);

    /*
     * Finish visual intro after 3 seconds,
     * even if the browser blocked sound.
     */
    window.setTimeout(() => {
      finishIntro();
    }, 3000);

    /*
     * If sound was blocked, visitor can tap this button.
     */
    if (soundButton) {
      soundButton.addEventListener("click", async (event) => {
        event.preventDefault();
        event.stopPropagation();

        await playBrandSound();

        window.setTimeout(() => {
          finishIntro();
        }, 1850);
      });
    }
  }
})();
