import {
  //   DashboardIcon,
  //   MegaphoneIcon,
  //   BookmarkIcon,
  //   SettingsIcon,
  LogoBanner,
} from "@/components/common";
import Link from "next/link";
import { type ReactNode } from "react";

const navigation = [
  { path: "/dashboard", icon: "<DashboardIcon />", title: "Dashboard" },
  {
    path: "/dashboard/campaigns",
    icon: "<MegaphoneIcon />",
    title: "Campaigns",
  },
  {
    path: "/dashboard/bookmarks",
    icon: "<BookmarkIcon />",
    title: "Bookmarks",
  },
  { path: "/dashboard/settings", icon: "<SettingsIcon />", title: "Settings" },
];

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <header className="sticky top-0 flex justify-between bg-white px-6 py-4 border-b">
        <LogoBanner />
        <nav className="hidden md:flex space-x-6">
          {navigation.map(({ path, title }) => (
            <Link
              key={title}
              href={path}
              className="text-gray-700 hover:text-black"
            >
              {title}
            </Link>
          ))}
        </nav>
      </header>
      <main className="flex-1 p-6">{children}</main>
    </>
  );
}
