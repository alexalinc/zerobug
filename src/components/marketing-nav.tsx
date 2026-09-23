"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowUpRight } from "lucide-react";
import {
  MobileNav,
  MobileNavHeader,
  MobileNavMenu,
  MobileNavToggle,
  NavBody,
  Navbar,
  NavbarButton,
  NavbarLogo,
  NavItems,
} from "@/components/ui/resizable-navbar";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { name: "Servicii", link: "/servicii" },
  { name: "Portofoliu", link: "/portofoliu" },
  { name: "Mentenanță", link: "/mentenanta" },
  { name: "Despre", link: "/despre" },
  { name: "Contact", link: "/contact" },
];

export function MarketingNav() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const isHome = pathname === "/";

  return (
    <>
      <Navbar forceVisible={!isHome}>
        <NavBody>
          <NavbarLogo title="ZeroBug" />
          <NavItems items={NAV_ITEMS} />
          <div className="relative z-20 flex items-center gap-2">
            <NavbarButton href="/servicii" variant="primary">
              Servicii
            </NavbarButton>
          </div>
        </NavBody>

        <MobileNav>
          <MobileNavHeader>
            <NavbarLogo title="ZeroBug" />
            <MobileNavToggle
              isOpen={mobileMenuOpen}
              onClick={() => setMobileMenuOpen((open) => !open)}
            />
          </MobileNavHeader>
          <MobileNavMenu
            isOpen={mobileMenuOpen}
            onClose={() => setMobileMenuOpen(false)}
          >
            {NAV_ITEMS.map((item) => {
              const active =
                pathname === item.link ||
                (item.link !== "/" && pathname.startsWith(item.link));
              return (
                <Link
                  key={item.link}
                  href={item.link}
                  className={cn(
                    "group flex w-full items-center justify-between rounded-xl px-3 py-3 text-[15px] font-medium transition-colors",
                    active
                      ? "bg-white/10 text-white"
                      : "text-white/75 hover:bg-white/5 hover:text-white",
                  )}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.name}
                  <ArrowUpRight
                    className={cn(
                      "h-4 w-4 transition-opacity",
                      active ? "opacity-70" : "opacity-0 group-hover:opacity-50",
                    )}
                  />
                </Link>
              );
            })}
            <div className="mt-4 px-1">
              <NavbarButton
                href="/contact"
                variant="primary"
                className="w-full"
                onClick={() => setMobileMenuOpen(false)}
              >
                Contactează-ne
              </NavbarButton>
            </div>
          </MobileNavMenu>
        </MobileNav>
      </Navbar>
      {!isHome ? <div className="h-24" aria-hidden /> : null}
    </>
  );
}
