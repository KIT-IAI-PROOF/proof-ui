import {
    BlockDetail as RBlock,
    ConnectionDetail as REdge,
    InputDetail as TargetHandle,
    OutputDetail as SourceHandle,
    PointDetail as Point,
    TemplateDetail as Template,
    WorkflowDetail as Workflow
} from "@kit-iai-proof/proof-config-manager-client";
import {TBlock} from "../../model/TBlock.ts";
import {TWorkflow} from "../../model/TWorkflow.ts";
import {Connection, MarkerType, XYPosition} from "@xyflow/react";
import {TEdge} from "../../model/TEdge.ts";
import {ControlPointData} from "../../pages/editor/components/ControlPoint.tsx";
import {v4 as uuidv4} from "uuid";
import {EAlgorithm} from "../../model/EAlgorithm.ts";
import {InputCommunicationTypeEnum, OutputCommunicationTypeEnum} from "@kit-iai-proof/proof-orchestrator-client";

export const convertBlocks: (blocks: RBlock[], workflowId: string) => TBlock[] = (blocks: RBlock[], workflowId: string): TBlock[] => {
    return blocks.map((block: RBlock): TBlock => {
        const [width, height]: [number, number] = getDimensions(block);
        return {
            id: block.id!,
            initialHeight: height,
            initialWidth: width,
            type: block.type!,
            position: {
                x: block?.position?.x ?? 0,
                y: block?.position?.y ?? 0
            },
            data: {
                ...block,
                minHeight: height,
                minWidth: width,
                templateName: block.templateName,
                workflowId: workflowId,
                temporary: false
            }
        };
    });
};

export const convertEdges: (edges: REdge[]) => TEdge[] = (edges: REdge[]): TEdge[] => {
    return edges.map((edge: REdge): TEdge => {
        const points: ControlPointData[] = convertPoints(edge.points!);
        return {
            id: edge.id!,
            source: edge.source!,
            target: edge.target!,
            animated: edge.animated!,
            type: edge.type!,
            markerEnd: {
                type: MarkerType.ArrowClosed
            },
            targetHandle: edge.input!,
            sourceHandle: edge.output!,
            data: {
                ...edge,
                connectionType: edge.connectionType!,
                points: points,
                algorithm: EAlgorithm.BezierCatmullRom
            }
        };
    });
};

export const convertWorkflow: (workflow: Workflow) => TWorkflow = (workflow: Workflow): TWorkflow => {
    const nodes: TBlock[] = convertBlocks(workflow.blocks!, workflow.id!);
    const edges: TEdge[] = convertEdges(workflow.connections!);
    return {
        nodes: nodes,
        edges: edges
    };
};

export const makeEdge: (connection: Connection, connectionLinePath: XYPosition[], type: string | undefined) => TEdge = (connection: Connection, connectionLinePath: XYPosition[], type: string | undefined): TEdge => {
    const uuid: string = uuidv4();
    return {
        ...connection,
        id: uuid,
        type: "block",
        selected: true,
        markerEnd: {
            type: MarkerType.ArrowClosed
        },
        data: {
            connectionType: type,
            algorithm: EAlgorithm.BezierCatmullRom,
            input: connection.targetHandle!,
            output: connection.sourceHandle!,
            points: connectionLinePath.map((point: XYPosition, i: number): XYPosition & {
                    id: string;
                    active?: boolean;
                    prev?: string
                } =>
                    ({
                        ...point,
                        id: window.crypto.randomUUID(),
                        prev: i === 0 ? undefined : connectionLinePath[i - 1],
                        active: true
                    } as ControlPointData)
            )
        }
    };
};

export const makeNode: (template: Template, position: XYPosition, index: number) => TBlock = (template: Template, position: XYPosition, index: number): TBlock => {
    const [width, height]: [number, number] = getDimensions(template);
    const outputs: SourceHandle[] = template.outputs!.map((handle: SourceHandle): SourceHandle => {
        return ({
            ...handle,
            id: uuidv4()
        });
    });
    const inputs: TargetHandle[] = template.inputs!.map((handle: TargetHandle): TargetHandle => {
        return ({
            ...handle,
            id: uuidv4()
        });
    });
    return {
        ...template,
        id: uuidv4(),
        position: position,
        height: height,
        width: width,
        data: {
            ...template,
            index: index,
            minWidth: width,
            minHeight: height,
            temporary: true,
            templateId: template.id,
            templateName: template.name,
            label: template.name,
            outputs: outputs.map(output => {
                return {
                    ...output,
                    id: uuidv4()
                };
            }),
            inputs: inputs.map(output => {
                return {
                    ...output,
                    id: uuidv4()
                };
            }),
        }
    };
};


const getDimensions: (entity: any) => [number, number] = (entity: RBlock): [number, number] => {
    const width: number = 150;
    const visibleOutputsCount: number = entity.outputs!.filter(o => o.communicationType !== OutputCommunicationTypeEnum.EventStatic && o.communicationType !== OutputCommunicationTypeEnum.StepbasedStatic).length;
    const visibleInputsCount: number = entity.inputs!.filter(o => o.communicationType !== InputCommunicationTypeEnum.EventStatic && o.communicationType !== InputCommunicationTypeEnum.StepbasedStatic).length;
    const height: number = Math.max(visibleInputsCount, visibleOutputsCount) * 20 + 50;
    return [width, height];
};

const convertPoints: (points: Point[]) => ControlPointData[] = (points: Point[]): ControlPointData[] => {
    return points.map((point: Point): ControlPointData => {
        return {
            id: point.id!,
            active: point.active!,
            prev: point.prev!,
            x: point.x!,
            y: point.y!
        };
    });
};

export const getNextAvailableIndex = (currentNodes: TBlock[]): number => {
    const usedIndices = new Set(currentNodes.map(node => node.data.index).filter((index): index is number => index !== undefined));
    let nextIndex = 1;
    while (usedIndices.has(nextIndex)) {
        nextIndex++;
    }
    return nextIndex;
};