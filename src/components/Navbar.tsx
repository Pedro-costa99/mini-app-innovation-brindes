import React, { useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import ThemeToggle from "@/components/ThemeToggle";
import { useRouter } from "next/router";
import { clearToken } from "@/utils/authStorage";
import { useAuthUser } from "@/store/authUser";

type NavbarProps = {
  userName?: string;
  userSubtext?: string;
  avatarSrc?: string;
  showIcons?: boolean;
  mailBadge?: number | null;
  phoneBadge?: number | null;
  logoHref?: string;
  showLogout?: boolean;
};

function formatTodayPtBR() {
  try {
    const d = new Date();
    const formatter = new Intl.DateTimeFormat("pt-BR", {
      weekday: "long",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
    const s = formatter.format(d);
    const [weekday, rest] = s.split(", ");
    const cap = weekday
      ? weekday.charAt(0).toUpperCase() + weekday.slice(1)
      : "";
    return `${cap}, ${rest}`;
  } catch {
    return "";
  }
}

export default function Navbar({
  userName,
  userSubtext,
  avatarSrc = "",
  showIcons = true,
  mailBadge = 11,
  phoneBadge = 11,
  logoHref = "/",
  showLogout = true,
}: NavbarProps) {
  const router = useRouter();
  const authUser = useAuthUser((s) => s.user);
  const clearUser = useAuthUser((s) => s.clearUser);

  const displayName = authUser?.nome_usuario?.trim() || userName || "Usuário";

  const computedSubtext = useMemo(
    () => userSubtext ?? formatTodayPtBR(),
    [userSubtext]
  );

  function handleLogout() {
    clearToken();
    clearUser();
    router.replace("/login");
  }

  return (
    <header className="w-full bg-[#80BC04]">
      <div className="mx-auto max-w-[1200px] px-4">
        <div className="flex h-14 items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href={logoHref} aria-label="Ir para a página inicial">
              <Image
                src="/images/logo.webp"
                alt="Innovation Brindes"
                width={120}
                height={120}
                priority
                className="filter brightness-0 invert"
              />
            </Link>
          </div>
          <div className="flex items-center gap-2 sm:gap-5">
            {showIcons && (
              <div className="flex items-center gap-2 sm:gap-3 text-white">
                <span className="relative inline-flex h-9 w-9 items-center justify-center rounded-md">
                  <svg
                    className="h-5 w-5 opacity-90"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      fill="currentColor"
                      d="M20 4H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2Zm0 4-8 5L4 8V6l8 5 8-5v2Z"
                    />
                  </svg>
                  {typeof mailBadge === "number" && (
                    <span className="absolute -top-1 -right-1 rounded-full bg-white px-1.5 text-[10px] font-semibold leading-4 text-[#7CB800] shadow-sm">
                      {mailBadge}
                    </span>
                  )}
                </span>

                <span className="relative inline-flex h-9 w-9 items-center justify-center rounded-md">
                  <svg
                    className="h-5 w-5 opacity-90"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      fill="currentColor"
                      d="M6.62 10.79a15.05 15.05 0 0 0 6.59 6.59l2.2-2.2a1 1 0 0 1 1.01-.24c1.11.37 2.31.57 3.58.57a1 1 0 0 1 1 1V20a1 1 0 0 1-1 1C10.61 21 3 13.39 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.27.2 2.47.57 3.58a1 1 0 0 1-.24 1.01l-2.2 2.2Z"
                    />
                  </svg>
                  {typeof phoneBadge === "number" && (
                    <span className="absolute -top-1 -right-1 rounded-full bg-white px-1.5 text-[10px] font-semibold leading-4 text-[#7CB800] shadow-sm">
                      {phoneBadge}
                    </span>
                  )}
                </span>
              </div>
            )}

            <div className="flex items-center gap-3">
              <div className="h-9 w-9 sm:h-12 sm:w-12 overflow-hidden rounded-full shrink-0">
                <Image
                  src={avatarSrc || "/images/user.webp"}
                  alt={displayName}
                  width={66}
                  height={66}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="hidden text-right text-white sm:block">
                <div className="text-[13px] font-semibold leading-4">
                  {displayName}
                </div>
                <div className="text-[11px] -mt-0.5 opacity-90">
                  {computedSubtext}
                </div>
              </div>
            </div>
            {showIcons && (
              <div className="flex items-center gap-4 text-white">
                <ThemeToggle />
              </div>
            )}
            {showLogout && (
              <button
                onClick={handleLogout}
                className="rounded bg-red-600 px-3 py-1.5 text-xs font-semibold text-white shadow hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-white/70"
                aria-label="Sair da aplicação"
              >
                Sair
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
