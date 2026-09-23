"use client";

import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useScroll,
} from "motion/react";
import { Menu, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface NavbarProps {
  children: React.ReactNode;
  className?: string;
  /** Keep the solid scrolled style even at the top of the page */
  forceVisible?: boolean;
}

interface NavBodyProps {
  children: React.ReactNode;
  className?: string;
  visible?: boolean;
}

interface NavItemsProps {
  items: { name: string; link: string }[];
  className?: string;
  onItemClick?: () => void;
}

interface MobileNavProps {
  children: React.ReactNode;
  className?: string;
  visible?: boolean;
}

interface MobileNavHeaderProps {
  children: React.ReactNode;
  className?: string;
}

interface MobileNavMenuProps {
  children: React.ReactNode;
  className?: string;
  isOpen: boolean;
  onClose: () => void;
}

const NAV_SHADOW =
  "0 0 24px rgba(0, 0, 0, 0.35), 0 1px 1px rgba(0, 0, 0, 0.2), 0 0 0 1px rgba(255, 255, 255, 0.08), 0 16px 48px rgba(0, 0, 0, 0.35)";

export function Navbar({
  children,
  className,
  forceVisible = false,
}: NavbarProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll();
  const [visible, setVisible] = useState(forceVisible);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (forceVisible) setVisible(true);
  }, [forceVisible]);

  useMotionValueEvent(scrollY, "change", (latest) => {
    if (forceVisible) {
      setVisible(true);
      return;
    }
    setVisible(latest > 80);
  });

  const content = (
    <motion.div
      ref={ref}
      className={cn(
        "pointer-events-none fixed inset-x-0 top-0 z-[200] w-full",
        className,
      )}
    >
      {React.Children.map(children, (child) =>
        React.isValidElement(child)
          ? React.cloneElement(
              child as React.ReactElement<{ visible?: boolean }>,
              { visible },
            )
          : child,
      )}
    </motion.div>
  );

  if (!mounted) return null;
  return createPortal(content, document.body);
}

export function NavBody({ children, className, visible }: NavBodyProps) {
  return (
    <motion.div
      animate={{
        backdropFilter: visible ? "blur(12px)" : "blur(0px)",
        boxShadow: visible ? NAV_SHADOW : "0 0 0 rgba(0,0,0,0)",
        width: visible ? "70%" : "100%",
        y: visible ? 16 : 0,
      }}
      transition={{
        type: "spring",
        stiffness: 260,
        damping: 36,
        mass: 0.8,
      }}
      style={{
        minWidth: visible ? 720 : undefined,
        maxWidth: 1280,
      }}
      className={cn(
        "pointer-events-auto relative z-[210] mx-auto mt-0 hidden w-full flex-row items-center justify-between self-start rounded-full px-4 py-2 lg:flex",
        visible
          ? "border border-white/10 bg-zinc-950/85"
          : "border border-transparent bg-transparent",
        className,
      )}
    >
      {children}
    </motion.div>
  );
}

export function NavItems({ items, className, onItemClick }: NavItemsProps) {
  const [hovered, setHovered] = useState<number | null>(null);

  return (
    <motion.div
      onMouseLeave={() => setHovered(null)}
      className={cn(
        "absolute inset-0 hidden flex-1 flex-row items-center justify-center space-x-1 text-sm font-medium lg:flex",
        className,
      )}
    >
      {items.map((item, idx) => (
        <Link
          key={`link-${idx}`}
          href={item.link}
          onMouseEnter={() => setHovered(idx)}
          onClick={onItemClick}
          className="relative px-4 py-2 text-white/70 transition-colors hover:text-white"
        >
          {hovered === idx ? (
            <motion.div
              layoutId="nav-hovered"
              className="absolute inset-0 h-full w-full rounded-full bg-white/10"
              transition={{ type: "spring", stiffness: 320, damping: 30 }}
            />
          ) : null}
          <span className="relative z-10">{item.name}</span>
        </Link>
      ))}
    </motion.div>
  );
}

export function MobileNav({ children, className, visible }: MobileNavProps) {
  return (
    <motion.div
      animate={{
        backdropFilter: visible ? "blur(12px)" : "blur(0px)",
        boxShadow: visible ? NAV_SHADOW : "none",
        width: visible ? "92%" : "100%",
        y: visible ? 12 : 0,
        borderRadius: visible ? "1.25rem" : "0px",
      }}
      transition={{
        type: "spring",
        stiffness: 260,
        damping: 36,
        mass: 0.8,
      }}
      className={cn(
        "pointer-events-auto relative z-[210] mx-auto flex w-full max-w-[calc(100vw-1.5rem)] flex-col items-center justify-between px-3 py-2 lg:hidden",
        visible
          ? "border border-white/10 bg-zinc-950/90"
          : "border border-transparent bg-transparent",
        className,
      )}
    >
      {children}
    </motion.div>
  );
}

export function MobileNavHeader({
  children,
  className,
}: MobileNavHeaderProps) {
  return (
    <div className={cn("flex w-full flex-row items-center justify-between", className)}>
      {children}
    </div>
  );
}

export function MobileNavMenu({
  children,
  className,
  isOpen,
  onClose,
}: MobileNavMenuProps) {
  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [isOpen, onClose]);

  if (typeof document === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {isOpen ? (
        <>
          <motion.button
            type="button"
            aria-label="Închide meniul"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[300] bg-black/60 backdrop-blur-sm lg:hidden"
            onClick={onClose}
          />
          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-label="Meniu navigare"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 380, damping: 36, mass: 0.8 }}
            className={cn(
              "fixed inset-y-0 right-0 z-[310] flex w-[min(100vw-3rem,20rem)] flex-col border-l border-white/10 bg-zinc-950 shadow-2xl lg:hidden",
              className,
            )}
          >
            <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
              <Link
                href="/"
                onClick={onClose}
                className="flex items-center gap-2.5 text-sm font-semibold text-white"
              >
                <Image
                  src="/images/logozerobug.png"
                  alt="ZeroBug"
                  width={32}
                  height={32}
                  className="h-8 w-8 rounded-full object-cover"
                  unoptimized
                />
                ZeroBug
              </Link>
              <button
                type="button"
                onClick={onClose}
                aria-label="Închide meniul"
                className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white ring-1 ring-white/15 transition-colors hover:bg-white/15"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-3 py-4">
              {children}
            </nav>
            <div className="border-t border-white/10 px-5 py-4">
              <p className="text-xs text-zinc-500">
                SC AXP GLOBAL RETAIL SRL · ZeroBug
              </p>
            </div>
          </motion.aside>
        </>
      ) : null}
    </AnimatePresence>,
    document.body,
  );
}

export function MobileNavToggle({
  isOpen,
  onClick,
}: {
  isOpen: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={isOpen ? "Închide meniul" : "Deschide meniul"}
      className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white ring-1 ring-white/15"
    >
      {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
    </button>
  );
}

export function NavbarLogo({
  href = "/",
  src = "/images/logozerobug.png",
  title = "ZeroBug",
}: {
  href?: string;
  src?: string;
  title?: string;
}) {
  return (
    <Link
      href={href}
      className="relative z-20 flex items-center gap-2.5 px-1 py-1 text-sm font-semibold text-white"
    >
      <Image
        src={src}
        alt={title}
        width={36}
        height={36}
        className="h-9 w-9 rounded-full object-cover"
        priority
        unoptimized
      />
      <span className="font-semibold tracking-tight">{title}</span>
    </Link>
  );
}

export function NavbarButton({
  href,
  as: Tag = "a",
  children,
  className,
  variant = "primary",
  ...props
}: {
  href?: string;
  as?: React.ElementType;
  children: React.ReactNode;
  className?: string;
  variant?: "primary" | "secondary" | "dark";
} & (
  | React.ComponentPropsWithoutRef<"a">
  | React.ComponentPropsWithoutRef<"button">
)) {
  const baseStyles =
    "relative z-20 inline-flex items-center justify-center rounded-full px-4 py-2 text-sm font-medium transition-transform duration-200 hover:-translate-y-0.5";

  const variantStyles = {
    primary:
      "bg-[color:var(--brand)] text-zinc-950 hover:bg-[color:var(--brand-soft)]",
    secondary: "bg-transparent text-white/80 hover:text-white",
    dark: "bg-white text-zinc-950",
  };

  if (href) {
    return (
      <Link
        href={href}
        className={cn(baseStyles, variantStyles[variant], className)}
        {...(props as React.ComponentPropsWithoutRef<"a">)}
      >
        {children}
      </Link>
    );
  }

  return (
    <Tag
      className={cn(baseStyles, variantStyles[variant], className)}
      {...props}
    >
      {children}
    </Tag>
  );
}
