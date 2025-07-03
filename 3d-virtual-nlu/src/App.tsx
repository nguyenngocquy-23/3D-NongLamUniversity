import "./App.css";
import { DeviceInfoProvider } from "./contexts/DeviceInfoContext";
import { DOMAIN_CLIENT } from "./env";
import RouterConfig from "./Router";

import { BrowserRouter as Router } from "react-router-dom";

function App() {
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
