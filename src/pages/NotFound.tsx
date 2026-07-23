import { Eyebrow } from "@/components/Eyebrow/Eyebrow";
import { Pill } from "@/components/Pill/Pill";
import "./NotFound.css";

export const NotFound = () => {
  return (
    <div className="notfound">
      <div className="notfound__inner">
        <Eyebrow num="404" label="OFF THE TRAIL" />

        <h1 className="notfound__title">Not found</h1>

        <p className="notfound__text">
          This page wandered off-piste — it doesn't exist (or got moved). Let's
          get you back on track.
        </p>

        <div className="notfound__actions">
          <Pill href="/" variant="solid">
            ← Back to home
          </Pill>
        </div>
      </div>
    </div>
  );
};
