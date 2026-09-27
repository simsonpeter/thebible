import { useNavigate, useParams } from "react-router-dom";
import { Page } from "@/components/layout/Page";
import { Card } from "@/components/ui/Card";
import { getTopic } from "@/services/topicService";
import { formatReference } from "@/utils/reference";
import { useSettings } from "@/hooks/useSettings";
import { Navigate } from "react-router-dom";

export function TopicDetailPage() {
  const { topicId } = useParams();
  const topic = topicId ? getTopic(topicId) : undefined;
  const navigate = useNavigate();
  const { settings } = useSettings();

  if (!topic) return <Navigate to="/topics" replace />;

  return (
    <Page title={topic.title} subtitle={topic.titleTamil} back>
      <div className="grid gap-2">
        {topic.verses.map((verse) => (
          <Card
            key={`${verse.bookId}-${verse.chapter}-${verse.verse}`}
            onClick={() =>
              navigate(
                `/bible/${verse.bookId}/${verse.chapter}?verse=${verse.verse}&translation=${settings.defaultTranslation}`,
              )
            }
          >
            {formatReference(verse.bookId, verse.chapter, verse.verse, settings.uiLanguage)}
          </Card>
        ))}
      </div>
    </Page>
  );
}
