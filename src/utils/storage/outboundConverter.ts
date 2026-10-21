import {BlockDetail as RBlock, ConnectionDetail as REdge} from "@webis/proof-config-manager-client";
import {TBlock} from "../../model/TBlock.ts";
import {TEdge} from "../../model/TEdge.ts";

export const convertRemoteEdges: (edges: TEdge[]) => REdge[] = (edges: TEdge[]): REdge[] => {
    return edges.map((edge: TEdge): REdge => {
        return {
            ...edge.data,
            id: edge.id,
            source: edge.source,
            target: edge.target,
            animated: edge.animated,
            type: edge.type,
            output: edge.data!.output,
            input: edge.data!.input,
        };
    });
};


export const convertRemoteBlocks: (blocks: TBlock[]) => RBlock[] = (blocks: TBlock[]): RBlock[] => {
    return blocks.map((block: TBlock): RBlock => {
        return {
            ...block.data,
            id: block.id,
            type: block.type,
            position: {
                x: block.position.x,
                y: block.position.y
            }
        };

    });
};