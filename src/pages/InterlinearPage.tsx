import { Page } from "@/components/layout/Page";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { LICENSES } from "@/data/licenses";
import {
  EMUNAH_AVODAH_GNT,
  EMUNAH_AVODAH_HOME,
  EMUNAH_AVODAH_HOT,
  EMUNAH_AVODAH_PARASHAH,
  openEmunahAvodah,
} from "@/services/emunahAvodahService";

export function InterlinearPage() {
  return (
    <Page title="Interlinear Bible" subtitle="Emunah Avodah · எமுனா அவோடா" back>
      <p className="text-sm leading-relaxed text-muted">
        Hebrew Old Testament and Greek New Testament word-by-word interlinear with Tamil and English — hosted by{" "}
        <span className="font-medium text-foreground">Emunah Avodah</span> (Easter Tech). NJC does not copy or store
        this content; you open their website in your browser. A free account may be required.
      </p>

      <div className="mt-5 grid gap-3">
        <Card onClick={() => openEmunahAvodah(EMUNAH_AVODAH_HOME)}>
          <p className="font-semibold">Emunah Avodah home</p>
          <p className="mt-1 text-sm text-muted">Overview, blog, registration</p>
        </Card>
        <Card onClick={() => openEmunahAvodah(EMUNAH_AVODAH_HOT)}>
          <p className="font-semibold">Hebrew Old Testament</p>
          <p className="tamil mt-1 text-sm text-muted">எபிரேய பழிய ஏற்பாடு · HOT</p>
        </Card>
        <Card onClick={() => openEmunahAvodah(EMUNAH_AVODAH_GNT)}>
          <p className="font-semibold">Greek New Testament</p>
          <p className="tamil mt-1 text-sm text-muted">கிரேக்க புதிய ஏற்பாடு · GNT</p>
        </Card>
        <Card onClick={() => openEmunahAvodah(EMUNAH_AVODAH_PARASHAH)}>
          <p className="font-semibold">Weekly Parashah</p>
          <p className="tamil mt-1 text-sm text-muted">தோரா பராஷா</p>
        </Card>
      </div>

      <Button className="mt-6 w-full" variant="gold" onClick={() => openEmunahAvodah(EMUNAH_AVODAH_HOME)}>
        Open emunahavodah.com
      </Button>

      <article className="mt-6 rounded-3xl bg-white/80 p-4 text-sm leading-relaxed dark:bg-white/5">
        <h3 className="font-semibold">{LICENSES.emunahAvodah.name}</h3>
        <p className="mt-2 text-muted">{LICENSES.emunahAvodah.licenseDetails}</p>
      </article>
    </Page>
  );
}
