// utils/config.ts
export class AppConfig {
  // Get ESP-IDF path from environment or use default
  static get ESP_IDF_PATH(): string {
    return process.env.ESP_IDF_PATH || '/Users/manojseetaramgowda/esp-idf';
  }
  
  // Get projects directory from environment or use default
  static get PROJECTS_BASE_PATH(): string {
    return process.env.ESP_PROJECTS_PATH || '/Users/manojseetaramgowda/Desktop';
  }
  
  // Get project full path
  static getProjectPath(projectName: string): string {
    return `${this.PROJECTS_BASE_PATH}/${projectName}`;
  }
  
  // Get ESP-IDF components path
  static getComponentsPath(): string {
    return `${this.ESP_IDF_PATH}/components`;
  }
  
  // Get ESP-IDF tools path
  static getToolsPath(): string {
    return `${this.ESP_IDF_PATH}/tools`;
  }
}