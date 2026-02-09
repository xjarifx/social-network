import { useEffect, useRef } from "react";
import lottie from "lottie-web";
import type { AnimationItem } from "lottie-web";
import earthAnimation from "../../assets/Earth globe rotating with Seamless loop animation.json";

export const useFaviconAnimation = () => {
  const animationRef = useRef<AnimationItem | null>(null);

  useEffect(() => {
    // Create a hidden container for the Lottie animation
    const container = document.createElement("div");
    container.style.width = "64px";
    container.style.height = "64px";
    container.style.position = "fixed";
    container.style.left = "-9999px";
    document.body.appendChild(container);

    // Create canvas for favicon
    const canvas = document.createElement("canvas");
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext("2d");

    if (!ctx) {
      document.body.removeChild(container);
      return;
    }

    // Load Lottie animation
    const animation = lottie.loadAnimation({
      container,
      renderer: "svg",
      loop: true,
      autoplay: true,
      animationData: earthAnimation,
    });

    animationRef.current = animation;

    // Function to capture frame and update favicon
    const updateFavicon = () => {
      const svgElement = container.querySelector("svg");
      if (!svgElement) return;

      // Get SVG data
      const svgData = new XMLSerializer().serializeToString(svgElement);
      const img = new Image();

      img.onload = () => {
        ctx.clearRect(0, 0, 64, 64);
        ctx.drawImage(img, 0, 0, 64, 64);

        const link = document.querySelector(
          'link[rel="icon"]',
        ) as HTMLLinkElement;
        if (link) {
          link.href = canvas.toDataURL("image/png");
        }
      };

      img.src =
        "data:image/svg+xml;base64," +
        btoa(unescape(encodeURIComponent(svgData)));
    };

    // Update favicon on each frame
    animation.addEventListener("enterFrame", updateFavicon);

    return () => {
      animation.removeEventListener("enterFrame", updateFavicon);
      animation.destroy();
      document.body.removeChild(container);
    };
  }, []);
};
