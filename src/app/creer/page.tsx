import type { Metadata } from "next";
import { ExperienceLoader } from "@/components/experience/ExperienceLoader";
import { SiteHeader } from "@/components/SiteChrome";

export const metadata: Metadata = {
  title: "Créer",
};

export default function CreatePage() {
  return (
    <>
      <SiteHeader />
      <ExperienceLoader />
    </>
  );
}
