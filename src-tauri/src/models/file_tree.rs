use serde::Serialize;

#[derive(Debug, Serialize)]
pub struct FileNode {
    pub id: String,
    pub name: String,
    pub r#type: String,
    pub content: Option<String>,
    pub children: Option<Vec<FileNode>>,
    pub folder_name: String,
}
