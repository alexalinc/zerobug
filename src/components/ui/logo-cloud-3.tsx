"use client";

import { InfiniteSlider } from "@/components/ui/infinite-slider";
import { cn } from "@/lib/utils";

type Logo = {
  src: string;
  alt: string;
  width?: number;
  height?: number;
};

type LogoCloudProps = React.ComponentProps<"div"> & {
  logos: Logo[];
};

export function LogoCloud({ className, logos, ...props }: LogoCloudProps) {
  return (
    <div
      {...props}
      className={cn(
        "overflow-hidden py-4 [mask-image:linear-gradient(to_right,transparent,black,transparent)]",
        className,
      )}
    >
      <InfiniteSlider gap={28} reverse duration={40} durationOnHover={80}>
        {logos.map((logo) => (
          <div
            key={`logo-${logo.alt}`}
            className="flex h-12 w-[148px] shrink-0 items-center justify-center rounded-xl bg-white/95 px-4 md:h-14 md:w-[168px]"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              alt={logo.alt}
              className="pointer-events-none h-7 w-auto max-w-full select-none object-contain md:h-8"
              height={logo.height}
              loading="lazy"
              src={logo.src}
              width={logo.width}
            />
          </div>
        ))}
      </InfiniteSlider>
    </div>
  );
}
