// import { useEffect } from "react";

// const SITE_NAME = "MyRaagam";
// const SITE_URL = "https://www.myraagam.com";

// function upsertMeta({
//   name,
//   property,
//   content,
// }) {
//   if (!content) return;

//   const selector = name
//     ? `meta[name="${name}"]`
//     : `meta[property="${property}"]`;

//   let element = document.head.querySelector(selector);

//   if (!element) {
//     element = document.createElement("meta");

//     if (name) {
//       element.setAttribute("name", name);
//     } else {
//       element.setAttribute("property", property);
//     }

//     document.head.appendChild(element);
//   }

//   element.setAttribute("content", content);
// }

// function upsertCanonical(url) {
//   let link = document.head.querySelector('link[rel="canonical"]');

//   if (!link) {
//     link = document.createElement("link");
//     link.setAttribute("rel", "canonical");
//     document.head.appendChild(link);
//   }

//   link.setAttribute("href", url);
// }

// function upsertJsonLd(data) {
//   let script = document.head.querySelector(
//     'script[data-myraagam-seo="jsonld"]'
//   );

//   if (!script) {
//     script = document.createElement("script");
//     script.type = "application/ld+json";
//     script.setAttribute("data-myraagam-seo", "jsonld");
//     document.head.appendChild(script);
//   }

//   script.textContent = JSON.stringify(data);
// }

// function removeJsonLd() {
//   const script = document.head.querySelector(
//     'script[data-myraagam-seo="jsonld"]'
//   );

//   if (script) {
//     script.remove();
//   }
// }

// export default function SEO({
//   title,
//   description,
//   image,
//   url,
//   robots = "index, follow",
//   type = "website",
//   jsonLd = null,
// }) {
//   useEffect(() => {
//     const finalTitle = title || `${SITE_NAME} - Music Streaming`;

//     const finalUrl =
//       url ||
//       `${SITE_URL}${window.location.pathname}${window.location.search}`;

//     document.title = finalTitle;

//     upsertMeta({
//       name: "description",
//       content: description,
//     });

//     upsertMeta({
//       name: "robots",
//       content: robots,
//     });

//     upsertCanonical(finalUrl);

//     upsertMeta({
//       property: "og:title",
//       content: finalTitle,
//     });

//     upsertMeta({
//       property: "og:description",
//       content: description,
//     });

//     upsertMeta({
//       property: "og:type",
//       content: type,
//     });

//     upsertMeta({
//       property: "og:url",
//       content: finalUrl,
//     });

//     if (image) {
//       upsertMeta({
//         property: "og:image",
//         content: image,
//       });
//     }

//     upsertMeta({
//       property: "og:site_name",
//       content: SITE_NAME,
//     });

//     upsertMeta({
//       name: "twitter:card",
//       content: image ? "summary_large_image" : "summary",
//     });

//     upsertMeta({
//       name: "twitter:title",
//       content: finalTitle,
//     });

//     upsertMeta({
//       name: "twitter:description",
//       content: description,
//     });

//     if (image) {
//       upsertMeta({
//         name: "twitter:image",
//         content: image,
//       });
//     }

//     if (jsonLd) {
//       upsertJsonLd(jsonLd);
//     } else {
//       removeJsonLd();
//     }

//     return () => {
//       removeJsonLd();
//     };
//   }, [
//     title,
//     description,
//     image,
//     url,
//     robots,
//     type,
//     jsonLd,
//   ]);

//   return null;
// }


import { useEffect } from "react";

const SITE_NAME = "MyRaagam";
const SITE_URL = "https://www.myraagam.com";

function upsertMeta({ name, property, content }) {
  if (!content) return;

  const selector = name
    ? `meta[name="${name}"]`
    : `meta[property="${property}"]`;

  let element = document.head.querySelector(selector);

  if (!element) {
    element = document.createElement("meta");

    if (name) {
      element.setAttribute("name", name);
    } else {
      element.setAttribute("property", property);
    }

    document.head.appendChild(element);
  }

  element.setAttribute("content", content);
}

function upsertCanonical(url) {
  if (!url) return;

  let link = document.head.querySelector('link[rel="canonical"]');

  if (!link) {
    link = document.createElement("link");
    link.setAttribute("rel", "canonical");
    document.head.appendChild(link);
  }

  link.setAttribute("href", url);
}

function upsertJsonLd(data) {
  if (!data) return;

  let script = document.head.querySelector(
    'script[data-myraagam-seo="jsonld"]'
  );

  if (!script) {
    script = document.createElement("script");
    script.type = "application/ld+json";
    script.setAttribute("data-myraagam-seo", "jsonld");
    document.head.appendChild(script);
  }

  script.textContent = JSON.stringify(data);
}

function removeJsonLd() {
  const script = document.head.querySelector(
    'script[data-myraagam-seo="jsonld"]'
  );

  if (script) {
    script.remove();
  }
}

function normalizePath(pathname) {
  if (!pathname) return "/";

  // Remove trailing slash except for homepage
  if (pathname !== "/" && pathname.endsWith("/")) {
    return pathname.slice(0, -1);
  }

  return pathname;
}

function buildCanonicalUrl(url) {
  if (url) {
    return url.endsWith("/") && url !== SITE_URL
      ? url.slice(0, -1)
      : url;
  }

  const cleanPath = normalizePath(window.location.pathname);

  return `${SITE_URL}${cleanPath}`;
}

export default function SEO({
  title,
  description,
  image,
  url,
  robots = "index, follow",
  type = "website",
  jsonLd = null,
}) {
  useEffect(() => {
    const finalTitle =
      title || `${SITE_NAME} – Telugu Songs & Music`;

    const finalDescription =
      description ||
      "Discover Telugu songs, movie soundtracks and music on MyRaagam.";

    const finalUrl = buildCanonicalUrl(url);

    document.title = finalTitle;

    // ---------------- META ----------------

    upsertMeta({
      name: "description",
      content: finalDescription,
    });

    upsertMeta({
      name: "robots",
      content: robots,
    });

    // ---------------- CANONICAL ----------------

    upsertCanonical(finalUrl);

    // ---------------- OPEN GRAPH ----------------

    upsertMeta({
      property: "og:title",
      content: finalTitle,
    });

    upsertMeta({
      property: "og:description",
      content: finalDescription,
    });

    upsertMeta({
      property: "og:type",
      content: type,
    });

    upsertMeta({
      property: "og:url",
      content: finalUrl,
    });

    upsertMeta({
      property: "og:site_name",
      content: SITE_NAME,
    });

    if (image) {
      upsertMeta({
        property: "og:image",
        content: image,
      });
    }

    // ---------------- TWITTER / X ----------------

    upsertMeta({
      name: "twitter:card",
      content: image ? "summary_large_image" : "summary",
    });

    upsertMeta({
      name: "twitter:title",
      content: finalTitle,
    });

    upsertMeta({
      name: "twitter:description",
      content: finalDescription,
    });

    if (image) {
      upsertMeta({
        name: "twitter:image",
        content: image,
      });
    }

    // ---------------- STRUCTURED DATA ----------------

    if (jsonLd) {
      upsertJsonLd(jsonLd);
    } else {
      removeJsonLd();
    }

    return () => {
      removeJsonLd();
    };
  }, [
    title,
    description,
    image,
    url,
    robots,
    type,
    jsonLd,
  ]);

  return null;
}