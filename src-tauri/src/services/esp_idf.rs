use std::process::Command;

pub fn build_cmd(project_path: &str) -> Command {
    let mut cmd = Command::new("idf.py");
    cmd.arg("build").current_dir(project_path);
    cmd
}
