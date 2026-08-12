import { getSettings } from "@/lib/content/settings";
import { siteUrl } from "@/lib/seo/site";
import type { Locale } from "@/lib/content/types";

/**
 * Person JSON-LD.
 *
 * This is half of the LLM read test, which is a launch gate: a recruiter pastes
 * a URL into ChatGPT or Claude and asks "should I interview this person?" The
 * answer has to come back accurate. Structured data is what stops the model
 * guessing at who the site belongs to.
 *
 * Every value comes from `settings` — nothing here is a literal, and a setting
 * that is still NULL is OMITTED rather than filled with a placeholder. A
 * fabricated `jobTitle` would be worse than an absent one: this markup is
 * machine-read and quoted back verbatim, so an invented claim would propagate
 * as fact. Rule 7 applies with more force here than anywhere else on the site.
 */
export async function PersonJsonLd({ locale }: { locale: Locale }) {
  const settings = await getSettings(locale);

  const name = settings.get("name");
  // Without a name there is no Person to describe. Emitting an anonymous
  // Person node would be worse than emitting nothing.
  if (!name) return null;

  // `description` is the domain line — the most useful single sentence for a
  // model summarising this site. Falls back to the tagline, which states a
  // position rather than a scope.
  const description = settings.get("description") ?? settings.get("tagline");
  const email = settings.get("email");
  const linkedin = settings.get("linkedin_url");

  const sameAs = [linkedin].filter((v): v is string => Boolean(v));

  const person = {
    "@context": "https://schema.org",
    "@type": "Person",
    name,
    url: `${siteUrl()}/${locale}`,
    ...(description ? { description } : {}),
    ...(email ? { email } : {}),
    ...(sameAs.length > 0 ? { sameAs } : {}),
  };

  return (
    <script
      type="application/ld+json"
      // Content is server-built from our own database, not user input. The
      // replace closes the one XSS vector that matters in a JSON-LD block:
      // a "</script>" sequence inside a string value.
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(person).replace(/</g, "\\u003c"),
      }}
    />
  );
}
