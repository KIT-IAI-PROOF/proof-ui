import {BlockDetailStatusEnum} from "@webis/proof-config-manager-client";

export interface IStatusUpdate {
    executionId: string;
    blockId: string;
    status: BlockDetailStatusEnum;
    message: string;
    cp: number;
    offset?: number | undefined;
    messageId?: string | undefined;
}