import { useState } from "react";
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { parseGitHubUrl, fetchRepoTree, fetchFiles } from "@/lib/githubImporter";
import { useFileStore } from "@/store/useFileStore";

export default function ImportGithubModal({ open, onClose }) {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);

  const setFiles = useFileStore((s) => s.setFiles);

  const handleImport = async () => {
    const parsed = parseGitHubUrl(url);

    if (!parsed) {
      alert("Invalid GitHub URL");
      return;
    }

    const confirmOverwrite = confirm(
      "This will overwrite your current workspace. Continue?"
    );

    if (!confirmOverwrite) return;

    try {
      setLoading(true);

      const tree = await fetchRepoTree(parsed);
      const files = await fetchFiles(tree);

      const mapped = Object.fromEntries(
        files.map((f) => [f.path, f.content])
      );

      setFiles(mapped);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>Import from GitHub</DialogHeader>

        <Input
          placeholder="Paste GitHub repo URL"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />

        <Button onClick={handleImport} disabled={loading}>
          {loading ? "Importing..." : "Import"}
        </Button>
      </DialogContent>
    </Dialog>
  );
}
