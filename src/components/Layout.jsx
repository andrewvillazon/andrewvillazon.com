import React from "react";
import Footer from "./Footer";
import Navigation from "./Navigation";

const Layout = ({ children }) => {
  return (
    <>
      <Navigation />
      <main className="mt-24">{children}</main>
      <Footer/>
    </>
  );
};

export default Layout;
