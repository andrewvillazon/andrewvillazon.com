import React from "react";
import DarkModeToggle from "./DarkmodeToggle";
import { Link } from "gatsby";

const Navigation = () => {
  const navItems = [
    { url: "/articles", text: "Blog" },
    { url: "/about", text: "About" },
    { url: "/contact", text: "Contact" },
  ];

  return (
    <nav>
      <div className="container mx-auto">
        <div className="text-2xl font-bold text-gray-900">Andrew Villazon</div>
        <div className="container mx-auto flex justify-between items-center">
          <div class="flex space-x-5">
            {navItems.map((item) => (
              <Link
                to={item.url}
                key={item.text}
                className="text-base font-medium hover:border-b-gray-200 border-transparent border-y-2"
              >
                {item.text}
              </Link>
            ))}
          </div>
          <div>
            <DarkModeToggle />
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
