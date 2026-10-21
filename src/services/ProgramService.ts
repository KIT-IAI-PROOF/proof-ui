import {IProgramService} from "./interfaces/IProgramService.ts";
import {Configuration, ProgramControllerApi, ProgramDetail, ProgramPagingModelListing, RequestListing} from "@webis/proof-config-manager-client";
import axios from "../utils/axios.ts";
import type {AxiosResponse, RawAxiosRequestConfig} from "axios";

class ProgramService implements IProgramService {
    private programApi: ProgramControllerApi;

    constructor(basePath: string) {
        const config: Configuration = new Configuration({basePath: basePath});
        this.programApi = new ProgramControllerApi(config, basePath, axios);
    }

    async searchPrograms(signal: AbortSignal | undefined, request: RequestListing): Promise<ProgramPagingModelListing> {
        const options: RawAxiosRequestConfig = {signal: signal};
        const response: AxiosResponse<ProgramPagingModelListing> = await this.programApi.searchPrograms(request, options);
        return response.data;
    }

    async getPrograms(signal: AbortSignal | undefined): Promise<ProgramDetail[]> {
        const options: RawAxiosRequestConfig = {signal: signal};
        const response: AxiosResponse<ProgramDetail[]> = await this.programApi.getPrograms(options);
        return response.data;
    }

    async getProgram(programId: string, signal: AbortSignal | undefined): Promise<ProgramDetail> {
        const options: RawAxiosRequestConfig = {signal: signal};
        const response: AxiosResponse<ProgramDetail> = await this.programApi.getProgram(programId, options);
        return response.data;
    }

    async saveProgram(program: ProgramDetail, signal: AbortSignal | undefined, sessionKey: string): Promise<ProgramDetail> {
        const options: RawAxiosRequestConfig = {signal: signal};
        const response: AxiosResponse<ProgramDetail> = await this.programApi.createProgram(program, sessionKey, options);
        return response.data;
    }

    async updateProgram(programId: string, program: ProgramDetail, signal: AbortSignal | undefined, sessionKey: string): Promise<ProgramDetail> {
        const options: RawAxiosRequestConfig = {signal: signal};
        const response: AxiosResponse<ProgramDetail> = await this.programApi.updateProgram(programId, program, sessionKey, options);
        return response.data;
    }

    async deleteProgram(programId: string, signal: AbortSignal | undefined, sessionKey: string): Promise<boolean> {
        const options: RawAxiosRequestConfig = {signal: signal};
        await this.programApi.deleteProgram(programId, sessionKey, options);
        return true;
    }
}

export default ProgramService;