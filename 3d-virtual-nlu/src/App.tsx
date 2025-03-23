import "./App.css";
import RouterConfig from "./Router";
import Home from "./pages/visitor/Home";

import { BrowserRouter as Router } from "react-router-dom";

function App() {
  return (
    <Router>
      <>
        <RouterConfig />
      </>
    </Router>
  );
}
export default App;
