import { useState } from "react";

export default function LazyImage({ src, alt, className }) {
  const [loaded, setLoaded] = useState(false);

  return (
    <div className="lazy-img-wrapper">
      {!loaded && <div className="skeleton" />}

      <img
        src={src}
        alt={alt}
        loading="lazy"
        onLoad={() => setLoaded(true)}
        className={className}
        style={{
          opacity: loaded ? 1 : 0,
        }}
      />
    </div>
  );
}