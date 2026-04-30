export type IntroPhase = "asleep" | "flicker" | "pan" | "active";
export type PhonePanelScreen = "lock" | "home" | "social" | "black" | null;
export type YouTubePlayer = {
  playVideo: () => void;
  stopVideo: () => void;
  mute: () => void;
  unMute: () => void;
};
