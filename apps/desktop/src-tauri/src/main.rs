#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::collections::HashMap;
use tauri::{command, Manager};

#[command]
async fn play_audio(path_or_asset_id: String) -> Result<(), String> {
  println!("TODO: play audio {}", path_or_asset_id);
  // TODO: Integrate a lightweight audio playback library (e.g., rodio).
  Ok(())
}

#[command]
async fn register_hotkeys(map: HashMap<String, String>, app: tauri::AppHandle) -> Result<(), String> {
  println!("TODO: register hotkeys: {:?}", map);
  // TODO: Hook into a global hotkey plugin and emit events when triggered.
  let _ = app.emit("native://hotkey-registered", map);
  Ok(())
}

fn main() {
  tauri::Builder::default()
    .invoke_handler(tauri::generate_handler![play_audio, register_hotkeys])
    .run(tauri::generate_context!())
    .expect("error while running CueMesh desktop");
}
