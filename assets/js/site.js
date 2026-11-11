// Сайт працює й без цього файла: посилання галереї відкривають кадри, трейлер відкриває YouTube або файл ролика.
// Тут лише зручності: памʼять про мову, шапка під час прокрутки, перегляд кадрів, трейлер на місці.
(() => {
  "use strict";

  // ---------- мова ----------
  // Вибір із перемикача запамʼятовується; ним користується скрипт у <head> української головної.
  for (const link of document.querySelectorAll("[data-set-lang]")) {
    link.addEventListener("click", () => {
      try {
        localStorage.setItem("lang", link.dataset.setLang);
      } catch {
        // приватне вікно: мова просто не запамʼятається
      }
    });
  }

  // ---------- шапка ----------
  // Над першим екраном шапка прозора, далі стає суцільною.
  const header = document.querySelector(".site-header");
  if (header && document.querySelector(".hero")) {
    const onScroll = () => header.classList.toggle("is-stuck", window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll(); // після перезавантаження браузер може відновити прокрутку посеред сторінки
  }

  // ---------- перегляд кадрів ----------
  const box = document.querySelector(".lightbox");
  if (!box) return;

  const track = box.querySelector(".lightbox__track");
  const slides = [...box.querySelectorAll(".lightbox__slide")];
  const counter = box.querySelector(".lightbox__counter");
  const wrap = (i) => (i + slides.length) % slides.length;
  const current = () => Math.round(track.scrollLeft / track.clientWidth);

  // Сусідні кадри вантажаться наперед, щоб під час гортання не було порожнього місця.
  const preload = (i) => {
    for (const j of [i - 1, i, i + 1]) {
      slides[wrap(j)].querySelector("img").loading = "eager";
    }
  };
  let shown = -1;
  const update = () => {
    const i = current();
    if (i === shown) return; // подія scroll сиплеться десятками на один кадр
    shown = i;
    counter.textContent = `${i + 1} / ${slides.length}`;
    preload(i);
  };
  const show = (i, behavior = "smooth") => {
    track.scrollTo({ left: wrap(i) * track.clientWidth, behavior });
  };

  for (const link of document.querySelectorAll(".shot")) {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      const i = Number(link.dataset.index);
      shown = -1;
      preload(i);
      box.showModal();
      show(i, "instant");
      update();
    });
  }

  track.addEventListener("scroll", update, { passive: true });
  box.querySelector(".lightbox__close").addEventListener("click", () => box.close());
  box.querySelector(".lightbox__prev").addEventListener("click", () => show(current() - 1));
  box.querySelector(".lightbox__next").addEventListener("click", () => show(current() + 1));
  box.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft") show(current() - 1);
    else if (event.key === "ArrowRight") show(current() + 1);
    else return;
    event.preventDefault();
  });
  // Клік по темному полю поза кадром закриває перегляд.
  box.addEventListener("click", (event) => {
    if (event.target.classList.contains("lightbox__slide")) box.close();
  });
})();
