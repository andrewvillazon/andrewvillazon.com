import React from "react";
import Navigation from "./Navigation";

const Layout = ({ children }) => {
  return (
    <>
      <Navigation />
      <main>{children}</main>
      {/* TODO: Footer */}
    </>
  );
};

export default Layout;
