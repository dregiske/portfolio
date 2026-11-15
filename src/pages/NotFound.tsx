import { Button } from "@/components/Button/Button";
import { KoiLayer } from "@/components/SiteBackground/KoiLayer";
import "./NotFound.css";

/**
 * The lost-visitor page: the home page's koi still swimming behind it (just
 * the koi — no aura, since there's no scroll to drive its fade), so a wrong
 * turn still feels like the same site.
 */
export const NotFound = () => {
  return (
    <div className="notfound">
      <KoiLayer />
      <div className="notfound__inner">
        <h1 className="notfound__title">Not found :(</h1>

        <p className="notfound__text">
          This page wandered off-piste. This page doesn't exist (or got moved).
          Let's get you back on track.
        </p>

        <div className="notfound__actions">
          <Button href="/">← Back to home</Button>
        </div>
      </div>
    </div>
  );
};
