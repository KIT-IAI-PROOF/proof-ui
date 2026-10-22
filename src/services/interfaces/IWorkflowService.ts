import {ExecutionListing, RequestListing as Request, WorkflowDetail, WorkflowPagingModelListing} from "@kit-iai-proof/proof-config-manager-client";

export interface IWorkflowService {

    searchWorkflows(signal: AbortSignal | undefined, request: Request): Promise<WorkflowPagingModelListing>;

    getWorkflows(signal: AbortSignal | undefined): Promise<WorkflowDetail[]>;

    getWorkflow(workflowId: string, signal: AbortSignal | undefined): Promise<WorkflowDetail>;

    saveWorkflow(workflow: WorkflowDetail, signal: AbortSignal | undefined, sessionKey: string): Promise<WorkflowDetail>;

    updateWorkflow(workflowId: string, workflow: WorkflowDetail, signal: AbortSignal | undefined, sessionKey: string): Promise<WorkflowDetail>;

    deleteWorkflow(workflowId: string, signal: AbortSignal | undefined, sessionKey: string): Promise<boolean>;

    getExecutionsForWorkflow(workflowId: string, signal: AbortSignal | undefined): Promise<ExecutionListing[]>;

    exportWorkflow(workflowId: string, signal: AbortSignal | undefined): Promise<File>;

}