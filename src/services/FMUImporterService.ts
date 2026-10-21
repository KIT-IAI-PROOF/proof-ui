import {Configuration} from "@webis/proof-config-manager-client";
import {IFMUImporterService} from "./interfaces/IFMUImporterService.ts";
import axios from "../utils/axios.ts";

class FMUImporterService implements IFMUImporterService {

    private config: Configuration;

    constructor(basePath: string) {
        this.config = new Configuration({basePath: basePath});
    }

    async processSelected(signal: AbortSignal | undefined, data: any): Promise<any> {
        const response = await axios.post("api/xml/block/process-selected", data, {
            baseURL: this.config.basePath,
            signal: signal,
            withCredentials: false,
            headers: {
                "Content-Type": "application/json",
            }
        });
        return response.data;
    }

    async processDefinitions(signal: AbortSignal | undefined, data: any): Promise<any> {
        const response = await axios.post("api/xml/block/process-block-io-definitions", data, {
            baseURL: this.config.basePath,
            signal: signal,
            withCredentials: false,
            headers: {
                "Content-Type": "application/json",
            }
        });
        return response.data;
    }

    async uploadXml(signal: AbortSignal | undefined, file: File): Promise<any> {
        const formData = new FormData();
        formData.append("file", file);
        const response = await axios.post("api/xml/parsing/parse", formData, {
            baseURL: this.config.basePath,
            signal: signal,
            withCredentials: false,
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        return response.data;
    }

    async download(signal: AbortSignal | undefined, baseName: string, modalBlockData: any): Promise<any> {
        const response = await axios.post(`api/program/download?baseName=${baseName}`, modalBlockData, {
            baseURL: this.config.basePath,
            signal: signal,
            withCredentials: false,
            headers: {
                "Content-Type": "application/json",
            }
        });
        return response.data;
    }


}

export default FMUImporterService;