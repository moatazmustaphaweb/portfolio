import Link from "next/link";
import { setRequestLocale } from "next-intl/server";

import { CvRequestPanel } from "@/components/contact/CvRequestPanel";
import { ContactForm } from "@/components/contact/ContactForm";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { getPageSections } from "@/lib/content/pages";
import { getSettings } from "@/lib/content/settings";
import { getUiStrings } from "@/lib/content/ui";
import { pageMetadata } from "@/lib/seo/metadata";
import type { Locale } from "@/lib/content/types";
import { dirForLocale } from "@/lib/content/types";

/**
 * Contact — composed from `Contact.dc.html`.
 *
 * Two columns, not one: the ways to reach a person on one side, the form on
 * the other, so neither reads as the only option. The h1 is the opening
 * sentence rather than the word "Contact" — the same move the About design
 * makes, and for the same reason.
 *
 * "What happens next" sits inside the form card as mono micro-copy, where the
 * design puts it: it is a promise about the thing you just pressed, not a
 * separate topic.
 *
 * ⚠️ Form delivery is live (decision 044, option A) — Supabase table, honeypot,
 * timing check, global rate limit, no IP read or stored.
 */
/**
 * ISR window (decision 009). Next requires this to be a literal — an imported
 * constant fails the build with "Invalid segment configuration export".
 * See lib/content/revalidate.ts for why 300.
 */
export const revalidate = 300;

/**
 * The page's own lede becomes its preview description — the first real
 * sentence of the page, not the site-wide tagline.
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const l = locale as Locale;
  const [{ intro }, ui] = await Promise.all([
    getPageSections("contact", l),
    getUiStrings(l),
  ]);
  return pageMetadata({
    locale: l,
    path: "/contact",
    title: ui.t("page_contact"),
    description: intro,
  });
}

/**
 * Delivery is decided and built (decision 044, option A).
 *
 * Still a constant rather than an env var: this is a decision about where
 * personal data goes, and it should be visible in a diff.
 */
const CONTACT_DELIVERY_CONFIGURED = true;

/** See About — only promotes a short opening line to the h1. */
function splitLede(intro?: string): { headline?: string; rest?: string } {
  if (!intro) return {};
  const [first, ...others] = intro.split("\n\n");
  if (!first || first.length > 140) return { rest: intro };
  return { headline: first, rest: others.join("\n\n") || undefined };
}

export default async function Contact({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const l = locale as Locale;

  const [{ intro, sections }, ui, settings] = await Promise.all([
    getPageSections("contact", l),
    getUiStrings(l),
    getSettings(l),
  ]);

  const { headline, rest } = splitLede(intro);
  const email = settings.get("email");
  const linkedIn = settings.get("linkedin_url");

  /*
   * Positional, matching both the design's composition and the Notion order:
   * Reach me · Or write here · What happens next · Also here. Taken by index
   * rather than by heading text so the Arabic version maps identically.
   */
  const [methods, formIntro, whatNext, alsoHere] = sections;

  const subjectOptions = [
    { value: "hiring", label: ui.t("form_subject_hiring") },
    { value: "project", label: ui.t("form_subject_project") },
    { value: "speaking", label: ui.t("form_subject_speaking") },
    { value: "other", label: ui.t("form_subject_other") },
  ].filter((o) => o.label);

  return (
    <div className="mx-auto max-w-container px-gutter py-section-y">
      <Breadcrumb
        locale={l}
        label={ui.t("breadcrumb_label")}
        crumbs={[
          { label: ui.t("home") ?? "", href: "/" },
          { label: ui.t("page_contact") ?? "" },
        ]}
      />

      <h1 className="max-w-measure text-h2 text-fg">
        {headline ?? ui.t("page_contact")}
      </h1>
      {rest ? (
        <p className="mt-5 max-w-measure whitespace-pre-line text-body text-fg-muted">
          {rest}
        </p>
      ) : null}

      <div className="mt-14 grid items-start gap-10 lg:grid-cols-2 lg:gap-18">
        {/* Left — the direct routes. */}
        <div>
          {methods?.fields.body ? (
            <section>
              {methods.fields.heading ? (
                <h2
                  className="font-mono text-section uppercase text-fg-dim"
                  lang={methods.fieldLocales.heading}
                  dir={methods.fieldLocales.heading ? dirForLocale(methods.fieldLocales.heading) : undefined}
                >
                  {methods.fields.heading}
                </h2>
              ) : null}
              <p
                className="mt-4 max-w-measure whitespace-pre-line text-body text-fg-body"
                lang={methods.fieldLocales.body}
                dir={methods.fieldLocales.body ? dirForLocale(methods.fieldLocales.body) : undefined}
              >
                {methods.fields.body}
              </p>
            </section>
          ) : null}

          {/* The prose names these; these are the ones that work. */}
          <div className="mt-6 flex flex-col">
            {email ? (
              <a
                href={`mailto:${email}`}
                dir="ltr"
                className="border-t border-DEFAULT py-4 text-start text-body text-fg transition-colors hover:text-accent"
              >
                {email}
              </a>
            ) : null}
            {linkedIn && ui.t("linkedin") ? (
              <a
                href={linkedIn}
                rel="me noopener"
                className="flex items-center gap-3 border-t border-DEFAULT py-4 text-body text-fg transition-colors hover:text-accent"
              >
                {ui.t("linkedin")}
                <span aria-hidden="true" className="ms-auto text-fg-dim rtl:rotate-180">
                  →
                </span>
              </a>
            ) : null}
          </div>
        </div>

        {/* Right — the form, in its own card. */}
        <section className="rounded-panel border border-DEFAULT bg-surface p-card-p">
          {formIntro?.fields.heading ? (
            <h2
              className="font-mono text-label uppercase text-fg-dim"
              lang={formIntro.fieldLocales.heading}
              dir={formIntro.fieldLocales.heading ? dirForLocale(formIntro.fieldLocales.heading) : undefined}
            >
              {formIntro.fields.heading}
            </h2>
          ) : null}
          {formIntro?.fields.body ? (
            <p
              className="mt-4 whitespace-pre-line text-body-sm text-fg-muted"
              lang={formIntro.fieldLocales.body}
              dir={formIntro.fieldLocales.body ? dirForLocale(formIntro.fieldLocales.body) : undefined}
            >
              {formIntro.fields.body}
            </p>
          ) : null}

          <ContactForm
            strings={{
              name: ui.t("form_name"),
              email: ui.t("form_email"),
              subject: ui.t("form_subject"),
              subjectOptions,
              message: ui.t("form_message"),
              messagePlaceholder: ui.t("form_message_placeholder"),
              submit: ui.t("form_submit"),
              sending: ui.t("form_sending"),
              success: ui.t("form_success"),
              error: ui.t("form_error"),
              required: ui.t("form_required"),
            }}
            deliveryConfigured={CONTACT_DELIVERY_CONFIGURED}
            fallbackEmail={email}
          />

          {/* The promise about the button you just pressed. */}
          {whatNext?.fields.body ? (
            <p
              className="mt-6 whitespace-pre-line font-mono text-meta leading-relaxed text-fg-dim"
              lang={whatNext.fieldLocales.body}
              dir={whatNext.fieldLocales.body ? dirForLocale(whatNext.fieldLocales.body) : undefined}
            >
              {whatNext.fields.body}
            </p>
          ) : null}
        </section>
      </div>

      {/* "Also here" — the CV request opens a panel; there is no file. */}
      {alsoHere ? (
        <section className="mt-18 border-t border-DEFAULT pt-10">
          {alsoHere.fields.heading ? (
            <h2
              className="font-mono text-section uppercase text-fg-dim"
              lang={alsoHere.fieldLocales.heading}
              dir={alsoHere.fieldLocales.heading ? dirForLocale(alsoHere.fieldLocales.heading) : undefined}
            >
              {alsoHere.fields.heading}
            </h2>
          ) : null}
          <div className="mt-5 flex flex-wrap gap-3">
            {/*
              A request, not a download. The CV is not published as a file —
              a visitor asks and Moataz sends it. No longer gated on
              `settings.cv_url`, because there is no file to point at.
            */}
            <CvRequestPanel
              toAddress={settings.get("email")}
              strings={{
                trigger: ui.t("request_cv"),
                toLabel: ui.t("cv_to_label"),
                subjectLabel: ui.t("cv_subject_label"),
                subjectValue: ui.t("cv_subject_value"),
                greeting: ui.t("cv_greeting"),
                body: ui.t("cv_body"),
                optionalPlaceholder: ui.t("cv_optional_placeholder"),
                emailPlaceholder: ui.t("cv_email_placeholder"),
                close: ui.t("cv_close"),
                submit: ui.t("form_submit"),
                sending: ui.t("form_sending"),
                success: ui.t("form_success"),
                error: ui.t("form_error"),
              }}
            />
            {ui.t("page_work") ? (
              <Link
                href={`/${l}/work`}
                className="inline-flex h-control-h items-center rounded-control border border-DEFAULT px-4 text-ui text-fg-muted transition-colors hover:border-strong hover:text-fg"
              >
                {ui.t("page_work")}
              </Link>
            ) : null}
            {ui.t("page_about") ? (
              <Link
                href={`/${l}/about`}
                className="inline-flex h-control-h items-center rounded-control border border-DEFAULT px-4 text-ui text-fg-muted transition-colors hover:border-strong hover:text-fg"
              >
                {ui.t("page_about")}
              </Link>
            ) : null}
          </div>
        </section>
      ) : null}
    </div>
  );
}
