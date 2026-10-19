import type {ISettings} from "../model/ISettings.ts";

// @ts-expect-error Use untyped env from window
const {EXECUTION_BASE_PATH, CONFIG_BASE_PATH, WEBSOCKET_BASE_PATH, FMU_IMPORT_BASE_PATH, PROOF_VERSION, SILENT_MODE}: any = window._env_;

export const DEFAULT_SETTINGS: ISettings = {
    executionBasePath: EXECUTION_BASE_PATH,
    configBasePath: CONFIG_BASE_PATH,
    websocketPath: WEBSOCKET_BASE_PATH,
    fmuImportBasePath: FMU_IMPORT_BASE_PATH,
    version: PROOF_VERSION,
    silentMode: SILENT_MODE
}