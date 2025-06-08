import React, { useEffect } from "react";
import Banner from "../../components/visitor/BannerContainer";
import CampusMap from "../../components/visitor/CampusMap";
import TourOverview from "../../components/visitor/TourOverview";
import { useDispatch } from "react-redux";
import { fetchDefaultNodes, fetchIcons } from "../../redux/slices/DataSlice";
import { AppDispatch } from "../../redux/Store";

const Home: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    dispatch(fetchIcons());
    dispatch(fetchDefaultNodes());
  }, [dispatch]);

  return (
    <main>
      <Banner />

      <CampusMap />

      <TourOverview />
    </main>
  );
};

export default Home;
