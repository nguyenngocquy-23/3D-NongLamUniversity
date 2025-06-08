import React, { useEffect } from "react";
import Banner from "../../components/visitor/BannerContainer";
import CampusMap from "../../components/visitor/CampusMap";
import styles from "../../styles/home.module.css";
import TourOverview from "../../components/visitor/TourOverview";
import { useDispatch } from "react-redux";
import { fetchDefaultNodes, fetchIcons } from "../../redux/slices/DataSlice";
import { AppDispatch } from "../../redux/Store";
import ScrollOnTop from "../../components/visitor/ScrollOnTop";
import Introduce from "../../components/visitor/Introduce";
import Contact from "../../components/visitor/Contact";
import Footer from "../../components/visitor/Footer";

const Home: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    dispatch(fetchIcons());
    dispatch(fetchDefaultNodes());
  }, [dispatch]);

  return (
    <main className={styles.homeContainer}>
      <Banner />

      <CampusMap />

      <Introduce />

      <TourOverview />

      <Contact />

      <Footer/>

      <ScrollOnTop />
    </main>
  );
};

export default Home;
