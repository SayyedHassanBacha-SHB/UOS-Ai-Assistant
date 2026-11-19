import { chunkText } from "./chunker";

const sampleText = `
# University of Swat

The University of Swat is a public university located in Khyber Pakhtunkhwa, Pakistan.

## Admissions

Students can apply for admission through the university admission process.

Applicants must check the admission requirements before submitting an application.

## Contact Information

The university provides official contact information through its website.

Visit https://uswat.edu.pk for more information.
`;

const chunks = chunkText(sampleText, {
  targetTokens: 30,
  maxTokens: 50,
  overlapTokens: 10,
});

console.log("Total chunks:", chunks.length);

chunks.forEach((chunk) => {
  console.log(`\n========== CHUNK ${chunk.index + 1} ==========`);
  console.log("Estimated tokens:", chunk.tokenCount);
  console.log(chunk.content);
});