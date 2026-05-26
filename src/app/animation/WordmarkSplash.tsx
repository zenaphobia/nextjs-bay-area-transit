"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { memo, useRef, useState } from "react";
import { twMerge } from "tailwind-merge";

gsap.registerPlugin(useGSAP);

const SplashAnimation = memo(function SplashAnimation() {
  const container = useRef<HTMLDivElement>(null);
  const t1 = useRef<gsap.core.Timeline>(null);
  const [done, setDone] = useState(false);

  useGSAP(
    () => {
      gsap.set("#tram", { xPercent: -100, yPercent: -15, opacity: 0 });
      t1.current = gsap
        .timeline({ defaults: { ease: "expo.out" } })
        .to("#wordmark", { opacity: 1, xPercent: 5 }, 0)
        .to("#tram", { xPercent: 25, opacity: 1 }, 0)
        .to("#name", { opacity: 1 }, 0);
      // .to(container.current, {
      //   opacity: 0,
      //   delay: 1,
      //   animation: 100,
      //   onComplete: () => {
      //     setDone(true);
      //   },
      // });
    },
    { scope: container },
  );

  return (
    <div
      className={twMerge(
        "fixed inset-0 flex items-center justify-center flex-col h-screen w-screen bg-background z-[1000]",
        done && "pointer-events-none",
      )}
      ref={container}
    >
      <Tram />
      <div style={{ opacity: 0 }} id="name" className="flex">
        <h1 className="font-mono text-2xl text-center">terminal</h1>
        <span id="cursor" className="font-mono text-2xl animate-blink">
          _
        </span>
      </div>
    </div>
  );
});

function Tram() {
  return (
    <svg
      className="w-1/2 max-w-2xl h-[100px] md:h-[200px]"
      id="wordmark"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 240 56"
      fill="#fff"
      style={{ opacity: 0 }}
    >
      <g data-name="tram_group">
        <path
          id="tram"
          className="cls-1"
          d="M87.97,48.19c.12.47.19.97.19,1.48,0,3.33-2.7,6.03-6.03,6.03s-6.03-2.7-6.03-6.03c0-.51.07-1,.19-1.48h11.68ZM64.46,48.19l-2.1,1.13c0,.12-.02.23-.02.35,0,3.33,2.7,6.03,6.03,6.03s6.03-2.7,6.03-6.03c0-.51-.07-1-.19-1.48h-9.74ZM100.35,48.19h-10.29c-.12.47-.19.97-.19,1.48,0,3.33,2.7,6.03,6.03,6.03s6.03-2.7,6.03-6.03c0-.08-.01-.16-.02-.24l-1.57-1.24ZM144.62,41.32c-.7,6.26-10.2,8.34-10.2,8.34h-28.97l-4.4-3.48h-37.09l-6.49,3.48H0V.01c29.22-.06,57.92.09,74.16.75,6.33.26,16.44,1.53,25.03,3.94,15.1,4.23,31.52,14.83,38.24,20.17s7.88,10.2,7.19,16.46ZM39.67,12.6c0-1.66-1.34-3-3-3H9.03c-1.66,0-3,1.34-3,3v6.21c0,1.66,1.34,3,3,3h27.64c1.66,0,3-1.34,3-3v-6.21ZM79.35,12.6c0-1.66-1.34-3-3-3h-27.64c-1.66,0-3,1.34-3,3v6.21c0,1.66,1.34,3,3,3h27.64c1.66,0,3-1.34,3-3v-6.21ZM128.83,24.86c-6.49-5.49-16.48-13.91-29.37-15.26-12.89-1.35-12.89-.5-13.66.58-.7.99-.33,3.79-.33,6.13s.53,5.64,3.85,5.51c9.69-.39,26.57,1.81,35.59,6.11,6.36,3.03,4.86-2.25,3.92-3.05Z"
        />
      </g>
      <g data-name="chevron_group">
        <g id="chevron_1">
          <path
            className="cls-1"
            d="M0,28.77v-6.05l15.26-7.05c.7-.32,1.39-.59,2.08-.81.68-.23,1.22-.38,1.6-.45-.39-.07-.93-.21-1.63-.42-.7-.21-1.39-.46-2.05-.74L0,6.15V0l23.57,11.1v6.58L0,28.77Z"
          />
        </g>
      </g>
    </svg>
  );
}

export default SplashAnimation;
