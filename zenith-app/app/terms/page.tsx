import type { Metadata } from "next";
import LegalDocument from "@/components/LegalDocument";

export const metadata: Metadata = { title: "Terms of service" };

export default function TermsPage() {
  return (
    <LegalDocument
      eyebrow="Terms"
      title="Terms of service"
      intro="Zenith is currently a private-beta planning workspace. These draft terms describe the intended boundary of the product and are not a substitute for legal review or a signed commercial agreement."
      sections={[
        { title: "Planning aid, not a guarantee", paragraphs: ["Outputs are estimates based on user inputs, configured assumptions, and policy data. They are not a promise of savings, subsidy approval, energy production, financing, or installer performance."] },
        { title: "User responsibility", paragraphs: ["Users must verify bills, tariffs, eligibility, structural conditions, electrical design, permissions, and installer proposals with qualified professionals before making a purchase or operating decision."] },
        { title: "Commercial terms to add", paragraphs: ["Before paid access, publish approved subscription terms, billing and cancellation rules, support commitments, acceptable-use rules, service availability, liability limits, dispute terms, and an accountable business contact."] },
      ]}
    />
  );
}
