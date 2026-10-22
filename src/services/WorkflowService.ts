import {Configuration, ExecutionListing, RequestListing as Request, WorkflowControllerApi, WorkflowDetail, WorkflowPagingModelListing} from "@kit-iai-proof/proof-config-manager-client";
import type {AxiosResponse, RawAxiosRequestConfig} from "axios";
import axios from "../utils/axios";
import {IWorkflowService} from "./interfaces/IWorkflowService.ts";

class WorkflowService implements IWorkflowService {

    private workflowApi: WorkflowControllerApi;

    constructor(basePath: string) {
        const config: Configuration = new Configuration({basePath: basePath});
        this.workflowApi = new WorkflowControllerApi(config, basePath, axios);
    }

    async searchWorkflows(signal: AbortSignal | undefined, request: Request): Promise<WorkflowPagingModelListing> {
        const options: RawAxiosRequestConfig = {signal: signal};
        const response: AxiosResponse<WorkflowPagingModelListing> = await this.workflowApi.searchWorkflows(request, options);
        return response.data;
    }

    async getWorkflows(signal: AbortSignal | undefined): Promise<WorkflowDetail[]> {
        const options: RawAxiosRequestConfig = {signal: signal};
        const response: AxiosResponse<WorkflowDetail[]> = await this.workflowApi.getWorkflows(options);
        return response.data;
    }

    async getWorkflow(workflowId: string, signal: AbortSignal | undefined): Promise<WorkflowDetail> {
        const options: RawAxiosRequestConfig = {signal: signal};
        const response: AxiosResponse<WorkflowDetail> = await this.workflowApi.getWorkflow(workflowId, options);
        return response.data;
    }

    async saveWorkflow(workflow: WorkflowDetail, signal: AbortSignal | undefined, sessionKey: string): Promise<WorkflowDetail> {
        const options: RawAxiosRequestConfig = {signal: signal};
        const response: AxiosResponse<WorkflowDetail> = await this.workflowApi.createWorkflow(workflow, sessionKey, options);
        return response.data;
    }

    async updateWorkflow(workflowId: string, workflow: WorkflowDetail, signal: AbortSignal | undefined, sessionKey: string): Promise<WorkflowDetail> {
        const options: RawAxiosRequestConfig = {signal: signal};
        const response: AxiosResponse<WorkflowDetail> = await this.workflowApi.updateWorkflow(workflowId, workflow, sessionKey, options);
        return response.data;
    }

    async deleteWorkflow(workflowId: string, signal: AbortSignal | undefined, sessionKey: string): Promise<boolean> {
        const options: RawAxiosRequestConfig = {signal: signal};
        await this.workflowApi.deleteWorkflow(workflowId, sessionKey, options);
        return true;
    }

    async getExecutionsForWorkflow(workflowId: string, signal: AbortSignal | undefined): Promise<ExecutionListing[]> {
        const options: RawAxiosRequestConfig = {signal: signal};
        const response: AxiosResponse<ExecutionListing[]> = await this.workflowApi.getExecutionsOfWorkflow(workflowId, options);
        return response.data;
    }

    async exportWorkflow(workflowId: string, signal: AbortSignal | undefined): Promise<File> {
        const options: RawAxiosRequestConfig = {
            signal: signal,
            responseType: "blob",
            headers: {
                Accept: "application/octet-stream",
            }
        };
        const response: AxiosResponse = await this.workflowApi.exportWorkflow(workflowId, options);
        return response.data;
    }

}

export default WorkflowService;