import React, { useEffect } from "react";
import Banner from "../../components/visitor/BannerContainer";
import CampusMap from "../../components/visitor/CampusMap";
import Lenis from "@studio-freight/lenis";
import TourOverview from "../../components/visitor/TourOverview";
import { useDispatch } from "react-redux";
import {
  fetchDefaultNodes,
  fetchIcons,
  fetchMasterNodes,
} from "../../redux/slices/DataSlice";
import { AppDispatch } from "../../redux/Store";

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
    <main>
      <Banner />

      <CampusMap />

      <TourOverview defaultNode={defaultNode} />
    </main>
  );
};

export default Home;
