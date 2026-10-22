import {Configuration, ExecutionControllerApi, ExecutionDetail, ExecutionPagingModelListing, RequestListing as Request} from "@kit-iai-proof/proof-config-manager-client";
import type {AxiosResponse, RawAxiosRequestConfig} from "axios";
import axios from "../utils/axios";
import {IExecutionService} from "./interfaces/IExecutionService.ts";

class ExecutionService implements IExecutionService {

    private executionApi: ExecutionControllerApi;

    constructor(basePath: string) {
        const config: Configuration = new Configuration({basePath: basePath});
        this.executionApi = new ExecutionControllerApi(config, basePath, axios);
    }

    async searchExecutions(signal: AbortSignal | undefined, request: Request): Promise<ExecutionPagingModelListing> {
        const options: RawAxiosRequestConfig = {signal: signal};
        const response: AxiosResponse<ExecutionPagingModelListing> = await this.executionApi.searchExecutions(request, options);
        return response.data;
    }

    async getExecutions(signal: AbortSignal | undefined): Promise<ExecutionDetail[]> {
        const options: RawAxiosRequestConfig = {signal: signal};
        const response: AxiosResponse<ExecutionDetail[]> = await this.executionApi.getExecutions(options);
        return response.data;
    }

    async getExecution(executionId: string, signal: AbortSignal | undefined): Promise<ExecutionDetail> {
        const options: RawAxiosRequestConfig = {signal: signal};
        const response: AxiosResponse<ExecutionDetail> = await this.executionApi.getExecution(executionId, options);
        return response.data;
    }

    async saveExecution(execution: ExecutionDetail, signal: AbortSignal | undefined, sessionKey: string): Promise<ExecutionDetail> {
        const options: RawAxiosRequestConfig = {signal: signal};
        const response: AxiosResponse<ExecutionDetail> = await this.executionApi.createExecution(execution, sessionKey, options);
        return response.data;
    }

    async updateExecution(executionId: string, execution: ExecutionDetail, signal: AbortSignal | undefined, sessionKey: string): Promise<ExecutionDetail> {
        const options: RawAxiosRequestConfig = {signal: signal};
        const response: AxiosResponse<ExecutionDetail> = await this.executionApi.updateExecution(executionId, execution, sessionKey, options);
        return response.data;
    }

    async deleteExecution(executionId: string, signal: AbortSignal | undefined, sessionKey: string): Promise<boolean> {
        const options: RawAxiosRequestConfig = {signal: signal};
        await this.executionApi.deleteExecution(executionId, sessionKey, options);
        return true;
    }

    async exportExecution(executionId: string, signal: AbortSignal | undefined): Promise<File> {
        const options: RawAxiosRequestConfig = {
            signal: signal,
            responseType: "blob",
            headers: {
                Accept: "application/octet-stream",
            }
        };
        const response: AxiosResponse = await this.executionApi.exportExecution(executionId, options);
        return response.data;
    }

    async importExecution(file: File, signal: AbortSignal | undefined, sessionKey: string): Promise<boolean> {
        const options: RawAxiosRequestConfig = {signal: signal};
        await this.executionApi.importExecution(file, sessionKey, options);
        return true;
    }

}

export default ExecutionService;