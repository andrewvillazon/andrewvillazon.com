import * as React from "react";
import DarkModeToggle from "../components/DarkmodeToggle";

const IndexPage = () => {
  return (
    <main>
      <section>
        <nav>
          <div className="container mx-auto">
            <div className="text-2xl font-bold text-gray-900 pt-8 pb-4">
              Andrew Villazon
            </div>
            <div className="container mx-auto flex justify-between h16 items-center">
              <div class="flex space-x-5">
                <a
                  href="#"
                  class="py-2 text-base font-medium hover:border-b-gray-200 border-transparent border-y-2"
                >
                  Blog
                </a>
                <a
                  href="#"
                  class="py-2 text-base font-medium hover:border-b-gray-200 border-transparent border-y-2"
                >
                  About
                </a>
                <a
                  href="#"
                  class="py-2 text-base font-medium hover:border-b-gray-200 border-transparent border-y-2"
                >
                  Contact
                </a>
              </div>
              <div>
                <DarkModeToggle></DarkModeToggle>
              </div>
            </div>
          </div>
        </nav>
      </section>
    </main>
  );
};

export default IndexPage;

export const Head = () => <title>Home Page</title>;
