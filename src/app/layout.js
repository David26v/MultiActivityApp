"use client";
import "./globals.css";
import Sidebar from "./component/Sidebar";
import { usePathname } from "next/navigation";
import Navbar from "./component/Navbar";



export default function RootLayout({ children }) {
  const pathname = usePathname();
  const hideSidebar = pathname === "/login";

  return (
    <html lang="en">
      <body className={'h-full bg-white'}>
        {!hideSidebar && <Sidebar /> && <Navbar/>}
        {children}
      </body>
    </html>
  );
}
