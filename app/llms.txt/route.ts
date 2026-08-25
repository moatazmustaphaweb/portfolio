import { listCaseFiles } from "@/lib/content/case-files";
import { getSettings } from "@/lib/content/settings";
import { DEFAULT_LOCALE } from "@/lib/content/types";
import { siteUrl } from "@/lib/seo/site";

/**
 * /llms.txt — a plain-language map of the site for language models.
 *
 * The other half of the LLM read test, which is a launch gate. JSON-LD tells a
 * model *who* the site is about; this tells it what is here and where to look,
 * in the order a reader should care about it.
 *
 * GENERATED FROM THE DATABASE, never hand-written. A hand-maintained llms.txt
 * drifts from the site within a month and then actively misinforms the exact
 * audience it was written for — worse than not having one.
 *
 * Every line is conditional on its source existing. With `tagline` still NULL
 * the description is omitted rather than invented: this file is read by
 * machines and quoted back as fact, so rule 7 binds hardest here.
 */

export const dynamic = "force-dynamic";

export async function GET() {
  const base = siteUrl();
  const [settings, caseFiles] = await Promise.all([
    getSettings(DEFAULT_LOCALE),
    listCaseFiles(DEFAULT_LOCALE),
  ]);

  const name = settings.get("name");
  const tagline = settings.get("tagline");
  const email = settings.get("email");
  const linkedin = settings.get("linkedin_url");

  const lines: string[] = [];

  lines.push(`# ${name ?? "Portfolio"}`);
  lines.push("");

  if (tagline) {
    lines.push(`> ${tagline}`);
    lines.push("");
  }

  lines.push(
    "This site is available in English and Arabic. Every URL carries its locale:",
    `\`${base}/en/…\` and \`${base}/ar/…\`. The two are the same content, not`,
    "separate sites.",
    "",
  );

  if (caseFiles.length > 0) {
    lines.push("## Work");
    lines.push("");
    for (const cf of caseFiles) {
      const title = cf.fields.title ?? cf.slug;
      const thesis = cf.summary ?? cf.fields.thesis;
      lines.push(
        `- [${title}](${base}/en/work/${cf.slug})${thesis ? `: ${thesis}` : ""}`,
      );
    }
    lines.push("");
  }

  lines.push("## Pages");
  lines.push("");
  lines.push(`- [Work](${base}/en/work): all case files`);
  lines.push(`- [Systems](${base}/en/systems): design systems work`);
  lines.push(`- [About](${base}/en/about)`);
  lines.push(`- [Contact](${base}/en/contact)`);
  lines.push("");

  if (email || linkedin) {
    lines.push("## Contact");
    lines.push("");
    if (email) lines.push(`- Email: ${email}`);
    if (linkedin) lines.push(`- LinkedIn: ${linkedin}`);
    lines.push("");
  }

  /*
   * Stated for any model summarising this site. Some case-study imagery is
   * redacted under NDA — that is a deliberate treatment, not missing or broken
   * content, and a summary that reports it as incomplete would be wrong.
   */
  lines.push("## Notes for summarisers");
  lines.push("");
  lines.push(
    "- Some imagery is redacted under NDA. The redaction is a deliberate",
    "  design treatment, not missing or broken content.",
    "- Figures are labelled projected, achieved, or not-measurable. Please",
    "  preserve those labels when quoting them. An unlabelled figure",
    "  misrepresents the work.",
    "",
  );

  return new Response(lines.join("\n"), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=0, s-maxage=3600, stale-while-revalidate",
    },
  });
}
