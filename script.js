document.addEventListener("DOMContentLoaded", function () {

  /* =========================================
     BLUE SONIC INTRO
     ========================================= */

  const intro = document.getElementById("sonicThunderIntro");

  if (intro) {
    setTimeout(function () {
      intro.classList.add("is-finished");

      setTimeout(function () {
        intro.style.display = "none";
      }, 600);

    }, 2500);
  }


  /* =========================================
     RESTORE HERO + SECTION REVEALS
     ========================================= */

  const reveals = document.querySelectorAll(".reveal");

  if ("IntersectionObserver" in window) {

    const observer = new IntersectionObserver(
      function (entries) {

        entries.forEach(function (entry) {

          if (entry.isIntersecting) {
            entry.target.classList.add("in");
            observer.unobserve(entry.target);
          }

        });

      },
      {
        threshold: 0.08
      }
    );

    reveals.forEach(function (element) {
      observer.observe(element);
    });

  } else {

    reveals.forEach(function (element) {
      element.classList.add("in");
    });

  }


  /* =========================================
     MOBILE MENU
     ========================================= */

  const navToggle = document.querySelector(".nav-toggle");
  const nav = document.querySelector(".nav");

  if (navToggle && nav) {

    navToggle.addEventListener("click", function () {

      const open = nav.classList.toggle("open");

      navToggle.setAttribute(
        "aria-expanded",
        String(open)
      );

    });

    nav.querySelectorAll("a").forEach(function (link) {

      link.addEventListener("click", function () {

        nav.classList.remove("open");

        navToggle.setAttribute(
          "aria-expanded",
          "false"
        );

      });

    });

  }


  /* =========================================
     HEADER SCROLL EFFECT
     ========================================= */

  const header = document.querySelector(".site-header");

  function updateHeader() {

    if (!header) {
      return;
    }

    header.classList.toggle(
      "scrolled",
      window.scrollY > 18
    );

  }

  updateHeader();

  window.addEventListener(
    "scroll",
    updateHeader,
    { passive: true }
  );


  /* =========================================
     FOOTER YEAR
     ========================================= */

  const year = document.getElementById("year");

  if (year) {
    year.textContent = new Date().getFullYear();
  }

});
