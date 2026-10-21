import {Configuration, FileControllerApi} from "@webis/proof-config-manager-client";
import axios from "../utils/axios.ts";
import {AxiosResponse, RawAxiosRequestConfig} from "axios";
import {IFileService} from "./interfaces/IFileService.ts";

class FileService implements IFileService {

    private config: Configuration;
    private fileApi: FileControllerApi;

    constructor(basePath: string) {
        this.config = new Configuration({basePath: basePath});
        this.fileApi = new FileControllerApi(this.config, basePath, axios);
    }

    async listFiles(type: string, signal: AbortSignal | undefined): Promise<string[]> {
        const options: RawAxiosRequestConfig = {signal: signal};
        const response: AxiosResponse<string[]> = await this.fileApi.listFiles(type, options);
        return response.data;
    }

    async uploadFile(file: File, type: string, signal: AbortSignal | undefined): Promise<string> {
        const options: RawAxiosRequestConfig = {signal: signal, headers: {"Accept": "*/*", "Content-Type": "multipart/form-data"}};
        const response: AxiosResponse<string> = await this.fileApi.uploadFile(file, type, options);
        return response.data;
    }

    async downloadFile(path: string, signal: AbortSignal | undefined): Promise<File> {
        const options: RawAxiosRequestConfig = {signal: signal, responseType: "blob"};
        const response: AxiosResponse<any> = await this.fileApi.downloadFile(path, options);
        return response.data;
    }


}

export default FileService;