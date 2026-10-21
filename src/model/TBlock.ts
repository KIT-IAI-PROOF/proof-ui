import type {Node} from "@xyflow/react";
import type {BlockDetail as RBlock} from "@webis/proof-config-manager-client";

type Without<T, K> = Pick<T, Exclude<keyof T, K>>;

export type TBlock = Node<Without<RBlock, "position"> & { temporary: boolean, workflowId?: string, minHeight: number, minWidth: number }>;
