import { describe, expect, it } from "vitest";
import { scrubDetails, scrubName, scrubProse } from "@/lib/catalogue/store-name";

describe("scrubName (brands, titles, detail values)", () => {
  it("drops the store name from brand names", () => {
    expect(scrubName("Amazon Basics")).toBe("Basics");
    expect(scrubName("Amazon Essentials")).toBe("Essentials");
    expect(scrubName("Amazon Renewed")).toBe("Renewed");
  });

  it("falls back to Generic when nothing is left", () => {
    expect(scrubName("Amazon")).toBe("Generic");
    expect(scrubName("amazon.com")).toBe("Generic");
  });

  it("removes it from titles and tidies the spacing and punctuation", () => {
    expect(scrubName("Amazon Basics 6-Outlet Surge Protector")).toBe("Basics 6-Outlet Surge Protector");
    expect(scrubName("Apple iPhone XR (Renewed) - Amazon Exclusive")).toBe("Apple iPhone XR (Renewed) - Exclusive");
    expect(scrubName("Gift Card for Amazon's Store, Blue")).toBe("Gift Card for Store, Blue");
  });

  it("splits the name off a joined, capitalised word", () => {
    expect(scrubName("Top Selection from AmazonPets")).toBe("Top Selection from Pets");
  });

  it("leaves text without the name untouched, including words that only contain it", () => {
    expect(scrubName("Sony MDR-E9LP Headphone")).toBe("Sony MDR-E9LP Headphone");
    expect(scrubName("Amazonite Bead Bracelet")).toBe("Amazonite Bead Bracelet");
  });
});

describe("scrubProse (descriptions, features, reviews)", () => {
  it("replaces the store name with Shopeedo so sentences still read", () => {
    expect(scrubProse("I bought this on Amazon and it arrived fast.")).toBe("I bought this on Shopeedo and it arrived fast.");
    expect(scrubProse("Sold by Amazon.com Services LLC")).toBe("Sold by Shopeedo Services LLC");
    expect(scrubProse("AMAZON's return policy")).toBe("Shopeedo's return policy");
  });

  it("replaces the name inside a joined, capitalised word", () => {
    expect(scrubProse("Shop AmazonFresh today")).toBe("Shop ShopeedoFresh today");
  });

  it("catches the name glued to the word before it", () => {
    expect(scrubProse("Best Book of the YearAmazon Top 20")).toBe("Best Book of the YearShopeedo Top 20");
    expect(scrubProse("All-NewAmazon Kindle")).toBe("All-NewShopeedo Kindle");
  });

  it("leaves Amazonite and similar words alone", () => {
    expect(scrubProse("Natural amazonite stones")).toBe("Natural amazonite stones");
  });
});

describe("scrubDetails", () => {
  it("treats brand-like values as names and the rest as prose", () => {
    expect(scrubDetails({ Brand: "Amazon Basics", Manufacturer: "Amazon", Features: "Ships via Amazon logistics" })).toEqual({
      Brand: "Basics",
      Manufacturer: "Generic",
      Features: "Ships via Shopeedo logistics",
    });
  });
});
