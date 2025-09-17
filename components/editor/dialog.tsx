import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { invoke } from "@tauri-apps/api/tauri";
import { on } from "events";
import { useState } from "react";

interface Response {
  success: boolean;
  path: string;
  message: string;
}

export function ProjectNameDialog({
  onSucess,
}: {
  onSucess: (path: string) => void;
}) {
  const [disabled, setDisabled] = useState(false);
  const [error, setError] = useState("");
  const [name, setName] = useState("");
  const [open, setOpen] = useState(false);

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    setDisabled(true);

    if (!name.trim()) {
      setError("Please enter a name for your project");
      setDisabled(false);
      return;
    }

    try {
      const res: Response = await invoke("create_esp_idf_project", {
        projectName: name,
      });
      console.log("Project created:", res);
      if (res.success) {
        setOpen(false);

        onSucess(res.path);
        setError("");
      } else {
        setError(res.message);
      }
      setError("");
    } catch (err) {
      console.error("Error creating project:", err);
      setError("Failed to create project");
    } finally {
      setDisabled(false);
    }
  };
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <form>
        <DialogTrigger asChild>
          <p>Create Project</p>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Name of your project</DialogTitle>
            <DialogDescription>
              This will be displayed as the folder name of your project.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="grid gap-3">
              <Label htmlFor="name">Name</Label>
              <input
                id="name"
                name="name"
                placeholder="test"
                className="w-full rounded-md border-2 border-gray-300 p-2 text-sm "
                onChange={(e) => setName(e.target.value)}
                autoFocus={false}
              />
            </div>
          </div>
          {error && <p className="text-red-500">{error}</p>}
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button
              type="submit"
              disabled={disabled}
              onClick={handleCreateProject}
            >
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </form>
    </Dialog>
  );
}
