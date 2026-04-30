import { useEffect, useRef, useState } from "react";
import { MathUtils } from "three";
import { playPhoneTapClick, playSocialFlickerSuspense } from "../lib/audio";
import type { PhonePanelScreen } from "../types/app";

const socialImagePool = [
  "/social-samples/01.jpg",
  "/social-samples/02.jpg",
  "/social-samples/03.jpg",
  "/social-samples/04.jpg",
  "/social-samples/05.jpg",
  "/social-samples/06.jpg",
];

export function PhonePanelOverlay({
  screen,
  phoneNumber,
  lockscreenImageUrl,
  displayTime,
  onOpenSocial,
  onUnlock,
  onCloseAndReturn,
}: {
  screen: Exclude<PhonePanelScreen, null>;
  phoneNumber: string;
  lockscreenImageUrl: string | null;
  displayTime: string;
  onOpenSocial: () => void;
  onUnlock: () => void;
  onCloseAndReturn: () => void;
}) {
  const [dragging, setDragging] = useState(false);
  const [progress, setProgress] = useState(0);
  const [trackWidth, setTrackWidth] = useState(0);
  const [blackoutActive, setBlackoutActive] = useState(false);
  const [blackoutFlickerPhase, setBlackoutFlickerPhase] = useState(false);
  const [socialPostCount, setSocialPostCount] = useState(30);
  const trackRef = useRef<HTMLDivElement>(null);
  const socialFeedRef = useRef<HTMLDivElement>(null);
  const socialFeedDragging = useRef(false);
  const socialFeedLastY = useRef(0);

  useEffect(() => {
    const resize = () => {
      if (!trackRef.current) return;
      setTrackWidth(trackRef.current.getBoundingClientRect().width);
    };
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  useEffect(() => {
    if (screen !== "lock") return;
    if (!dragging) return;

    const onMove = (event: PointerEvent) => {
      if (!trackRef.current) return;
      const rect = trackRef.current.getBoundingClientRect();
      const raw = (event.clientX - rect.left) / rect.width;
      const next = MathUtils.clamp(raw, 0, 1);
      setProgress(next);
      if (next >= 0.95) {
        setDragging(false);
        onUnlock();
      }
    };

    const onUp = () => {
      setDragging(false);
      setProgress((value) => (value >= 0.95 ? 1 : 0));
    };

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
  }, [dragging, onUnlock, screen]);

  useEffect(() => {
    if (screen !== "social") {
      setBlackoutActive(false);
      setBlackoutFlickerPhase(false);
      setSocialPostCount(30);
    }
  }, [screen]);

  useEffect(() => {
    if (screen !== "social") return;
    const blackTimer = window.setTimeout(() => {
      setBlackoutActive(true);
      setBlackoutFlickerPhase(true);
    }, 10000);
    return () => window.clearTimeout(blackTimer);
  }, [screen]);

  useEffect(() => {
    if (screen !== "social" || !blackoutFlickerPhase) return;
    const flickerPhaseTimer = window.setTimeout(() => {
      setBlackoutFlickerPhase(false);
    }, 2000);
    return () => {
      window.clearTimeout(flickerPhaseTimer);
    };
  }, [blackoutFlickerPhase, screen]);

  useEffect(() => {
    if (screen !== "social" || !blackoutFlickerPhase) return;
    const stopSound = playSocialFlickerSuspense(2000);
    return () => {
      stopSound();
    };
  }, [blackoutFlickerPhase, screen]);

  useEffect(() => {
    if (screen !== "social" || !blackoutActive || blackoutFlickerPhase) return;
    const closeTimer = window.setTimeout(() => {
      onCloseAndReturn();
    }, 1000);
    return () => {
      window.clearTimeout(closeTimer);
    };
  }, [blackoutActive, blackoutFlickerPhase, onCloseAndReturn, screen]);

  const knobTravel = Math.max((trackWidth || 1) - 56, 0);
  const knobX = knobTravel * progress;
  const socialPosts = Array.from({ length: socialPostCount }, (_, index) => index + 1);

  return (
    <div
      className="phone-focus-overlay"
      onPointerDown={() => {
        onCloseAndReturn();
      }}
    >
      <div
        className="phone-focus-panel"
        onPointerDown={(event) => {
          event.stopPropagation();
        }}
      >
        {screen === "lock" ? (
          <div className="phone-lock-screen">
            <div className="phone-focus-status">
              <span>9:41</span>
              <div className="phone-focus-island" aria-hidden="true" />
              <div className="phone-focus-status-icons" aria-hidden="true">
                <span className="signal-bars" />
                <span className="wifi-icon" />
                <span className="battery-icon" />
              </div>
            </div>
            <div className="phone-focus-time">{displayTime}</div>
            <div className="phone-focus-day">Monday</div>
            <div className={`phone-focus-photo${lockscreenImageUrl ? " has-image" : ""}`}>
              {lockscreenImageUrl ? (
                <img src={lockscreenImageUrl} alt="Your lockscreen" className="phone-focus-photo-image" />
              ) : (
                <>
                  <div className="phone-focus-person-head" />
                  <div className="phone-focus-person-body" />
                </>
              )}
            </div>
            <div className="phone-focus-slider" ref={trackRef}>
              <div className="phone-focus-slider-label">slide to unlock</div>
              <button
                className="phone-focus-slider-knob"
                type="button"
                style={{ transform: `translateX(${knobX}px)` }}
                onPointerDown={(event) => {
                  event.preventDefault();
                  playPhoneTapClick();
                  setDragging(true);
                }}
                aria-label="Slide to unlock"
              />
            </div>
          </div>
        ) : screen === "home" ? (
          <div className="phone-home">
            <div className="phone-home-top">
              <div className="phone-home-clock">09:41</div>
              <div className="phone-home-top-icons" aria-hidden="true">
                <span className="signal-bars" />
                <span className="wifi-icon" />
                <span className="battery-icon" />
              </div>
            </div>
            <div className="phone-home-grid">
              <div className="phone-home-widget">
                <div className="phone-home-widget-ring" aria-hidden="true" />
                <div className="phone-home-widget-percent">100%</div>
              </div>
              <div className="phone-home-app">
                <div className="phone-home-icon icon-calendar">9</div>
                <div className="phone-home-label">Calendar</div>
              </div>
              <div className="phone-home-app">
                <div className="phone-home-icon icon-photos" />
                <div className="phone-home-label">Photos</div>
              </div>
              <div className="phone-home-app">
                <div className="phone-home-icon icon-tv">tv</div>
                <div className="phone-home-label">TV</div>
              </div>
              <div className="phone-home-app">
                <div className="phone-home-icon icon-camera" />
                <div className="phone-home-label">Camera</div>
              </div>
              <div className="phone-home-app">
                <div className="phone-home-icon icon-maps" />
                <div className="phone-home-label">Maps</div>
              </div>
              <div className="phone-home-app">
                <div className="phone-home-icon icon-settings" />
                <div className="phone-home-label">Settings</div>
              </div>
              <div className="phone-home-app">
                <div className="phone-home-icon icon-mail">6,608</div>
                <div className="phone-home-label">Mail</div>
              </div>
              <div className="phone-home-app">
                <div className="phone-home-icon icon-reminders" />
                <div className="phone-home-label">Reminders</div>
              </div>
            </div>
            <div className="phone-home-dock">
              <div className="phone-home-dock-icon icon-phone" />
              <div className="phone-home-dock-icon icon-safari" />
              <div className="phone-home-dock-icon icon-messages" />
              <button
                type="button"
                className="phone-home-dock-icon icon-music active-social-app"
                aria-label="Open social feed"
                onClick={onOpenSocial}
              />
            </div>
            <div className="phone-home-number">{phoneNumber || "No phone number set"}</div>
          </div>
        ) : screen === "social" ? (
          <div className="phone-social">
            <div className="phone-social-header">For You</div>
            <div
              className="phone-social-feed"
              ref={socialFeedRef}
              onPointerDownCapture={(event) => {
                socialFeedDragging.current = true;
                socialFeedLastY.current = event.clientY;
                event.currentTarget.setPointerCapture(event.pointerId);
              }}
              onPointerMove={(event) => {
                if (!socialFeedDragging.current) return;
                const feed = socialFeedRef.current;
                if (!feed) return;
                const deltaY = socialFeedLastY.current - event.clientY;
                feed.scrollTop += deltaY;
                socialFeedLastY.current = event.clientY;
              }}
              onPointerUp={(event) => {
                socialFeedDragging.current = false;
                event.currentTarget.releasePointerCapture(event.pointerId);
              }}
              onPointerCancel={() => {
                socialFeedDragging.current = false;
              }}
              onScroll={() => {
                const feed = socialFeedRef.current;
                if (!feed) return;
                const remaining = feed.scrollHeight - feed.scrollTop - feed.clientHeight;
                if (remaining < 260) {
                  setSocialPostCount((count) => count + 20);
                }
              }}
            >
              {socialPosts.map((postId) => (
                <article key={postId} className="phone-social-post">
                  <div className="phone-social-post-head">
                    <span className="avatar" />
                    <span>@nightfeed_{postId}</span>
                  </div>
                  <img
                    src={socialImagePool[(postId - 1) % socialImagePool.length]}
                    alt={`Social post ${postId}`}
                    className="phone-social-media"
                    loading="lazy"
                  />
                  <p>Late-night clip #{postId}.</p>
                </article>
              ))}
            </div>
            {blackoutActive && (
              <div className="phone-social-blackout">
                {blackoutFlickerPhase && (
                  <div className="phone-social-reflection" aria-hidden="true">
                    <img
                      src="/reflections/monster-sad.jpeg"
                      alt=""
                      className="phone-social-reflection-image"
                      loading="eager"
                      decoding="sync"
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="phone-black-screen" aria-label="Phone screen off" />
        )}
      </div>
    </div>
  );
}

export function advancePhoneTimeByHour(value: string) {
  const match = value.match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return value;

  const hour = Number.parseInt(match[1], 10);
  const minute = match[2];
  const nextHour = ((hour % 12) || 12) + 1;
  const normalizedHour = ((nextHour - 1) % 12) + 1;

  return `${normalizedHour}:${minute}`;
}
