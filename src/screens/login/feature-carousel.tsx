"use client";
import NavigationIcon from "@/components/NavigationIcon";
import { CaretRightOutlined, PauseOutlined } from "@ant-design/icons";
import Image from "next/image";
import { useEffect, useState, useSyncExternalStore } from "react";
import { useTranslation } from "react-i18next";
import styles from "./login.module.css";

const slides = ["orders", "catalogue", "inventory"] as const;
const subscribeToMotion = (listener: () => void) => {
  const query = window.matchMedia("(prefers-reduced-motion: reduce)");
  query.addEventListener("change", listener);
  return () => query.removeEventListener("change", listener);
};
const allowsMotion = () =>
  !window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export default function FeatureCarousel() {
  const { t, i18n } = useTranslation();
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const interacting = hovered || focused;
  const animate = useSyncExternalStore(
    subscribeToMotion,
    allowsMotion,
    () => false,
  );
  useEffect(() => {
    if (!animate || paused || interacting) return;
    const interval = window.setInterval(() => {
      if (!document.hidden) setActive((index) => (index + 1) % slides.length);
    }, 6500);
    return () => window.clearInterval(interval);
  }, [active, animate, paused, interacting]);
  const change = (offset: number) =>
    setActive((index) => (index + offset + slides.length) % slides.length);
  const slide = slides[active];
  return (
    <aside
      className={styles.feature}
      role="region"
      aria-roledescription="carousel"
      aria-label={t("login.featuresLabel")}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocusCapture={() => setFocused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget))
          setFocused(false);
      }}
      onKeyDown={(event) => {
        if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
          event.preventDefault();
          change(
            (event.key === "ArrowRight") !== (i18n.dir() === "rtl") ? 1 : -1,
          );
        }
      }}
    >
      <div className={styles.waveOne} aria-hidden="true" />
      <div className={styles.waveTwo} aria-hidden="true" />
      <div className={styles.brand}>
        <strong>Shop Simplist</strong>
        <span>{t("login.adminWorkspace")}</span>
      </div>
      <div
        className={styles.slide}
        role="group"
        aria-roledescription="slide"
        aria-label={t("login.slidePosition", {
          current: active + 1,
          total: slides.length,
        })}
        aria-live={paused || interacting || !animate ? "polite" : "off"}
      >
        <div className={styles.art}>
          {slides.map((name, index) => (
            <Image
              key={name}
              src={`/images/login/${name}.png`}
              alt=""
              fill
              sizes="(max-width: 900px) 1px, 50vw"
              preload={index === 0}
              loading={index === 0 ? undefined : "eager"}
              fetchPriority={index === 0 ? undefined : "low"}
              className={
                active === index ? styles.visibleArt : styles.hiddenArt
              }
              style={{ objectFit: "contain" }}
            />
          ))}
        </div>
        <div className={styles.slideCopy} key={slide}>
          <h2>{t(`login.features.${slide}.title`)}</h2>
          <p>{t(`login.features.${slide}.description`)}</p>
        </div>
      </div>
      <div className={styles.carouselFooter}>
        <div className={styles.dots}>
          {slides.map((key, index) => (
            <button
              key={key}
              type="button"
              onClick={() => setActive(index)}
              aria-label={t("login.goToSlide", { number: index + 1 })}
              aria-current={active === index ? "true" : undefined}
            >
              <span
                className={active === index ? styles.activeDot : undefined}
              />
            </button>
          ))}
        </div>
        <div className={styles.slideControls}>
          {animate && (
            <button
              type="button"
              className={styles.pause}
              onClick={() => setPaused((value) => !value)}
              aria-label={t(paused ? "login.playSlides" : "login.pauseSlides")}
            >
              {paused ? <CaretRightOutlined /> : <PauseOutlined />}
            </button>
          )}
          <button
            type="button"
            onClick={() => change(-1)}
            aria-label={t("login.previousSlide")}
          >
            <NavigationIcon kind="chevron" direction="back" />
          </button>
          <button
            type="button"
            onClick={() => change(1)}
            aria-label={t("login.nextSlide")}
          >
            <NavigationIcon kind="chevron" />
          </button>
          <span className={styles.slideNumber} dir="ltr">
            {String(active + 1).padStart(2, "0")} / 03
          </span>
        </div>
      </div>
    </aside>
  );
}
