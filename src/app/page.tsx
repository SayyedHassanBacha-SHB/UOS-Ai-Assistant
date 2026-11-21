import Chatbot from "@/components/chatbot/Chatbot";
import { AUTHOR, SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "../lib/site";

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: SITE_NAME,
  alternateName: "UoS AI Assistant",
  url: SITE_URL,
  description: SITE_DESCRIPTION,
  applicationCategory: "EducationalApplication",
  operatingSystem: "Any",
  inLanguage: "en",
  isAccessibleForFree: true,
  offers: { "@type": "Offer", price: "0", priceCurrency: "PKR" },
  author: { "@type": "Person", name: AUTHOR },
  about: {
    "@type": "CollegeOrUniversity",
    name: "University of Swat",
    url: "https://uswat.edu.pk",
  },
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
