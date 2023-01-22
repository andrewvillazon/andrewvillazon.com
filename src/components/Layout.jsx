import React from "react";
import Navigation from "./Navigation";

const Layout = ({ children }) => {
  return (
    <>
      <Navigation />
      <main className="mt-24">{children}</main>
      {/* TODO: Footer */}
    </>
  );
};

export default Layout;
