import React, { useEffect } from "react";
import Banner from "../../components/visitor/BannerContainer";
import CampusMap from "../../components/visitor/CampusMap";
import Lenis from "@studio-freight/lenis";
import TourOverview from "../../components/visitor/TourOverview";

const Home: React.FC = () => {
  useEffect(() => {
    const lenis = new Lenis();
    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);
  }, []);

  return (
    <main>
      <Banner />

      <CampusMap />

      <TourOverview />

      {/* <div className={styles.section2}></div> */}
    </main>
  );
};

export default Home;
