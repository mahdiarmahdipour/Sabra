(() => {
  const root = document.documentElement;
  const themeToggle = document.querySelector(".theme-toggle");
  const themeLabel = document.querySelector(".theme-toggle__label");
  const themeMeta = document.querySelector('meta[name="theme-color"]');
  const menuToggle = document.querySelector(".menu-toggle");
  const routeLinks = [...document.querySelectorAll("[data-route]")];
  const navLinks = [...document.querySelectorAll(".site-nav [data-route]")];
  const pages = [...document.querySelectorAll("[data-page]")];
  const video = document.querySelector("video");

  const routes = new Set(["home", "show", "tickets", "about"]);

  function applyTheme(theme) {
    const isDark = theme === "dark";
    root.dataset.theme = theme;
    localStorage.setItem("sabra-theme", theme);
    themeToggle.setAttribute("aria-label", isDark ? "فعال‌کردن تم روز" : "فعال‌کردن تم شب");
    themeLabel.textContent = isDark ? "تم روز" : "تم شب";
    themeMeta.setAttribute("content", isDark ? "#061011" : "#f7f3ef");
  }

  applyTheme(root.dataset.theme === "dark" ? "dark" : "light");

  themeToggle.addEventListener("click", () => {
    applyTheme(root.dataset.theme === "dark" ? "light" : "dark");
  });

  function closeMenu() {
    document.body.classList.remove("menu-open");
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "باز کردن فهرست");
  }

  menuToggle.addEventListener("click", () => {
    const willOpen = !document.body.classList.contains("menu-open");
    document.body.classList.toggle("menu-open", willOpen);
    menuToggle.setAttribute("aria-expanded", String(willOpen));
    menuToggle.setAttribute("aria-label", willOpen ? "بستن فهرست" : "باز کردن فهرست");
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeMenu();
  });

  function renderRoute() {
    const requested = window.location.hash.replace("#", "") || "home";
    const route = routes.has(requested) ? requested : "home";

    pages.forEach((page) => {
      const active = page.dataset.page === route;
      page.hidden = !active;
      page.classList.toggle("is-active", active);
    });

    navLinks.forEach((link) => {
      const active = link.dataset.route === route;
      link.classList.toggle("is-active", active);
      if (active) link.setAttribute("aria-current", "page");
      else link.removeAttribute("aria-current");
    });

    if (route !== "show" && video && !video.paused) video.pause();
    closeMenu();
    window.scrollTo({ top: 0, behavior: "auto" });
  }

  routeLinks.forEach((link) => {
    link.addEventListener("click", () => {
      const route = link.dataset.route;
      if (window.location.hash === `#${route}`) renderRoute();
    });
  });

  window.addEventListener("hashchange", renderRoute);
  renderRoute();

  const slider = document.querySelector(".hero-slider");
  const slides = [...document.querySelectorAll(".slide")];
  const dots = [...document.querySelectorAll(".slider-dot")];
  const nextButton = document.querySelector("[data-slider-next]");
  const previousButton = document.querySelector("[data-slider-prev]");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let currentSlide = 0;
  let sliderTimer;
  let sliderPaused = false;

  function restartProgress() {
    slider.classList.remove("is-running");
    void slider.offsetWidth;
    if (!reducedMotion && !sliderPaused) slider.classList.add("is-running");
  }

  function showSlide(index) {
    currentSlide = (index + slides.length) % slides.length;
    slides.forEach((slide, slideIndex) => {
      const active = slideIndex === currentSlide;
      slide.classList.toggle("is-active", active);
      slide.setAttribute("aria-hidden", String(!active));
    });
    dots.forEach((dot, dotIndex) => {
      const active = dotIndex === currentSlide;
      dot.classList.toggle("is-active", active);
      dot.setAttribute("aria-selected", String(active));
      dot.tabIndex = active ? 0 : -1;
    });
    restartProgress();
  }

  function stopAutoplay() {
    window.clearInterval(sliderTimer);
    sliderTimer = undefined;
    slider.classList.remove("is-running");
  }

  function startAutoplay() {
    stopAutoplay();
    if (reducedMotion || sliderPaused) return;
    sliderTimer = window.setInterval(() => showSlide(currentSlide + 1), 6500);
    restartProgress();
  }

  nextButton.addEventListener("click", () => {
    showSlide(currentSlide + 1);
    startAutoplay();
  });

  previousButton.addEventListener("click", () => {
    showSlide(currentSlide - 1);
    startAutoplay();
  });

  dots.forEach((dot) => {
    dot.addEventListener("click", () => {
      showSlide(Number(dot.dataset.slide));
      startAutoplay();
    });
  });

  slider.addEventListener("mouseenter", () => {
    sliderPaused = true;
    stopAutoplay();
  });

  slider.addEventListener("mouseleave", () => {
    sliderPaused = false;
    startAutoplay();
  });

  slider.addEventListener("focusin", () => {
    sliderPaused = true;
    stopAutoplay();
  });

  slider.addEventListener("focusout", (event) => {
    if (!slider.contains(event.relatedTarget)) {
      sliderPaused = false;
      startAutoplay();
    }
  });

  slider.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft") showSlide(currentSlide + 1);
    if (event.key === "ArrowRight") showSlide(currentSlide - 1);
  });

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) stopAutoplay();
    else startAutoplay();
  });

  showSlide(0);
  startAutoplay();
})();
