import { useEffect } from "react";

const SITE_NAME = "MyRaagam";
const SITE_URL = "https://www.myraagam.com";

function upsertMeta({
  name,
  property,
  content,
}) {
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
  let link = document.head.querySelector('link[rel="canonical"]');

  if (!link) {
    link = document.createElement("link");
    link.setAttribute("rel", "canonical");
    document.head.appendChild(link);
  }

  link.setAttribute("href", url);
}

function upsertJsonLd(data) {
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
    const finalTitle = title || `${SITE_NAME} - Music Streaming`;

    const finalUrl =
      url ||
      `${SITE_URL}${window.location.pathname}${window.location.search}`;

    document.title = finalTitle;

    upsertMeta({
      name: "description",
      content: description,
    });

    upsertMeta({
      name: "robots",
      content: robots,
    });

    upsertCanonical(finalUrl);

    // Open Graph
    upsertMeta({
      property: "og:title",
      content: finalTitle,
    });

    upsertMeta({
      property: "og:description",
      content: description,
    });

    upsertMeta({
      property: "og:type",
      content: type,
    });

    upsertMeta({
      property: "og:url",
      content: finalUrl,
    });

    if (image) {
      upsertMeta({
        property: "og:image",
        content: image,
      });
    }

    upsertMeta({
      property: "og:site_name",
      content: SITE_NAME,
    });

    // Twitter / X
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
      content: description,
    });

    if (image) {
      upsertMeta({
        name: "twitter:image",
        content: image,
      });
    }

    // Structured data
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