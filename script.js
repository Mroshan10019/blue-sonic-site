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
})();
