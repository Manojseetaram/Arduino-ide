
//termial acess
// #![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

// mod dilog; // import the dialog module
// use dilog::input_dialog;

// use std::{
//     fs,
//     path::{Path, PathBuf},
//     process::{Command, Stdio},
//     sync::{Arc, Mutex},
// };
// use serde::Serialize;
// use tauri::State;

// #[derive(Serialize)]
// struct ProjectResult {
//     success: bool,
//     path: String,
//     message: String,
// }

// // Updated to use dialog if project_name is empty
// #[tauri::command]
// fn create_esp_idf_project(project_name: Option<String>) -> tauri::Result<ProjectResult> {
//     let project_name = match project_name {
//         Some(name) => name,
//         None => input_dialog("Enter project name"),
//     };

//     let project_path = Path::new("/home/shettyanikethan/Desktop").join(&project_name);

//     if project_path.exists() {
//         eprintln!("Project already exists at {}", project_path.display());
//         return Ok(ProjectResult {
//             success: false,
//             path: project_path.display().to_string(),
//             message: "Project already exists".to_string(),
//         });
//     };

//     println!("Creating new ESP-IDF project: {}", project_name);

//     let status = Command::new("idf.py")
//         .arg("create-project")
//         .arg(&project_name)
//         .current_dir("/home/shettyanikethan/Desktop")
//         .stdout(Stdio::inherit())
//         .stderr(Stdio::inherit())
//         .status()?;

//     if status.success() {
//         println!("Project created at {}", project_path.display());
//         Ok(ProjectResult {
//             success: true,
//             path: project_path.display().to_string(),
//             message: "Project created".to_string(),
//         })
//     } else {
//         eprintln!("Failed to create project.");
//         Ok(ProjectResult {
//             success: false,
//             path: "none".to_string(),
//             message: "Failed to create project".to_string(),
//         })
//     }
// }

// #[derive(Debug, serde::Serialize)]
// pub struct FileNode {
//     pub id: String,
//     pub name: String,
//     pub r#type: String, // "file" or "folder"
//     pub content: Option<String>,
//     pub children: Option<Vec<FileNode>>,
//     pub folder_name: String,
// }

// fn read_dir_recursive(path: &Path, folder_name: &str) -> std::io::Result<Vec<FileNode>> {
//     let mut nodes = Vec::new();

//     for entry in fs::read_dir(path)? {
//         let entry = entry?;
//         let metadata = entry.metadata()?;
//         let file_name = entry.file_name().into_string().unwrap_or_default();

//         if metadata.is_dir() {
//             let children = read_dir_recursive(&entry.path(), folder_name)?;
//             nodes.push(FileNode {
//                 id: entry.path().to_string_lossy().to_string(),
//                 name: file_name,
//                 r#type: "folder".to_string(),
//                 content: None,
//                 children: Some(children),
//                 folder_name: folder_name.to_string(),
//             });
//         } else {
//             let content = fs::read_to_string(&entry.path()).unwrap_or_default();
//             nodes.push(FileNode {
//                 id: entry.path().to_string_lossy().to_string(),
//                 name: file_name,
//                 r#type: "file".to_string(),
//                 content: Some(content),
//                 children: None,
//                 folder_name: folder_name.to_string(),
//             });
//         }
//     }

//     Ok(nodes)
// }

// #[tauri::command]
// fn read_folder(path: &str) -> tauri::Result<Vec<FileNode>> {
//     let path = PathBuf::from(path);
//     if !path.exists() || !path.is_dir() {
//         return Ok(vec![]);
//     }
//     let root_name = path
//         .file_name()
//         .unwrap_or_default()
//         .to_string_lossy()
//         .to_string();

//     println!("{} root folder", root_name);
//     let files = read_dir_recursive(&path, &root_name)?;
//     Ok(files)
// }

// struct ShellState {
//     cwd: String,
// }


// #[tauri::command]
// fn run_command(
//     command: String,
//     args: Vec<String>,
//     state: State<Arc<Mutex<ShellState>>>,
// ) -> Result<String, String> {
//     let mut shell = state.lock().unwrap();

//     // Special handling for `cd`
// if command == "cd" {
//     let new_path = if args.is_empty() {
//         dirs::home_dir().unwrap().to_string_lossy().to_string()
//     } else {
//         args[0].clone()
//     };

//     // resolve relative paths against current cwd
//     let mut path = PathBuf::from(&new_path);
//     if path.is_relative() {
//         path = PathBuf::from(&shell.cwd).join(path);
//     }

//     if path.exists() && path.is_dir() {
//         shell.cwd = path.canonicalize().unwrap().to_string_lossy().to_string();
//         return Ok(format!("Changed directory to {}", shell.cwd));
//     } else {
//         return Err(format!("No such directory: {}", new_path));
//     }
// }


//     // Run command in current working dir
//     let output = Command::new(&command)
//         .args(&args)
//         .current_dir(&shell.cwd)
//         .output();

//     match output {
//         Ok(output) => {
//             if output.status.success() {
//                 Ok(String::from_utf8_lossy(&output.stdout).to_string())
//             } else {
//                 Err(String::from_utf8_lossy(&output.stderr).to_string())
//             }
//         }
//         Err(e) => Err(e.to_string()),
//     }
// }

// fn main() {
//     tauri::Builder::default()
//      
//         .manage(Arc::new(Mutex::new(ShellState {
//             cwd: std::env::current_dir()
//                 .unwrap()
//                 .to_string_lossy()
//                 .to_string(),
//         })))
//         .invoke_handler(tauri::generate_handler![
//             create_esp_idf_project,
//             read_folder,
//             run_command 
//         ])
//         .run(tauri::generate_context!())
//         .expect("error while running tauri application");
// }


// // Prevents additional console window on Windows in release, DO NOT REMOVE!!
// #![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

// use std::{fs, path::{Path, PathBuf}, process::{Command, Stdio}};

// use serde::Serialize;


// #[derive(Serialize)]
// struct ProjectResult {
//     success: bool,
//     path: String,
//     message: String,
// }


// #[tauri::command]
// fn create_esp_idf_project(project_name: &str) -> tauri::Result<(ProjectResult)> {
//   let project_path = Path::new("/home/shettyanikethan/Desktop").join(project_name);

//   if project_path.exists() {
//       eprintln!(" Project already exists at {}", project_path.display());
//       return Ok(ProjectResult {
//         success: false,
//         path: project_path.display().to_string(),
//         message: " Project already exists".to_string(),
//     });
//   };

//   println!(" Creating new ESP-IDF project: {}", project_name);


//   let status = Command::new("idf.py")
//         .arg("create-project")
//         .arg(project_name)
//         .current_dir("/home/shettyanikethan/Desktop") 
//         .stdout(Stdio::inherit())
//         .stderr(Stdio::inherit())
//         .status()?;

//   if status.success() {
//       println!(" Project created at {}", project_path.display());
//       return Ok(ProjectResult {
//         success: true,
//         path: project_path.display().to_string(),
//         message: " Project created ".to_string(),
//     })
//   } else {
//       eprintln!(" Failed to create project.");
//       Ok(ProjectResult {
//         success: false,
//         path: "none".to_string(),
//         message: " failed to create already".to_string(),
//     })
//   }

 
// }



// #[derive(Debug, serde::Serialize)]
// pub struct FileNode {
//     pub id: String,
//     pub name: String,
//     pub r#type: String, // "file" or "folder"
//     pub content: Option<String>,
//     pub children: Option<Vec<FileNode>>,
//     pub folder_name:String
// }

// fn read_dir_recursive(path: &Path,folder_name:&str) -> std::io::Result<Vec<FileNode>> {
//     let mut nodes = Vec::new();

//     for entry in fs::read_dir(path)? {
//         let entry = entry?;
//         let metadata = entry.metadata()?;
//         let file_name = entry.file_name().into_string().unwrap_or_default();

//         if metadata.is_dir() {
//             let children = read_dir_recursive(&entry.path(),folder_name)?;
//             nodes.push(FileNode {
//                 id: entry.path().to_string_lossy().to_string(),
//                 name: file_name,
//                 r#type: "folder".to_string(),
//                 content: None,
//                 children: Some(children),
//                 folder_name:folder_name.to_string()
//             });
//         } else {
//             let content = fs::read_to_string(&entry.path()).unwrap_or_default();
//             nodes.push(FileNode {
//                 id: entry.path().to_string_lossy().to_string(),
//                 name: file_name,
//                 r#type: "file".to_string(),
//                 content: Some(content),
//                 children: None,
//                 folder_name:folder_name.to_string()
//             });
//         }
//     }

//     Ok(nodes)
// }

// #[tauri::command]
//  fn read_folder(path: &str) -> tauri::Result<Vec<FileNode>> {
//      let folder_path = path;
//     let path = PathBuf::from(path);
//     if !path.exists() || !path.is_dir() {
//         return Ok(vec![]);
//     }
//     let root_name = path.file_name()
//     .unwrap_or_default()
//     .to_string_lossy()
//     .to_string();
//     println!("{} + {} root",root_name,folder_path);
//     let files = read_dir_recursive(&path,&root_name)?;
//     Ok(files)
// }



// fn main() {
//   tauri::Builder::default()
//   .invoke_handler(tauri::generate_handler![create_esp_idf_project,read_folder])
//     .run(tauri::generate_context!())
//     .expect("error while running tauri application");
// }

// // Prevents additional console window on Windows in release, DO NOT REMOVE!!
// #![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

// use std::{
//     fs,
//     path::{Path, PathBuf},
//     process::{Command, Stdio},
// };

// use serde::Serialize;

// #[derive(Serialize)]
// struct ProjectResult {
//     success: bool,
//     path: String,
//     message: String,
// }

// #[tauri::command]
// fn create_esp_idf_project(project_name: &str) -> tauri::Result<ProjectResult> {
//     let project_path = Path::new("/home/shettyanikethan/Desktop").join(project_name);

//     if project_path.exists() {
//         eprintln!(" Project already exists at {}", project_path.display());
//         return Ok(ProjectResult {
//             success: false,
//             path: project_path.display().to_string(),
//             message: " Project already exists".to_string(),
//         });
//     };

//     println!(" Creating new ESP-IDF project: {}", project_name);

//     let status = Command::new("idf.py")
//         .arg("create-project")
//         .arg(project_name)
//         .current_dir("/home/shettyanikethan/Desktop")
//         .stdout(Stdio::inherit())
//         .stderr(Stdio::inherit())
//         .status()?;

//     if status.success() {
//         println!(" Project created at {}", project_path.display());
//         Ok(ProjectResult {
//             success: true,
//             path: project_path.display().to_string(),
//             message: " Project created ".to_string(),
//         })
//     } else {
//         eprintln!(" Failed to create project.");
//         Ok(ProjectResult {
//             success: false,
//             path: "none".to_string(),
//             message: " failed to create already".to_string(),
//         })
//     }
// }

// #[derive(Debug, serde::Serialize)]
// pub struct FileNode {
//     pub id: String,
//     pub name: String,
//     pub r#type: String, // "file" or "folder"
//     pub content: Option<String>,
//     pub children: Option<Vec<FileNode>>,
//     pub folder_name: String,
// }

// fn read_dir_recursive(path: &Path, folder_name: &str) -> std::io::Result<Vec<FileNode>> {
//     let mut nodes = Vec::new();

//     for entry in fs::read_dir(path)? {
//         let entry = entry?;
//         let metadata = entry.metadata()?;
//         let file_name = entry.file_name().into_string().unwrap_or_default();

//         if metadata.is_dir() {
//             let children = read_dir_recursive(&entry.path(), folder_name)?;
//             nodes.push(FileNode {
//                 id: entry.path().to_string_lossy().to_string(),
//                 name: file_name,
//                 r#type: "folder".to_string(),
//                 content: None,
//                 children: Some(children),
//                 folder_name: folder_name.to_string(),
//             });
//         } else {
//             let content = fs::read_to_string(&entry.path()).unwrap_or_default();
//             nodes.push(FileNode {
//                 id: entry.path().to_string_lossy().to_string(),
//                 name: file_name,
//                 r#type: "file".to_string(),
//                 content: Some(content),
//                 children: None,
//                 folder_name: folder_name.to_string(),
//             });
//         }
//     }

//     Ok(nodes)
// }

// #[tauri::command]
// fn read_folder(path: &str) -> tauri::Result<Vec<FileNode>> {
//     let folder_path = path;
//     let path = PathBuf::from(path);
//     if !path.exists() || !path.is_dir() {
//         return Ok(vec![]);
//     }
//     let root_name = path
//         .file_name()
//         .unwrap_or_default()
//         .to_string_lossy()
//         .to_string();
//     println!("{} + {} root", root_name, folder_path);
//     let files = read_dir_recursive(&path, &root_name)?;
//     Ok(files)
// }
// #[derive(Serialize)]
// struct ExtensionResult {
//     success: bool,
//     message: String,
//     project_path: String,
//     package_name: String, 
// }


// #[tauri::command]
// fn install_extension(project_path: &str, package_name: &str) -> tauri::Result<ExtensionResult> {
//     let status = Command::new("npm")
//         .arg("install")
//         .arg(package_name)
//         .current_dir(project_path)
//         .stdout(Stdio::inherit())
//         .stderr(Stdio::inherit())
//         .status()?;

//     if status.success() {
//         println!("Installed {}", package_name);
//         Ok(ExtensionResult {
//             success: true,
//             message: format!("Extension '{}' installed successfully", package_name),
//             project_path: project_path.to_string(),
//             package_name: package_name.to_string(),
//         })
//     } else {
//         eprintln!(" Failed to install {}", package_name);
//         Ok(ExtensionResult {
//             success: false,
//             message: format!("Failed to install extension '{}'", package_name),
//             project_path: project_path.to_string(),
//             package_name: package_name.to_string(),
//         })
//     }
// }

// fn main() {
//     tauri::Builder::default()
//         .invoke_handler(tauri::generate_handler![
//             create_esp_idf_project,
//             read_folder,
//             install_extension
//         ])
//         .run(tauri::generate_context!())
//         .expect("error while running tauri application");
// }

#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

use std::{
    fs::{self, File},
    io::{Write, BufRead, BufReader},
    path::{Path, PathBuf},
    process::{Command, Stdio, Child},
};
use serde::Serialize;
use tauri::{command, Manager, Window, Menu, Submenu, CustomMenuItem, WindowMenuEvent};
use std::sync::{Arc, Mutex};
use once_cell::sync::Lazy;

// ----------------------------------------------------------
// GLOBAL PROCESS STORE
// ----------------------------------------------------------
static PROCESS_KILLER: Lazy<Arc<Mutex<Option<Child>>>> =
    Lazy::new(|| Arc::new(Mutex::new(None)));


// ----------------------------------------------------------
// PROJECT CREATION
// ----------------------------------------------------------

#[derive(Serialize)]
struct ProjectResult {
    success: bool,
    path: String,
    message: String,
}

#[command]
fn create_esp_idf_project(project_name: &str) -> tauri::Result<ProjectResult> {
    let project_path = Path::new("/Users/manojseetaramgowda/Desktop").join(project_name);

    if project_path.exists() {
        return Ok(ProjectResult {
            success: false,
            path: project_path.display().to_string(),
            message: "Project already exists".to_string(),
        });
    }

    let status = Command::new("idf.py")
        .arg("create-project")
        .arg(project_name)
        .current_dir("/Users/manojseetaramgowda/Desktop")
        .stdout(Stdio::inherit())
        .stderr(Stdio::inherit())
        .status()?;

    if status.success() {
        Ok(ProjectResult {
            success: true,
            path: project_path.display().to_string(),
            message: "Project created".to_string(),
        })
    } else {
        Ok(ProjectResult {
            success: false,
            path: "none".to_string(),
            message: "Failed to create project".to_string(),
        })
    }
}



// ----------------------------------------------------------
// FILE TREE FUNCTIONS
// ----------------------------------------------------------

#[derive(Debug, Serialize)]
pub struct FileNode {
    pub id: String,
    pub name: String,
    pub r#type: String,
    pub content: Option<String>,
    pub children: Option<Vec<FileNode>>,
    pub folder_name: String,
}

fn read_dir_recursive(path: &Path, folder_name: &str) -> std::io::Result<Vec<FileNode>> {
    let mut nodes = Vec::new();

    for entry in fs::read_dir(path)? {
        let entry = entry?;
        let metadata = entry.metadata()?;
        let file_name = entry.file_name().into_string().unwrap_or_default();

        if metadata.is_dir() {
            let children = read_dir_recursive(&entry.path(), folder_name)?;
            nodes.push(FileNode {
                id: entry.path().to_string_lossy().to_string(),
                name: file_name,
                r#type: "folder".to_string(),
                content: None,
                children: Some(children),
                folder_name: folder_name.to_string(),
            });
        } else {
            let content = fs::read_to_string(&entry.path()).unwrap_or_default();
            nodes.push(FileNode {
                id: entry.path().to_string_lossy().to_string(),
                name: file_name,
                r#type: "file".to_string(),
                content: Some(content),
                children: None,
                folder_name: folder_name.to_string(),
            });
        }
    }

    Ok(nodes)
}

#[command]
fn read_folder(path: &str) -> tauri::Result<Vec<FileNode>> {
    let path_buf = PathBuf::from(path);
    if !path_buf.exists() || !path_buf.is_dir() {
        return Ok(vec![]);
    }
    let root_name = path_buf
        .file_name()
        .unwrap_or_default()
        .to_string_lossy()
        .to_string();
    let files = read_dir_recursive(&path_buf, &root_name)?;
    Ok(files)
}

#[command]
fn create_folder(path: String) -> Result<String, String> {
    let folder_path = PathBuf::from(&path);

    if folder_path.exists() {
        return Err(format!("Folder already exists: {}", path));
    }

    fs::create_dir_all(&folder_path)
        .map_err(|e| format!("Failed to create folder: {}", e))?;

    Ok(format!("Folder created: {}", path))
}

#[command]
fn create_file(path: String, content: Option<String>) -> Result<String, String> {
    let file_path = PathBuf::from(&path);

    if file_path.exists() {
        return Err(format!("File already exists: {}", path));
    }

    let mut file = File::create(&file_path)
        .map_err(|e| format!("Failed to create file: {}", e))?;

    if let Some(text) = content {
        file.write_all(text.as_bytes())
            .map_err(|e| format!("Failed to write to file: {}", e))?;
    }

    Ok(format!("File created: {}", path))
}



// ----------------------------------------------------------
// RUN ANY LIVE COMMAND
// ----------------------------------------------------------

#[command]
async fn run_live_command(window: Window, command: String, args: Vec<String>) -> Result<(), String> {
    {
        let mut lock = PROCESS_KILLER.lock().unwrap();
        if let Some(mut running_proc) = lock.take() {
            let _ = running_proc.kill();
        }
    }

    let child = Command::new(&command)
        .args(args)
        .stdout(Stdio::piped())
        .stderr(Stdio::piped())
        .spawn()
        .map_err(|e| format!("Failed to spawn command: {}", e))?;

    {
        let mut lock = PROCESS_KILLER.lock().unwrap();
        *lock = Some(child);
    }

    let mut lock = PROCESS_KILLER.lock().unwrap();
    let stored_child = lock.as_mut().unwrap();

    let stdout = stored_child.stdout.take().unwrap();
    let stderr = stored_child.stderr.take().unwrap();

    let win1 = window.clone();
    tauri::async_runtime::spawn(async move {
        let reader = BufReader::new(stdout);
        for line in reader.lines() {
            if let Ok(text) = line {
                let _ = win1.emit("terminal-output", text);
            }
        }
    });

    let win2 = window.clone();
    tauri::async_runtime::spawn(async move {
        let reader = BufReader::new(stderr);
        for line in reader.lines() {
            if let Ok(text) = line {
                let _ = win2.emit("terminal-output", format!("[ERR] {}", text));
            }
        }
    });

    Ok(())
}



// ----------------------------------------------------------
// COMPILE + FLASH ESP32
// ----------------------------------------------------------

#[command]
fn compile_and_flash(app: tauri::AppHandle) {
    {
        let mut lock = PROCESS_KILLER.lock().unwrap();
        if let Some(mut running_proc) = lock.take() {
            let _ = running_proc.kill();
        }
    }

    std::thread::spawn(move || {
        let child = Command::new("idf.py")
            .arg("build")
            .arg("flash")
            .stdout(Stdio::piped())
            .stderr(Stdio::piped())
            .spawn()
            .expect("Failed to run idf.py build flash");

        {
            let mut lock = PROCESS_KILLER.lock().unwrap();
            *lock = Some(child);
        }

        let mut lock = PROCESS_KILLER.lock().unwrap();
        let stored_child = lock.as_mut().unwrap();

        let stdout = stored_child.stdout.take().unwrap();
        let stderr = stored_child.stderr.take().unwrap();

        let app2 = app.clone();
        std::thread::spawn(move || {
            let reader = BufReader::new(stdout);
            for line in reader.lines() {
                let _ = app2.emit_all("terminal-output", line.unwrap());
            }
        });

        let app3 = app.clone();
        std::thread::spawn(move || {
            let reader = BufReader::new(stderr);
            for line in reader.lines() {
                let _ = app3.emit_all("terminal-output", format!("[ERR] {}", line.unwrap()));
            }
        });
    });
}



// ----------------------------------------------------------
// MENU BUILDER — (CORRECT for TAURI v1.8.1)
// ----------------------------------------------------------

fn build_menu() -> Menu {
    let new_file = CustomMenuItem::new("new_file", "New File");
    let open_file = CustomMenuItem::new("open_file", "Open...");
    let save_file = CustomMenuItem::new("save_file", "Save");
    let quit = CustomMenuItem::new("quit", "Quit");

    let file_menu = Submenu::new(
        "File",
        Menu::new()
            .add_item(new_file)
            .add_item(open_file)
            .add_item(save_file)
            .add_item(quit),
    );

    let undo = CustomMenuItem::new("undo", "Undo");
    let redo = CustomMenuItem::new("redo", "Redo");
    let cut = CustomMenuItem::new("cut", "Cut");
    let copy = CustomMenuItem::new("copy", "Copy");
    let paste = CustomMenuItem::new("paste", "Paste");

    let edit_menu = Submenu::new(
        "Edit",
        Menu::new()
            .add_item(undo)
            .add_item(redo)
            .add_item(cut)
            .add_item(copy)
            .add_item(paste),
    );

    let fullscreen = CustomMenuItem::new("fullscreen", "Toggle Full Screen");
    let view_menu = Submenu::new("View", Menu::new().add_item(fullscreen));

    Menu::new()
        .add_submenu(file_menu)
        .add_submenu(edit_menu)
        .add_submenu(view_menu)
}



// ----------------------------------------------------------
// MAIN — (Correct event handler for TAURI v1.8.1)
// ----------------------------------------------------------

fn main() {
    tauri::Builder::default()
        .menu(build_menu())
        .on_menu_event(|event: WindowMenuEvent| {
            let id = event.menu_item_id();

            match id {
                "quit" => {
                    event.window().app_handle().exit(0);
                }
                "new_file" => println!("New File clicked"),
                "open_file" => println!("Open clicked"),
                "save_file" => println!("Save clicked"),
                "undo" => println!("Undo"),
                "redo" => println!("Redo"),
                "cut" => println!("Cut"),
                "copy" => println!("Copy"),
                "paste" => println!("Paste"),

                "fullscreen" => {
                    let win = event.window();
                    let is_full: bool = win.is_fullscreen().unwrap_or(false);
                    let _ = win.set_fullscreen(!is_full);
                }

                _ => {}
            }
        })
        .invoke_handler(tauri::generate_handler![
            create_esp_idf_project,
            read_folder,
            create_folder,
            create_file,
            run_live_command,
            compile_and_flash
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
