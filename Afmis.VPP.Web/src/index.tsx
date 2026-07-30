import ReactDOM from "react-dom/client";
import App from "./App";
import "./i18n";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import store from "./store";
import { applyStoredLayoutMode } from "./store/layouts/preferences";

applyStoredLayoutMode();

const root = ReactDOM.createRoot(document.getElementById("root")!);
root.render(
  <Provider store={store}>
    <BrowserRouter>
      <App /> 
    </BrowserRouter>
  </Provider>
);
