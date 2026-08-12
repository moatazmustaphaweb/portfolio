import Link from "next/link";
import { setRequestLocale } from "next-intl/server";

import { ContactForm } from "@/components/contact/ContactForm";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { getPageSections } from "@/lib/content/pages";
import { getSettings } from "@/lib/content/settings";
import { getUiStrings } from "@/lib/content/ui";
import type { Locale } from "@/lib/content/types";

/**
 * Contact.
 *
 * Four sections from Notion, in order: the intro, Reach me, Or write here,
 * What happens next, Also here. The form is mounted inside "Or write here"
 * rather than after all the prose, because that heading is what introduces it.
 *
 * ⚠️ Form delivery is open question D — see `ContactForm`. Until it is
 * answered, `deliveryConfigured` is false and the form offers the direct email
 * instead of a submit button. Nothing collects personal data in the meantime.
 *
 * The CV link is absent while `settings.cv_url` is null. That is the fallback
 * rule doing its job — no placeholder, no "coming soon", no disabled button.
 */
/**
 * ISR window (decision 009). Next requires this to be a literal — an imported
 * constant fails the build with "Invalid segment configuration export".
 * See lib/content/revalidate.ts for why 300.
 */
export const revalidate = 300;

/**
 * Delivery is undecided (question D), so this is false.
 *
 * A constant rather than an env var on purpose: the missing piece is a
 * DECISION, not configuration, and an env var would let it be switched on
 * without one being made.
 */
const CONTACT_DELIVERY_CONFIGURED = false;

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

  const email = settings.get("email");
  const cvUrl = settings.get("cv_url");
  const linkedIn = settings.get("linkedin_url");

  const subjectOptions = [
    { value: "hiring", label: ui.t("form_subject_hiring") },
    { value: "project", label: ui.t("form_subject_project") },
    { value: "speaking", label: ui.t("form_subject_speaking") },
    { value: "other", label: ui.t("form_subject_other") },
  ].filter((o) => o.label);

  return (
    <div className="mx-auto max-w-prose px-gutter py-section-y">
      <Breadcrumb
        locale={l}
        label={ui.t("breadcrumb_label")}
        crumbs={[
          { label: ui.t("home") ?? "", href: "/" },
          { label: ui.t("page_contact") ?? "" },
        ]}
      />

      {ui.t("page_contact") ? (
        <h1 className="max-w-measure text-title text-fg">{ui.t("page_contact")}</h1>
      ) : null}

      {intro ? (
        <p className="mt-6 max-w-measure whitespace-pre-line text-lead text-fg-body">
          {intro}
        </p>
      ) : null}

      {sections.map((section) => {
        if (!section.fields.body && section.slug !== "or-write-here") return null;

        return (
          <section key={section.id} className="mt-14">
            {section.fields.heading ? (
              <h2 className="mb-4 max-w-measure text-h3 text-fg">
                {section.fields.heading}
              </h2>
            ) : null}

            {section.fields.body ? (
              <p className="max-w-measure whitespace-pre-line text-body text-fg-body">
                {section.fields.body}
              </p>
            ) : null}

            {/*
              The form belongs under its own heading, not after the whole page.
              "Or write here" is the sentence that introduces it.
            */}
            {section.slug === "or-write-here" ? (
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
            ) : null}

            {/*
              "Also here" — the prose names these; these are the working links.
              The CV is simply absent until `settings.cv_url` exists.
            */}
            {section.slug === "also-here" ? (
              <div className="mt-6 flex flex-wrap gap-3">
                {cvUrl && ui.t("download_cv") ? (
                  <a
                    href={cvUrl}
                    className="inline-flex h-control-h items-center rounded-control border border-strong px-5 text-ui text-fg transition-colors hover:border-fg"
                  >
                    {ui.t("download_cv")}
                  </a>
                ) : null}
                {linkedIn && ui.t("linkedin") ? (
                  <a
                    href={linkedIn}
                    rel="me noopener"
                    className="inline-flex h-control-h items-center rounded-control border border-DEFAULT px-4 text-ui text-fg-muted transition-colors hover:border-strong hover:text-fg"
                  >
                    {ui.t("linkedin")}
                  </a>
                ) : null}
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
            ) : null}
          </section>
        );
      })}
    </div>
  );
}
