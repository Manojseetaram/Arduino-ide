use tauri::command;
use std::fs::{self, File};

#[derive(serde::Serialize, Clone, Debug)]
pub struct ExplorerNode {
    pub id: String,
    pub name: String,
    pub path: String,
     #[serde(rename = "type")] 
    pub node_type: String, 
    pub children: Option<Vec<ExplorerNode>>,
}
#[tauri::command]
pub fn list_project_files(project_path: String) -> Result<Vec<ExplorerNode>, String> {
    let root = std::path::Path::new(&project_path);

    let project_name = root
        .file_name()
        .ok_or("Invalid project path")?
        .to_string_lossy()
        .to_string();

    let mut entries = read_dir_recursive(root)?;

   entries = entries
        .into_iter()
        .flat_map(|node| {
            if node.node_type == "folder" && node.name == project_name {
           
                node.children.unwrap_or_default()
            } else {
                vec![node]
            }
        })
        .collect();

    Ok(vec![ExplorerNode {
        id: project_path.clone(),
        name: project_name.clone(),
        path: project_path.clone(),
        node_type: "folder".into(),
        children: Some(entries),
    }])
}


fn read_dir_recursive(path: &std::path::Path) -> Result<Vec<ExplorerNode>, String> {
    let mut nodes = Vec::new();

    for entry in std::fs::read_dir(path).map_err(|e| e.to_string())? {
        let entry = entry.map_err(|e| e.to_string())?;
        let entry_path = entry.path();
        let is_dir = entry_path.is_dir();

        nodes.push(ExplorerNode {
            id: entry_path.to_string_lossy().to_string(),
            name: entry.file_name().to_string_lossy().to_string(),
            path: entry_path.to_string_lossy().to_string(),
            node_type: if is_dir { "folder".into() } else { "file".into() },
            children: if is_dir {
                Some(read_dir_recursive(&entry_path)?)
            } else {
                None
            },
        });
    }

    Ok(nodes)
}

#[command]
pub fn read_file(path: String) -> Result<String, String> {
    let p = std::path::Path::new(&path);

    if p.is_dir() {
        return Err("Cannot open a directory".into());
    }


    if p.extension().and_then(|e| e.to_str()) == Some("bin") {
        return Err("Binary file – cannot be opened as text".into());
    }

    std::fs::read_to_string(p)
        .map_err(|e| e.to_string())
}



#[command]
pub fn create_file(full_path: String) -> Result<String, String> {
    let path = std::path::Path::new(&full_path);

    if path.exists() {
        return Err("File already exists".into());
    }

    if let Some(parent) = path.parent() {
        std::fs::create_dir_all(parent).map_err(|e| e.to_string())?;
    }

    std::fs::File::create(path).map_err(|e| e.to_string())?;

    Ok(format!("Created: {}", path.display()))
}

#[command]
pub fn create_folder(full_path: String) -> Result<String, String> {
    let path = std::path::Path::new(&full_path);

    if path.exists() {
        return Err("Folder already exists".into());
    }

    std::fs::create_dir_all(path).map_err(|e| e.to_string())?;

    Ok(format!("Folder created: {}", path.display()))
}

#[command]
pub fn rename_path(old_path: String, new_name: String) -> Result<String, String> {
    use std::fs;
    use std::path::PathBuf;
    use std::path::Path;

    let old = PathBuf::from(&old_path);
    
    // Debug logging
    println!("Renaming: {} -> {}", old_path, new_name);
    
    if !old.exists() {
        return Err(format!("Path does not exist: {}", old_path));
    }

    let parent = old.parent().ok_or("Invalid path - no parent directory")?;
    let new_path = parent.join(&new_name);

    if new_path.exists() {
        return Err(format!("Target already exists: {}", new_path.display()));
    }

    // Check if we have write permissions to both source and destination
    let metadata = fs::metadata(&old).map_err(|e| e.to_string())?;
    if metadata.permissions().readonly() {
        return Err("Source is read-only".into());
    }

    // Actually rename the file/folder
    fs::rename(&old, &new_path).map_err(|e| {
        println!("Rename error: {}", e);
        format!("Failed to rename: {}", e)
    })?;

    println!("Successfully renamed to: {}", new_path.display());
    Ok(new_path.to_string_lossy().to_string())
}

#[tauri::command]
pub fn delete_path(path: String) -> Result<(), String> {
    use std::fs;
    use std::path::Path;

    let p = Path::new(&path);
    
    // Debug logging
    println!("Deleting path: {}", path);

    if !p.exists() {
        return Err(format!("Path does not exist: {}", path));
    }

    // Check permissions first
    let metadata = fs::metadata(p).map_err(|e| e.to_string())?;
    if metadata.permissions().readonly() {
        return Err("Path is read-only".into());
    }

    // Check if it's a symbolic link
    if p.is_symlink() {
        return Err("Cannot delete symbolic links through this interface".into());
    }

    if p.is_dir() {
        // Additional check: is directory empty?
        let mut entries = fs::read_dir(p).map_err(|e| e.to_string())?;
        if entries.next().is_some() {
            // Directory is not empty - ask for confirmation on frontend
            fs::remove_dir_all(p).map_err(|e| {
                println!("Delete dir error: {}", e);
                format!("Failed to delete directory: {}", e)
            })?;
        } else {
            // Directory is empty
            fs::remove_dir(p).map_err(|e| {
                println!("Delete empty dir error: {}", e);
                format!("Failed to delete directory: {}", e)
            })?;
        }
    } else {
        // It's a file
        fs::remove_file(p).map_err(|e| {
            println!("Delete file error: {}", e);
            format!("Failed to delete file: {}", e)
        })?;
    }

    println!("Successfully deleted: {}", path);
    Ok(())
}