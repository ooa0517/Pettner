# **App Name**: Pettner Ingredient Analyzer

## Core Features:

- Image Upload and Storage: Upload images of pet food ingredient labels to Firebase Storage.
- Text Extraction and Analysis: Extract text from uploaded images using Gemini Pro Vision (or Genkit) to analyze ingredient information.
- AI Analysis Result Display: Display structured analysis results, including product name, summary headline, ingredient details (positive/cautionary), nutritional insights, and hidden details.
- Structured Data Storage: Store analysis results in Firestore, indexing key ingredient information for future matching with pet profiles.
- AI-Powered Summary Generation: Generate a concise one-line summary of the analysis results using Gemini, highlighting key information and potential concerns; the LLM acts as a tool here because it conditionally includes information in its answer.

## Style Guidelines:

- Primary color: Sky Blue (#87CEEB) to inspire trust and confidence.
- Background color: Light Gray (#F5F5F5) to provide a clean and neutral backdrop.
- Accent color: Soft Orange (#FFB347) to highlight cautionary ingredients.
- Body and headline font: 'Inter' (sans-serif) to ensure excellent readability and a professional look. Note: currently only Google Fonts are supported.
- Clean, grid-based layout to organize complex information clearly.
- Use minimalistic, professional icons to represent ingredient categories and analysis insights.
- Subtle loading animations to indicate AI analysis progress.