import localFont from "next/font/local";

// Fonts are bundled so builds never depend on reaching Google Fonts.
// Variable files cut to Latin, Latin Extended-A and Cyrillic, weights limited to what the brand uses.

export const unbounded = localFont({
  src: "./fonts/unbounded-variable.woff2",
  weight: "500 700",
  variable: "--font-unbounded",
  display: "swap",
});

export const onest = localFont({
  src: "./fonts/onest-variable.woff2",
  weight: "400 600",
  variable: "--font-onest",
  display: "swap",
});

export const jetbrainsMono = localFont({
  src: "./fonts/jetbrains-mono-variable.woff2",
  weight: "400 500",
  variable: "--font-jetbrains-mono",
  display: "swap",
});
