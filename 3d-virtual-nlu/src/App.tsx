import "./App.css";
import { DeviceInfoProvider } from "./contexts/DeviceInfoContext";
import { ImageCacheProvider } from "./contexts/ImageCacheContext";
import { DOMAIN_CLIENT } from "./env";
import useSyncTourViews from "./hooks/useSyncTourView";
import RouterConfig from "./Router";

import { BrowserRouter as Router } from "react-router-dom";

function App() {
  useSyncTourViews();
  return (
    <DeviceInfoProvider>
      <ImageCacheProvider>
        <Router basename={DOMAIN_CLIENT}>
          <>
            <RouterConfig />
          </>
        </Router>
      </ImageCacheProvider>
    </DeviceInfoProvider>
  );
}
export default App;
