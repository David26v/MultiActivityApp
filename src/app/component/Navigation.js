// components/Navigation.js
import Link from "next/link";

const Navigation = () => {
  return (
    <nav>
      <ul className="space-y-2">
        <li>
          <Link href="/activity1" className="text-blue-500 hover:underline">
            Activity 1: TodoList
          </Link>
        </li>
        <li>
          <Link href="/activity2" className="text-blue-500 hover:underline">
          Activity 2: Google Drive "Lite
          </Link>
        </li>
        <li>
          <Link href="/activity3" className="text-blue-500 hover:underline">
          Activity 3: Food Review App
          </Link>
        </li>
        <li>
          <Link href="/activity4" className="text-blue-500 hover:underline">
          Activity 4: Pokemon Review App
          </Link>
        </li>
        <li>
          <Link href="/activity5" className="text-blue-500 hover:underline">
          Activity 5: Markdown Notes App 
          </Link>
        </li>
      </ul>
    </nav>
  );
};

export default Navigation;
