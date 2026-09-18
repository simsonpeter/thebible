import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { parseReference } from "@/utils/referenceParser";
import { SearchBar } from "@/components/ui/SearchBar";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";

export function BibleNavigator({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [value, setValue] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const go = () => {
    const parsed = parseReference(value);
    if (!parsed) {
      setError("Could not understand that reference.");
      return;
    }
    const chapter = parsed.chapter ?? 1;
    const search = parsed.verse ? `?verse=${parsed.verse}` : "";
    navigate(`/bible/${parsed.book.id}/${chapter}${search}`);
    onClose();
  };

  return (
    <Modal open={open} title="Go to verse" onClose={onClose}>
      <p className="mb-3 text-sm text-muted">Try John 3:16, Psalm 23, Romans 8:28, or யோவான் 3:16.</p>
      <SearchBar value={value} onChange={setValue} placeholder="John 3:16" />
      {error ? <p className="mt-2 text-sm text-red-700">{error}</p> : null}
      <div className="mt-4">
        <Button className="w-full" onClick={go}>
          Go to verse
        </Button>
      </div>
    </Modal>
  );
}
