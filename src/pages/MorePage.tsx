import { useNavigate } from "react-router-dom";
import { Page } from "@/components/layout/Page";
import { Card } from "@/components/ui/Card";
import { useInstallPrompt } from "@/hooks/useInstallPrompt";
import { Button } from "@/components/ui/Button";
import { quizComingSoon } from "@/features/quiz/architecture";
import { useToast } from "@/hooks/useToast";

export function MorePage() {
  const navigate = useNavigate();
  const { canInstall, install } = useInstallPrompt();
  const { push } = useToast();
  const links = [
    { to: "/account", label: "Account sync" },
    { to: "/sermons", label: "Sunday sermons" },
    { to: "/reading-plans", label: "Reading plans" },
    { to: "/progress", label: "Bible progress" },
    { to: "/verse-image", label: "Verse image" },
    { to: "/import", label: "Import Bible data" },
    { to: "/privacy", label: "Privacy" },
    { to: "/settings", label: "Settings" },
    { to: "/about", label: "About" },
  ];

  return (
    <Page title="More">
      <div className="grid gap-3">
        {links.map((link) => (
          <Card key={link.to} onClick={() => navigate(link.to)}>
            <p className="font-semibold">{link.label}</p>
          </Card>
        ))}
        {canInstall ? (
          <Button variant="gold" onClick={() => void install()}>
            Install NJC Bible App
          </Button>
        ) : null}
        <Card
          onClick={() => push(quizComingSoon.daily, "info")}
        >
          <p className="font-semibold">Tamil Bible Quiz</p>
          <p className="text-sm text-muted">{quizComingSoon.leaderboard}</p>
        </Card>
      </div>
    </Page>
  );
}
