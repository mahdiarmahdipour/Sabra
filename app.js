(() => {
  const root = document.documentElement;
  const themeToggle = document.querySelector(".theme-toggle");
  const themeLabel = document.querySelector(".theme-toggle__label");
  const themeMeta = document.querySelector('meta[name="theme-color"]');
  const menuToggle = document.querySelector(".menu-toggle");
  const menuScrim = document.querySelector(".menu-scrim");
  const routeLinks = [...document.querySelectorAll("[data-route]")];
  const navLinks = [...document.querySelectorAll(".site-nav [data-route]")];
  const pages = [...document.querySelectorAll("[data-page]")];
  const video = document.querySelector("video");

  const routes = new Set(["home", "show", "tickets", "donation", "news", "about"]);

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

  menuScrim.addEventListener("click", closeMenu);

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

  const copyButtons = [...document.querySelectorAll("[data-copy-value]")];
  const copyToast = document.querySelector(".copy-toast");
  let toastTimer;

  function fallbackCopy(value) {
    const field = document.createElement("textarea");
    field.value = value;
    field.setAttribute("readonly", "");
    field.style.position = "fixed";
    field.style.opacity = "0";
    document.body.appendChild(field);
    field.select();
    document.execCommand("copy");
    field.remove();
  }

  function announceCopy(label, button) {
    window.clearTimeout(toastTimer);
    copyButtons.forEach((item) => item.classList.remove("is-copied"));
    button.classList.add("is-copied");
    copyToast.textContent = `${label} کپی شد`;
    copyToast.classList.add("is-visible");
    toastTimer = window.setTimeout(() => {
      button.classList.remove("is-copied");
      copyToast.classList.remove("is-visible");
    }, 2300);
  }

  copyButtons.forEach((button) => {
    button.addEventListener("click", async () => {
      const value = button.dataset.copyValue;
      try {
        await navigator.clipboard.writeText(value);
      } catch {
        fallbackCopy(value);
      }
      announceCopy(button.dataset.copyLabel, button);
    });
  });

  const storyVisual = document.querySelector(".story-visual");
  let storyAnimationFrame;

  function updateStoryHeight() {
    storyAnimationFrame = undefined;
    if (!storyVisual || storyVisual.closest("[hidden]")) return;

    const compactLayout = window.innerWidth <= 620;
    const maxHeight = compactLayout
      ? 330
      : Math.min(520, Math.max(300, window.innerWidth * 0.42));
    const minHeight = compactLayout ? 238 : Math.max(300, maxHeight * 0.68);

    if (reducedMotion) {
      storyVisual.style.setProperty("--story-height", `${maxHeight}px`);
      return;
    }

    const bounds = storyVisual.getBoundingClientRect();
    const viewportCenter = window.innerHeight / 2;
    const imageCenter = bounds.top + bounds.height / 2;
    const distance = Math.abs(imageCenter - viewportCenter);
    const range = window.innerHeight * 0.9;
    const rawProgress = 1 - Math.min(distance / range, 1);
    const easedProgress = rawProgress * rawProgress * (3 - 2 * rawProgress);
    const height = minHeight + easedProgress * (maxHeight - minHeight);
    storyVisual.style.setProperty("--story-height", `${height.toFixed(1)}px`);
  }

  function queueStoryHeight() {
    if (storyAnimationFrame) return;
    storyAnimationFrame = window.requestAnimationFrame(updateStoryHeight);
  }

  window.addEventListener("scroll", queueStoryHeight, { passive: true });
  window.addEventListener("resize", queueStoryHeight);
  window.addEventListener("hashchange", queueStoryHeight);
  queueStoryHeight();

  const discoverySelect = document.querySelector("[data-discovery-select]");
  const discoveryOther = document.querySelector("[data-discovery-other]");
  const discoveryOtherInput = discoveryOther?.querySelector("textarea");
  const wordLimitedInput = document.querySelector("[data-word-limit]");
  const wordCounter = document.querySelector("[data-word-counter]");
  const supportRadios = [...document.querySelectorAll('input[name="support"]')];
  const customAmountField = document.querySelector("[data-custom-amount]");
  const customAmountInput = customAmountField?.querySelector("input");
  const ticketForm = document.querySelector("#ticket-form");
  const registrationModal = document.querySelector("[data-registration-modal]");
  const modalCloseButtons = [...document.querySelectorAll("[data-modal-close]")];
  const trackingCodeButton = document.querySelector(".tracking-code");
  let focusBeforeModal;

  function updateDiscoveryField() {
    if (!discoverySelect || !discoveryOther || !discoveryOtherInput) return;
    const showOther = discoverySelect.value === "other";
    discoveryOther.hidden = !showOther;
    discoveryOtherInput.required = showOther;
    if (!showOther) discoveryOtherInput.value = "";
  }

  discoverySelect?.addEventListener("change", updateDiscoveryField);

  function getWords(value) {
    return value.trim() ? value.trim().split(/\s+/u) : [];
  }

  wordLimitedInput?.addEventListener("input", () => {
    const limit = Number(wordLimitedInput.dataset.wordLimit) || 100;
    let words = getWords(wordLimitedInput.value);
    if (words.length > limit) {
      words = words.slice(0, limit);
      wordLimitedInput.value = words.join(" ");
    }
    if (wordCounter) {
      wordCounter.textContent = `${words.length.toLocaleString("fa-IR")} از ${limit.toLocaleString("fa-IR")} کلمه`;
    }
  });

  function updateCustomAmount() {
    if (!customAmountField || !customAmountInput) return;
    const selected = supportRadios.find((radio) => radio.checked);
    const showAmount = selected?.value === "other";
    customAmountField.hidden = !showAmount;
    customAmountInput.required = showAmount;
    if (!showAmount) customAmountInput.value = "";
  }

  supportRadios.forEach((radio) => radio.addEventListener("change", updateCustomAmount));

  customAmountInput?.addEventListener("input", () => {
    if (Number(customAmountInput.value) > 50000000) customAmountInput.value = "50000000";
  });

  function openRegistrationModal() {
    if (!registrationModal) return;
    focusBeforeModal = document.activeElement;
    registrationModal.hidden = false;
    document.body.classList.add("modal-open");
    window.requestAnimationFrame(() => trackingCodeButton?.focus());
  }

  function closeRegistrationModal() {
    if (!registrationModal || registrationModal.hidden) return;
    registrationModal.hidden = true;
    document.body.classList.remove("modal-open");
    focusBeforeModal?.focus?.();
  }

  ticketForm?.addEventListener("submit", (event) => {
    event.preventDefault();
    openRegistrationModal();
  });

  modalCloseButtons.forEach((button) => button.addEventListener("click", closeRegistrationModal));

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeRegistrationModal();
  });
})();
