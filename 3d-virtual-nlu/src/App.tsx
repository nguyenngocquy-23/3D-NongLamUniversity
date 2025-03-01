import "./App.css";
import RouterConfig from "./components/Router";
import Home from "./components/HomePage/Home";
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
