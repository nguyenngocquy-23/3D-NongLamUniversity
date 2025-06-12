import "./App.css";
import { DOMAIN_CLIENT } from "./env";
import RouterConfig from "./Router";

import { BrowserRouter as Router } from "react-router-dom";

function App() {
  return (
    <Router basename={DOMAIN_CLIENT}>
      <>
        <RouterConfig />
      </>
    </Router>
  );
}
export default App;
