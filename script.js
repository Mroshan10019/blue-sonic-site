document.addEventListener("DOMContentLoaded", function () {

  const intro = document.getElementById("sonicThunderIntro");

  if (!intro) {
    return;
  }

  // Automatically remove the intro after 2.5 seconds
  setTimeout(function () {
    intro.classList.add("is-finished");

    setTimeout(function () {
      intro.style.display = "none";
    }, 600);

  }, 2500);

});
