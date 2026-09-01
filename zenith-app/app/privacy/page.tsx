import type { Metadata } from "next";
import LegalDocument from "@/components/LegalDocument";

export const metadata: Metadata = { title: "Privacy policy" };

export default function PrivacyPage() {
  return (
    <LegalDocument
      eyebrow="Privacy"
      title="Privacy policy"
      intro="Zenith uses project inputs to produce solar planning estimates. This draft documents the current private-beta behavior and must be replaced with an owner-approved policy and verified data map before public launch."
      sections={[
        { title: "What the beta stores", paragraphs: ["Saved feasibility snapshots currently remain in the browser that created them. The workspace provides a local JSON backup and clear-snapshots control, but this is not a substitute for a customer account, server backup, team workspace, or production deletion workflow."] },
        { title: "Uploaded documents and media", paragraphs: ["When a user initiates bill or rooftop analysis, the selected image or extracted video frame is sent to the configured AI analysis endpoint. The production data-retention terms, provider configuration, and user deletion process must be confirmed before commercial use."] },
        { title: "What must be completed before launch", paragraphs: ["Publish a verified data inventory, lawful basis and consent flow, retention schedule, deletion/export process, subprocessors, security contact, incident process, and a jurisdiction-appropriate privacy notice."] },
      ]}
    />
  );
}
