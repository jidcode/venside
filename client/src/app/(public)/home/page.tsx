import React from "react";
import Navbar from "./_components/navbar";
import HeroPage from "./_components/hero";

const Homepage = () => {
  return (
    <div className="bg-primary text-secondary">
      <Navbar />
      <HeroPage />
    </div>
  );
};

export default Homepage;
