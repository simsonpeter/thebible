import { Button } from "@/components/ui/Button";
import { useSettings } from "@/hooks/useSettings";

export function OnboardingOverlay() {
  const { settings, update, ready } = useSettings();
  if (!ready || settings.onboardingDone) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center bg-navy/70 p-4 backdrop-blur-sm sm:items-center">
      <div className="w-full max-w-md rounded-3xl bg-paper p-5 text-ink shadow-xl dark:bg-[#12263a] dark:text-paper">
        <p className="text-xs tracking-[0.25em] text-gold uppercase">Welcome</p>
        <h2 className="tamil mt-2 text-2xl font-semibold">NJC Bible App</h2>
        <ol className="mt-4 grid gap-3 text-sm leading-relaxed">
          <li>
            <strong>1.</strong> Tamil O.V. loads offline on first open — reading works without an account.
          </li>
          <li>
            <strong>2.</strong> Open a chapter and tap <strong>Listen</strong> for Tamil or English speech.
          </li>
          <li>
            <strong>3.</strong> Use Home for Promise of the day, Sunday passage, and your reading plan.
          </li>
        </ol>
        <Button className="mt-5 w-full" onClick={() => void update({ onboardingDone: true, uiLanguage: "ta" })}>
          தொடங்கு · Start
        </Button>
        <Button variant="ghost" className="mt-2 w-full" onClick={() => void update({ onboardingDone: true })}>
          Continue in English
        </Button>
      </div>
    </div>
  );
}
