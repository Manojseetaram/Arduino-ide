use std::{fs, path::Path};
use crate::models::file_tree::FileNode;

pub fn read_dir_recursive(
    path: &Path,
    folder_name: &str
) -> std::io::Result<Vec<FileNode>> {
    let mut nodes = Vec::new();

    for entry in fs::read_dir(path)? {
        let entry = entry?;
        let metadata = entry.metadata()?;
        let name = entry.file_name().into_string().unwrap_or_default();

        if metadata.is_dir() {
            let children = read_dir_recursive(&entry.path(), folder_name)?;
            nodes.push(FileNode {
                id: entry.path().to_string_lossy().to_string(),
                name,
                r#type: "folder".into(),
                content: None,
                children: Some(children),
                folder_name: folder_name.into(),
            });
        } else {
            let content = fs::read_to_string(entry.path()).ok();
            nodes.push(FileNode {
                id: entry.path().to_string_lossy().to_string(),
                name,
                r#type: "file".into(),
                content,
                children: None,
                folder_name: folder_name.into(),
            });
        }
    }

    Ok(nodes)
}
