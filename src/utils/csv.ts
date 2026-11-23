import dayjs from "dayjs";
import type {TBlock} from "../model/TBlock.ts";

export const getCsvEndpointName = (block: TBlock | undefined, executionId: string, blockId = "Block"): string => {
    const label = block?.data.label || blockId;
    const index = block?.data.index;
    const blockName = index == null ? label : `${label}(${index})`;
    return `${blockName}#${executionId}`;
};

export const getCsvFilename = (title: string, executionId?: string, stoppedAt?: string): string => {
    const stopped = stoppedAt ? dayjs(stoppedAt) : undefined;
    const timestamp = stopped?.isValid() ? stopped.format("YYYY-MM-DD_HH-mm-ss") : undefined;
    const name = title.replace(/[<>"/\\|?*]/g, "_").replace(/\s+/g, " ").trim() || "export";
    return `${name}${executionId ?? ""}${timestamp ?? ""}.csv`;
};