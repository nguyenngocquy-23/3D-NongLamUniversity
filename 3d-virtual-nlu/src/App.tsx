import "./App.css";
import { DeviceInfoProvider } from "./contexts/DeviceInfoContext";
import { DOMAIN_CLIENT } from "./env";
import useSyncTourViews from "./hooks/useSyncTourView";
import RouterConfig from "./Router";

import { BrowserRouter as Router } from "react-router-dom";

function App() {
  useSyncTourViews();
  return (
    <DeviceInfoProvider>
      <Router basename={DOMAIN_CLIENT}>
        <>
          <RouterConfig />
        </>
      </Router>
    </DeviceInfoProvider>
  );
}
export default App;
