// Bunpro Grammar Scraper
// This script extracts grammar points from a Bunpro deck
// and formats them into a CSV file with one row per grammar point.

const fs = require("fs");

class BunproGrammarScraper {
  constructor() {
    this.baseUrl = "https://bunpro.jp";
    // this.deckUrl = "https://bunpro.jp/decks/nn10ai/Bunpro-N5-Grammar";
    // this.deckUrl = "https://bunpro.jp/decks/m7omkx/Bunpro-N4-Grammar";
    // this.deckUrl = "https://bunpro.jp/decks/cgwh1b/Bunpro-N3-Grammar";
    // this.deckUrl = "https://bunpro.jp/decks/a5gf35/Bunpro-N2-Grammar";
    this.deckUrl = "https://bunpro.jp/decks/lzqrdc/Bunpro-N1-Grammar";
    this.allGrammarPointsData = [];
  }

  // Function to extract grammar point URLs from the main deck page
  async extractGrammarPointUrls(deckHtml) {
    console.log("Parsing HTML for grammar points...");

    const grammarPoints = this.parseGrammarPointCardsFromHTML(deckHtml);

    if (grammarPoints.length > 0) {
      console.log(
        `Successfully extracted ${grammarPoints.length} grammar points from HTML`,
      );
      return grammarPoints;
    }

    console.log("Primary parsing failed, trying fallback method...");
    const fallbackPoints = this.extractGrammarPointLinksRegex(deckHtml);

    if (fallbackPoints.length > 0) {
      console.log(
        `Fallback method found ${fallbackPoints.length} grammar points`,
      );
      return fallbackPoints;
    }

    console.log("HTML parsing failed...");
    return [];
  }

  // Parse grammar point cards from HTML
  parseGrammarPointCardsFromHTML(html) {
    const grammarPoints = [];
    const cardRegex =
      /<div[^>]*js_decks-card_info[^>]*deck-info-card[^>]*>(.*?)<\/div>(?:\s*<\/div>)*/gs;
    const cardMatches = html.matchAll(cardRegex);

    for (const cardMatch of cardMatches) {
      const cardHTML = cardMatch[1];
      const hrefRegex = /<a[^>]*href="([^"]*grammar_points[^"]*)"[^>]*>/;
      const hrefMatch = cardHTML.match(hrefRegex);
      const titleRegex =
        /<p[^>]*(?:deck-card-title|v-text_large--400)[^>]*>(.*?)<\/p>/;
      const titleMatch = cardHTML.match(titleRegex);

      if (hrefMatch && titleMatch) {
        const href = hrefMatch[1];
        const name = titleMatch[1].trim();
        const fullUrl = href.startsWith("http")
          ? href
          : `https://bunpro.jp${href}`;

        grammarPoints.push({ name, url: fullUrl });
      }
    }

    return grammarPoints;
  }

  // Fallback method: Extract any grammar_points links from HTML
  extractGrammarPointLinksRegex(html) {
    const grammarPoints = [];
    const linkRegex =
      /<a[^>]*href="([^"]*\/grammar_points\/[^"]*)"[^>]*>(.*?)<\/a>/gs;
    const linkMatches = html.matchAll(linkRegex);

    for (const linkMatch of linkMatches) {
      const href = linkMatch[1];
      const linkHTML = linkMatch[0];

      const titlePatterns = [
        /<p[^>]*(?:deck-card-title|v-text_large--400)[^>]*>(.*?)<\/p>/,
        /<div[^>]*title[^>]*>(.*?)<\/div>/,
        />([\u3040-\u309f\u30a0-\u30ff\u4e00-\u9faf\s\+\(\)（）・～ー]+)</,
      ];

      let name = null;
      for (const pattern of titlePatterns) {
        const match = linkHTML.match(pattern);
        if (match) {
          name = match[1].trim();
          break;
        }
      }

      if (name && href) {
        const fullUrl = href.startsWith("http")
          ? href
          : `https://bunpro.jp${href}`;
        grammarPoints.push({ name, url: fullUrl });
      }
    }

    return grammarPoints.filter(
      (point, index, self) =>
        index === self.findIndex((p) => p.url === point.url),
    );
  }

  // Parse __NEXT_DATA__ JSON from the HTML string and return the reviewable object
  extractReviewableFromJSON(htmlContent) {
    const jsonMatch = htmlContent.match(
      /<script id="__NEXT_DATA__" type="application\/json">(.*?)<\/script>/s,
    );

    if (!jsonMatch) {
      throw new Error("No __NEXT_DATA__ script block found.");
    }

    const jsonData = JSON.parse(jsonMatch[1]);
    const reviewable = jsonData?.props?.pageProps?.reviewable;

    if (!reviewable) {
      throw new Error("No reviewable object found in pageProps.");
    }

    return reviewable;
  }

  // Convert array of objects to CSV string
  formatAsCSV(data) {
    if (data.length === 0) return "";

    // Extract unique headers across all rows just in case some objects have missing keys
    const headersSet = new Set();
    data.forEach((row) =>
      Object.keys(row).forEach((key) => headersSet.add(key)),
    );
    const headers = Array.from(headersSet);

    // Helper to safely format/escape values for CSV
    const escapeCSV = (val) => {
      if (val === null || val === undefined) return '""';
      // Stringify objects/arrays
      const str = typeof val === "object" ? JSON.stringify(val) : String(val);
      // Double up any double quotes and wrap in quotes
      return `"${str.replace(/"/g, '""')}"`;
    };

    const headerRow = headers.map(escapeCSV).join(",");
    const dataRows = data.map((row) =>
      headers.map((header) => escapeCSV(row[header])).join(","),
    );

    return [headerRow, ...dataRows].join("\n");
  }

  // Main function to process all grammar points
  async scrapeAllGrammarPoints() {
    console.log("Starting Bunpro Grammar Scraper...");

    try {
      console.log("Fetching main deck page...");
      const deckResponse = await fetch(this.deckUrl);
      const deckHtml = await deckResponse.text();

      console.log("Extracting grammar points from HTML...");
      const grammarPoints = await this.extractGrammarPointUrls(deckHtml);

      if (grammarPoints.length === 0) {
        throw new Error("No grammar points found in deck page");
      }

      console.log(`Found ${grammarPoints.length} total grammar points.`);

      for (const [index, grammarPoint] of grammarPoints.entries()) {
        console.log(
          `\nProcessing ${index + 1}/${grammarPoints.length}: ${grammarPoint.name}`,
        );

        try {
          const response = await fetch(grammarPoint.url);
          if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
          }

          const content = await response.text();
          const reviewableData = this.extractReviewableFromJSON(content);

          this.allGrammarPointsData.push(reviewableData);
          console.log(`✓ Extracted data for ${grammarPoint.name}`);

          // Add delay to be respectful to the server
          if (index < grammarPoints.length - 1) {
            await new Promise((resolve) => setTimeout(resolve, 1000));
          }
        } catch (error) {
          console.error(
            `✗ Failed to process ${grammarPoint.name}:`,
            error.message,
          );
        }
      }
    } catch (error) {
      console.error("Error in main generation process:", error.message);
    }

    return this.allGrammarPointsData;
  }

  // Generate the final CSV file
  async generateCSVFile() {
    const data = await this.scrapeAllGrammarPoints();
    const csvFormat = this.formatAsCSV(data);

    const filename = "bunpro_grammar_n1.csv";
    fs.writeFileSync(filename, csvFormat);

    console.log("\n=== CSV EXPORT COMPLETE ===");
    console.log(`✅ Successfully created ${filename} with ${data.length} rows`);
    console.log("📁 File location: " + process.cwd() + "/" + filename);

    return csvFormat;
  }
}

// Execute
async function main() {
  const scraper = new BunproGrammarScraper();
  await scraper.generateCSVFile();
}

main();
