import {ExecutionDetail, ExecutionPagingModelListing, RequestListing as Request} from "@kit-iai-proof/proof-config-manager-client";

export interface IExecutionService {

    searchExecutions(signal: AbortSignal | undefined, request: Request): Promise<ExecutionPagingModelListing>;

    getExecutions(signal: AbortSignal | undefined): Promise<ExecutionDetail[]>;

    getExecution(executionId: string, signal: AbortSignal | undefined): Promise<ExecutionDetail>;

    saveExecution(execution: ExecutionDetail, signal: AbortSignal | undefined, sessionKey: string): Promise<ExecutionDetail>;

    updateExecution(executionId: string, execution: ExecutionDetail, signal: AbortSignal | undefined, sessionKey: string): Promise<ExecutionDetail>;

    deleteExecution(executionId: string, signal: AbortSignal | undefined, sessionKey: string): Promise<boolean>;

    exportExecution(executionId: string, signal: AbortSignal | undefined): Promise<File>;

    importExecution(file: File, signal: AbortSignal | undefined, sessionKey: string): Promise<boolean>;

}