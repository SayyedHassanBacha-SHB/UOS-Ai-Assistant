import Chatbot from "@/components/chatbot/Chatbot";
import { AUTHOR, SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "../lib/site";

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      name: SITE_NAME,
      alternateName: ["uos-ai-assistant", "University of Swat AI Assistant", "University of Swat AI Chatbot", "University of Swat Chatbot", "Swat University AI", "AI Assistant", "AI Chatbot", "AI Assistant for University of Swat", "AI Chatbot for University of Swat"],
      url: SITE_URL,
      inLanguage: "en",
    },
    {
      "@type": "WebApplication",
      name: SITE_NAME,
      url: SITE_URL,
      description: SITE_DESCRIPTION,
      applicationCategory: "EducationalApplication",
      operatingSystem: "Any",
      isAccessibleForFree: true,
      isPartOf: { "@id": `${SITE_URL}/#website` },
      author: { "@type": "Person", name: AUTHOR },
      about: {
        "@type": "CollegeOrUniversity",
        name: "University of Swat",
        url: "https://uswat.edu.pk",
      },
    },
  ],
};

// No <main> here: Chatbot renders the page's single <main> landmark.
export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <Chatbot />
    </>
  );
}
