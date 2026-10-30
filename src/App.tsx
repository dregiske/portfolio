import { isHomePath } from "@/lib/isHomePath";
import { Home } from "@/pages/Home";
import { NotFound } from "@/pages/NotFound";

/**
 * Two pages, so no router — leaving react-router out keeps ~35 KB off the
 * bundle every visitor has to download before the page comes alive.
 */
function App() {
  return isHomePath(window.location.pathname) ? <Home /> : <NotFound />;
}

export default App;
