import { describe, expect, it } from "vitest";
import { emunahBookSlug, emunahInterlinearUrl } from "@/services/emunahAvodahService";

describe("Emunah Avodah links", () => {
  it("maps Psalms to the EA psalm slug", () => {
    expect(emunahBookSlug("psalms")).toBe("psalm");
    expect(emunahInterlinearUrl("psalms", 23)).toBe("https://www.emunahavodah.com/hot/psalm-23/");
  });

  it("builds HOT and GNT chapter URLs", () => {
    expect(emunahInterlinearUrl("genesis", 1)).toBe("https://www.emunahavodah.com/hot/genesis-1/");
    expect(emunahInterlinearUrl("john", 3)).toBe("https://www.emunahavodah.com/gnt/john-3/");
    expect(emunahInterlinearUrl("romans", 8)).toBe("https://www.emunahavodah.com/gnt/romans-8/");
  });

  it("uses book-only paths for short epistles", () => {
    expect(emunahInterlinearUrl("philemon", 1)).toBe("https://www.emunahavodah.com/gnt/philemon/");
    expect(emunahInterlinearUrl("2-john", 1)).toBe("https://www.emunahavodah.com/gnt/2-john/");
  });
});
