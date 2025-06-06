import React, { useEffect } from "react";
import Banner from "../../components/visitor/BannerContainer";
import CampusMap from "../../components/visitor/CampusMap";
import styles from "../../styles/home.module.css";
import TourOverview from "../../components/visitor/TourOverview";
import { useDispatch } from "react-redux";
import { fetchDefaultNodes, fetchIcons } from "../../redux/slices/DataSlice";
import { AppDispatch } from "../../redux/Store";
import ScrollOnTop from "../../components/visitor/ScrollOnTop";

const Home: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    dispatch(fetchIcons());
    dispatch(fetchDefaultNodes());
  }, [dispatch]);

  const defaultNodeJson = localStorage.getItem("defaultNode");
  const defaultNode = defaultNodeJson ? JSON.parse(defaultNodeJson) : null;

  // useEffect(() => {
  //   const lenis = new Lenis();
  //   function raf(time: number) {
  //     lenis.raf(time);
  //     requestAnimationFrame(raf);
  //   }
  //   requestAnimationFrame(raf);
  // }, []);

  return (
    <main className={styles.homeContainer}>
      <Banner />

      <CampusMap />

      <TourOverview defaultNode={defaultNode} />

      <ScrollOnTop />
    </main>
  );
};

export default Home;
