import type { Metadata } from "next";
import LegalDocument from "@/components/LegalDocument";

export const metadata: Metadata = { title: "MNRE and model disclaimer" };

export default function DisclaimerPage() {
  return (
    <LegalDocument
      eyebrow="Model boundaries"
      title="MNRE and model disclaimer"
      intro="Zenith does not issue government approvals, engineering certificates, tax advice, structural assessments, or grid-control commands. The private-beta product is designed to help users frame questions for qualified reviewers."
      sections={[
        { title: "Policy estimates", paragraphs: ["Subsidy and incentive values can depend on the current scheme, application date, consumer category, DISCOM, approved vendor, commissioning evidence, and other eligibility conditions. Verify every value against the current official source before relying on it."] },
        { title: "Rooftop assessment", paragraphs: ["The rooftop workflow is a preliminary visual planning aid. It is not a structural, electrical, fire-safety, shading, geospatial, or bankable site survey. A qualified professional must complete the final design and inspection."] },
        { title: "Microgrid scenarios", paragraphs: ["Grid and peer-to-peer views are simulations for scenario exploration. They do not connect to, monitor, dispatch, or control a utility grid or neighborhood infrastructure."] },
      ]}
    />
  );
}
