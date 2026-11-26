import {ExecutionDetailStatusEnum} from "@kit-iai-proof/proof-config-manager-client";

const FINAL_EXECUTION_STATES: string[] = [
    ExecutionDetailStatusEnum.Stopped,
    ExecutionDetailStatusEnum.Aborted,
    ExecutionDetailStatusEnum.ShutDown,
];

/**
 * Returns whether the execution was created from the UI (status Unknown) but not started yet.
 * Used to decide between exposing a START action (rather than RESTART) and to avoid counting
 * such executions as "running".
 */
export const isCreatedNotStarted = (status?: string): boolean => status === ExecutionDetailStatusEnum.Unknown;

/**
 * Returns whether the execution is in a terminal/final state (Stopped, Aborted or ShutDown).
 */
export const isFinalExecutionState = (status?: string): boolean =>
    status !== undefined && FINAL_EXECUTION_STATES.includes(status);
