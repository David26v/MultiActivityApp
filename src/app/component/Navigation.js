"use client"; 
import Link from "next/link";
import { usePathname } from "next/navigation"; 
import { List, FileText, Star, FileEdit } from "lucide-react";

const links = [
  { href: "/Todo-app", label: "Todo List", icon: List },
  { href: "/activity2", label: "Google Drive Lite", icon: FileText },
  { href: "/activity3", label: "Food Review App", icon: Star },
  { href: "/activity4", label: "Pokemon Review", icon: Star },
  { href: "/activity5", label: "Markdown Notes", icon: FileEdit },
  { href: "/Project-Management", label: "Project Management", icon: FileEdit },
];

const Navigation = () => {
  const pathname = usePathname(); 

  return (
    <nav className="w-auto h-auto bg-black text-white p-4">
      <h2 className="text-lg font-semibold mb-4">Activities</h2>
      <ul className="space-y-2">
        {links.map(({ href, label, icon: Icon }) => (
          <li key={href}>
            <Link
              href={href}
              className={`flex items-center gap-2 p-3 rounded-md transition ${
                pathname === href
                  ? "bg-blue-600 text-white"
                  : "hover:bg-gray-800 text-gray-300"
              }`}
            >
              <Icon className="w-5 h-5" />
              <span>{label}</span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default Navigation;
