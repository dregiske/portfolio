import { Background } from "@/sections/Background/Background";
import { Tag } from "@/components/Tag/Tag";
import { Pill } from "@/components/Pill/Pill";
import "./NotFound.css";

export const NotFound = () => {
  return (
    <div className="notfound">
      <Background />

      <div className="notfound__inner">
        <Tag tone="clay" dot className="notfound__badge">
          Error — 404
        </Tag>

        <h1 className="notfound__title">
          Off the <span className="notfound__accent">trail</span>
        </h1>

        <p className="notfound__text">
          This page wandered off-piste — it doesn't exist (or got moved). Let's
          get you back on track.
        </p>

        <div className="notfound__actions">
          <Pill href="/" variant="solid" className="px-5 py-3">
            ← Back to home
          </Pill>
        </div>
      </div>
    </div>
  );
};
