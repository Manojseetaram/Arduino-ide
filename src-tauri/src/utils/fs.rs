use std::path::Path;
use crate::models::artifact::Artifact;

pub fn find_bins(build_dir: &Path) -> Vec<Artifact> {
    let mut artifacts = Vec::new();

    if let Ok(entries) = std::fs::read_dir(build_dir) {
        for e in entries.flatten() {
            let path = e.path();
            if path.extension().and_then(|e| e.to_str()) == Some("bin") {
                let size = std::fs::metadata(&path).map(|m| m.len()).unwrap_or(0);
                artifacts.push(Artifact {
                    name: path.file_name().unwrap().to_string_lossy().to_string(),
                    path: path.to_string_lossy().to_string(),
                    size_bytes: size,
                });
            }
        }
    }

    artifacts
}
