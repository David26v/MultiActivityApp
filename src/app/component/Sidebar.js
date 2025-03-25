import { usePathname } from "next/navigation";
import { Menu, X, List, FileText, Star, FileEdit, Clock9 ,UserPen} from "lucide-react";
import Link from "next/link";

const links = [
  { href: "/Todo-app", label: "Todo List", icon: List },
  // { href: "/activity2", label: "Google Drive Lite", icon: FileText },
  // { href: "/activity3", label: "Food Review App", icon: Star },
  // { href: "/activity4", label: "Pokemon Review", icon: Star },
  // { href: "/activity5", label: "Markdown Notes", icon: FileEdit },
  { href: "/Project-Management", label: "Project Management", icon: FileEdit },
  { href: "/Time-Management", label: "Time Management", icon: Clock9 },
  { href: "/Attendance", label: "Attendance", icon: UserPen },
];

const Sidebar = ({ isOpen, setIsOpen }) => {
  const pathname = usePathname();

  return (
    <aside
      className={`fixed top-0 left-0 h-screen w-64 bg-gray-900 text-white p-5 shadow-lg transform ${
        isOpen ? "translate-x-0" : "-translate-x-64"
      } transition-transform duration-300 ease-in-out`}
    >
      {/* Close Button */}
      <button
        onClick={() => setIsOpen(false)}
        className="absolute top-4 left-4 text-white p-2 rounded-md focus:outline-none"
      >
        <X size={24} />
      </button>

      {/* Sidebar Content */}
      <h2 className="text-xl font-bold mt-12 mb-6">Activities</h2>
      <ul className="space-y-2">
        {links.map(({ href, label, icon: Icon }) => (
          <li key={href}>
            <Link
              href={href}
              className={`flex items-center gap-3 p-3 rounded-lg transition ${
                pathname === href
                  ? "bg-blue-600 text-white"
                  : "hover:bg-gray-700 text-gray-300"
              }`}
            >
              <Icon className="w-5 h-5" />
              <span>{label}</span>
            </Link>
          </li>
        ))}
      </ul>
    </aside>
  );
};

export default Sidebar;
