import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DotSquareIcon, MenuIcon } from "lucide-react";
import { ProjectNameDialog } from "./dialog";

export function ProjectDropdown({onProjectOpen}: {onProjectOpen: (path: string) => void}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">
          <MenuIcon className="w-5 h-5 text-primary" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-52 mr-8 mt-2" align="start">
        <DropdownMenuGroup>
          <DropdownMenuItem>Open Project</DropdownMenuItem>
          <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
            <ProjectNameDialog onSucess={onProjectOpen}/>
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
