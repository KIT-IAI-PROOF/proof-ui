import {IOrchestrationService} from "./interfaces/IOrchestrationService.ts";
import axios from "../utils/axios";
import type {AxiosResponse, RawAxiosRequestConfig} from "axios";
import {Configuration, Execution, OrchestrationControllerApi} from "@webis/proof-orchestrator-client";

class OrchestrationService implements IOrchestrationService {

    private config: Configuration;
    private orchestrationApi: OrchestrationControllerApi;

    constructor(basePath: string) {
        this.config = new Configuration({basePath: basePath});
        this.orchestrationApi = new OrchestrationControllerApi(this.config, basePath, axios);
    }

    async startExecution(signal: AbortSignal | undefined, executionId: string): Promise<string> {
        const options: RawAxiosRequestConfig = {
            signal: signal,
            headers: {
                "Accept": "*/*"
            }
        };
        const response: AxiosResponse<Execution> = await this.orchestrationApi.runWorkflow(executionId, options)
        return response.data.id ?? "";
    }

    async abortExecution(signal: AbortSignal | undefined, executionId: string): Promise<void> {
        const options: RawAxiosRequestConfig = {
            signal: signal,
            headers: {
                "Accept": "*/*"
            }
        };
        await this.orchestrationApi.abortWorkflow(executionId, options)
    }

}

export default OrchestrationService;