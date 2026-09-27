import { useNavigate } from "react-router-dom";
import { Page } from "@/components/layout/Page";
import { Card } from "@/components/ui/Card";
import { listTopics } from "@/services/topicService";

export function TopicsPage() {
  const navigate = useNavigate();
  const topics = listTopics();

  return (
    <Page title="Topics" subtitle="Offline verse lists" back>
      <div className="grid gap-3">
        {topics.map((topic) => (
          <Card key={topic.id} onClick={() => navigate(`/topics/${topic.id}`)}>
            <p className="font-semibold">{topic.title}</p>
            <p className="tamil mt-1 text-sm text-muted">{topic.titleTamil}</p>
            <p className="mt-1 text-xs text-muted">{topic.verses.length} verses</p>
          </Card>
        ))}
      </div>
    </Page>
  );
}
