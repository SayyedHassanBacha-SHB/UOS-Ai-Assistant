import { cleanText } from "./text-cleaner";

const sample = `
# University of Swat


Welcome   to   University of Swat.


## Admissions

Apply online.   
Visit https://uswat.edu.pk
`;

console.log(cleanText(sample));