import axios from "axios";
import { useEffect } from "react";
import { API_URLS } from "../env";

const useSyncTourViews = () => {
  useEffect(() => {
    const interval = setInterval(() => {
      const raw = sessionStorage.getItem("tour-views");
      if (!raw) return;

      const views = JSON.parse(raw);
      console.log("Syncing tour views:", views);

      if (Object.keys(views).length === 0) return;

      axios.post(API_URLS.INCREASE_NODE_VIEW, 
        views,
      ).then(() => {
        sessionStorage.removeItem("tour-views");
      });
    }, 10 * 60 * 1000); // 10 phút

    return () => clearInterval(interval);
  }, []);
};

export default useSyncTourViews;
