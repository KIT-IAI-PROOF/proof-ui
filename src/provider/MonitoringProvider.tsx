import {ReactNode, useCallback, useEffect, useLayoutEffect, useRef, useState} from "react";
import {TBlock} from "../model/TBlock.ts";
import {
    applyEdgeChanges,
    applyNodeChanges,
    EdgeChange,
    EdgeTypes,
    NodeChange,
    NodeTypes,
    OnEdgesChange,
    OnNodesChange,
    useEdgesState,
    useNodesInitialized,
    useNodesState,
    useReactFlow
} from "@xyflow/react";
import {TWorkflow} from "../model/TWorkflow.ts";
import {convertWorkflow} from "../utils/storage/inboundConverter.ts";
import {ExecutionDetail} from "@kit-iai-proof/proof-config-manager-client";
import {TEdge} from "../model/TEdge.ts";
import {Provider} from "../types/provider.ts";
import {createBlockNode} from "../pages/monitoring/components/BlockNode.tsx";
import {MonitoringContext} from "./MonitoringContext.tsx";
import {BlockEdge} from "../pages/monitoring/components/BlockEdge.tsx";
import {DEFAULT_SETTINGS} from "../utils/settings.ts";
import {useExecutionWebsocket} from "../hooks/useExecutionWebsocket.ts";
import {IValueUpdate} from "../model/IValueUpdate.ts";
import {IStatusUpdate} from "../model/IStatusUpdate.ts";

interface IProps {
    children: ReactNode;
}

export interface IMonitoringContext {
    nodeTypes: NodeTypes;
    edgeTypes: EdgeTypes;
    nodes: TBlock[];
    edges: TEdge[];
    execParameters: { [key: string]: string; };
    execStartValues: { [key: string]: string; };
    execDefaultValues: { [key: string]: string; };
    executionLabel: string | undefined;
    executionDescription: string | undefined;
    simulationStartPoint: string | undefined;
    simulationEndPoint: string | undefined;
    simulationDuration: string | undefined;
    simulationTimeoutWorker: string | undefined;
    simulationTimeoutInput: string | undefined;
    onNodesChange: OnNodesChange<TBlock>;
    onEdgesChange: OnEdgesChange<TEdge>;
    updateExecution: (execution: ExecutionDetail) => void;
    addExecParameter: (key: string, value: string) => void;
    updateExecParameters: (execParameters: { [key: string]: string; }) => void
    removeKeyFromExecParameters: (keyToRemove: string) => void
    addExecStartValue: (key: string, value: string) => void;
    updateExecStartValues: (execStartValues: { [key: string]: string; }) => void
    removeKeyFromExecStartValues: (keyToRemove: string) => void
    addExecDefaultValue: (key: string, value: string) => void;
    updateExecDefaultValues: (execDefaultValues: { [key: string]: string; }) => void
    removeKeyFromExecDefaultValues: (keyToRemove: string) => void
    updateExecutionLabel: (label: string) => void;
    updateExecutionDescription: (description: string) => void;
    updateSimulationStartPoint: (startPoint: string) => void;
    updateSimulationEndPoint: (endPoint: string) => void;
    updateSimulationDuration: (duration: string) => void;
    updateSimulationTimeoutWorker: (timeout: string) => void;
    updateSimulationTimeoutInput: (timeout: string) => void;
    missingRequiredFields: string[];
    updateMissingRequiredFields: (value: string[]) => void;
    blockStates: IStatusUpdate[];
    connectionStates: IValueUpdate[];
    resetEditor: () => void;
    registerStatusUpdateCallback: (callback: (updates: IStatusUpdate[]) => void) => void;
    registerValueUpdateCallback: (callback: (updates: IValueUpdate[]) => void) => void;
}

const nodeTypes: NodeTypes = {block: createBlockNode(true)};
const edgeTypes: EdgeTypes = {block: BlockEdge};

const MonitoringProvider: Provider<IProps> = ({children}: IProps): ReactNode => {

    const {fitView} = useReactFlow();
    const nodesInitialized: boolean = useNodesInitialized({includeHiddenNodes: false});
    const [isConnecting] = useState<boolean>(false);
    const wasConnectingRecently = useRef(false);
    const [execution, setExecution] = useState<ExecutionDetail | undefined>(undefined);
    const [execParameters, setExecParameters] = useState<{ [key: string]: string; }>({});
    const [execStartValues, setExecStartValues] = useState<{ [key: string]: string; }>({});
    const [execDefaultValues, setExecDefaultValues] = useState<{ [key: string]: string; }>({});
    const [executionLabel, setExecutionLabel] = useState<string>();
    const [executionDescription, setExecutionDescription] = useState<string>();
    const [nodes, setNodes] = useNodesState<TBlock>([]);
    const [edges, setEdges] = useEdgesState<TEdge>([]);
    const [missingRequiredFields, setMissingRequiredFields] = useState<string[]>([]);
    const [blockStates, setBlockStates] = useState<IStatusUpdate[]>([]);
    const [connectionStates, setConnectionStates] = useState<IValueUpdate[]>([]);
    const [simulationStartPoint, setSimulationStartPoint] = useState<string>();
    const [simulationEndPoint, setSimulationEndPoint] = useState<string>();
    const [simulationDuration, setSimulationDuration] = useState<string>();
    const [simulationTimeoutWorker, setSimulationTimeoutWorker] = useState<string>();
    const [simulationTimeoutInput, setSimulationTimeoutInput] = useState<string>();

    const statusUpdateCallbackRef = useRef<((updates: IStatusUpdate[]) => void) | undefined>(undefined);
    const valueUpdateCallbackRef = useRef<((updates: IValueUpdate[]) => void) | undefined>(undefined);

    useEffect((): void => {
        Object.keys(execParameters).forEach((key: string): void => {
            if (missingRequiredFields.includes(key) && execParameters[key] !== "") {
                setMissingRequiredFields((prev: string[]): string[] =>
                    prev.filter((id: string): boolean => id !== key)
                );
            }
        });
    }, [execParameters, missingRequiredFields]);

    const updateExecution: (execution: ExecutionDetail) => void = useCallback((execution: ExecutionDetail): void => {
        setExecution(execution);
    }, []);

    const resetEditor = useCallback(() => {
        setExecution(undefined);
        setNodes([]);
        setEdges([]);
    }, [setEdges, setNodes]);

    const addExecParameter: (key: string, value: string) => void = useCallback((key: string, value: string): void => {
        setExecParameters((prevState: { [p: string]: string }): { [p: string]: string } => ({
            ...prevState,
            [key]: value
        }))
    }, []);

    const updateExecParameters: (execParameters: { [key: string]: string; }) => void = useCallback((execParameters: {
        [key: string]: string;
    }) => {
        setExecParameters(execParameters);
    }, [])

    const removeKeyFromExecParameters: (keyToRemove: string) => void = useCallback((keyToRemove: string): void => {
        setExecParameters((prev: { [p: string]: string }) => {
            const copy = {...prev};
            delete copy[keyToRemove];
            return copy;
        });
    }, []);

    const addExecStartValue: (key: string, value: string) => void = useCallback((key: string, value: string): void => {
        setExecStartValues((prevState: { [p: string]: string }): { [p: string]: string } => ({
            ...prevState,
            [key]: value
        }))
    }, []);

    const updateExecStartValues: (execStartValues: { [key: string]: string; }) => void = useCallback((execStartValues: {
        [key: string]: string;
    }) => {
        setExecStartValues(execStartValues);
    }, [])

    const removeKeyFromExecStartValues: (keyToRemove: string) => void = useCallback((keyToRemove: string): void => {
        setExecStartValues((prev: { [p: string]: string }) => {
            const copy = {...prev};
            delete copy[keyToRemove];
            return copy;
        });
    }, []);

    const addExecDefaultValue: (key: string, value: string) => void = useCallback((key: string, value: string): void => {
        setExecDefaultValues((prevState: { [p: string]: string }): { [p: string]: string } => ({
            ...prevState,
            [key]: value
        }))
    }, []);

    const updateExecDefaultValues: (execDefaultValues: { [key: string]: string; }) => void = useCallback((execDefaultValues: {
        [key: string]: string;
    }) => {
        setExecDefaultValues(execDefaultValues);
    }, [])

    const removeKeyFromExecDefaultValues: (keyToRemove: string) => void = useCallback((keyToRemove: string): void => {
        setExecDefaultValues((prev: { [p: string]: string }) => {
            const copy = {...prev};
            delete copy[keyToRemove];
            return copy;
        });
    }, []);

    const updateExecutionLabel: (executionLabel: string) => void = useCallback((label: string): void => {
        setExecutionLabel(label);
    }, [])

    const updateExecutionDescription: (executionDescription: string) => void = useCallback((description: string): void => {
        setExecutionDescription(description);
    }, []);

    const updateSimulationStartPoint: (startPoint: string) => void = useCallback((startPoint: string): void => {
        setSimulationStartPoint(startPoint);
    }, []);

    const updateSimulationEndPoint: (endPoint: string) => void = useCallback((endPoint: string): void => {
        setSimulationEndPoint(endPoint);
    }, []);

    const updateSimulationDuration: (duration: string) => void = useCallback((duration: string): void => {
        setSimulationDuration(duration);
    }, []);

    const updateSimulationTimeoutWorker: (timeout: string) => void = useCallback((timeout: string): void => {
        setSimulationTimeoutWorker(timeout);
    }, []);

    const updateSimulationTimeoutInput: (timeout: string) => void = useCallback((timeout: string): void => {
        setSimulationTimeoutInput(timeout);
    }, []);

    const updateMissingRequiredFields: (value: string[]) => void = useCallback((value: string[]): void => {
        setMissingRequiredFields(value);
    }, []);

    const registerStatusUpdateCallback: (callback: (updates: IStatusUpdate[]) => void) => void = useCallback((callback: (updates: IStatusUpdate[]) => void): void => {
        statusUpdateCallbackRef.current = callback;
    }, []);

    const registerValueUpdateCallback: (callback: (updates: IValueUpdate[]) => void) => void = useCallback((callback: (updates: IValueUpdate[]) => void): void => {
        valueUpdateCallbackRef.current = callback;
    }, []);

    const onNodesChange: OnNodesChange<TBlock> = useCallback((changes: NodeChange<TBlock>[]): void => {
        setNodes((nodes: TBlock[]): any => applyNodeChanges(changes, nodes));
    }, [setNodes]);

    const onEdgesChange: OnEdgesChange<TEdge> = useCallback((changes: EdgeChange<TEdge>[]): void => {
        setEdges((edges: TEdge[]): TEdge[] => applyEdgeChanges(changes, edges));
    }, [setEdges]);

    const handleStatusUpdate = useCallback((updates: IStatusUpdate[]): void => {
        statusUpdateCallbackRef.current?.(updates);
    }, []);

    const handleValueUpdate = useCallback((updates: IValueUpdate[]): void => {
        valueUpdateCallbackRef.current?.(updates);
    }, []);

    const handleWebsocketReset = useCallback((): void => {
        setConnectionStates([]);
        setBlockStates([]);
    }, []);

    useEffect((): void => {
        if (execution?.workflow && execution.workflow.blocks && execution.workflow.connections) {
            const {edges: convertedEdges, nodes: convertedNodes}: TWorkflow = convertWorkflow(execution.workflow);
            setNodes(convertedNodes);
            setEdges(convertedEdges);
        }
    }, [execution?.workflow, setEdges, setNodes]);

    useLayoutEffect((): void => {
        if (nodesInitialized) {
            requestAnimationFrame((): Promise<boolean> => fitView({duration: 50, includeHiddenNodes: true}));
        }
    }, [fitView, nodesInitialized]);

    useEffect(() => {
        if (!isConnecting) {
            wasConnectingRecently.current = true;
            requestAnimationFrame(() => {
                setTimeout(() => {
                    wasConnectingRecently.current = false;
                }, 100);
            });
        }
    }, [isConnecting]);

    useEffect(() => {
        registerStatusUpdateCallback((updates: IStatusUpdate[]) => {
            setBlockStates((prev: IStatusUpdate[]): IStatusUpdate[] => {
                const newUpdates: IStatusUpdate[] = updates.filter(u => u.offset !== undefined && !prev.some(e => e.offset === u.offset))
                return [...prev, ...newUpdates];
            });
        });
    }, [registerStatusUpdateCallback]);

    useEffect((): void => {
        registerValueUpdateCallback((updates: IValueUpdate[]) => {
            setConnectionStates((prev: IValueUpdate[]): IValueUpdate[] => {
                const newUpdates: IValueUpdate[] = updates.filter(u => u.offset !== undefined && !prev.some(e => e.offset === u.offset))
                return [...prev, ...newUpdates];
            });
        });
    }, [registerValueUpdateCallback]);

    useExecutionWebsocket({executionId: execution?.id ?? "", onStatusUpdate: handleStatusUpdate, onValueUpdate: handleValueUpdate, onReset: handleWebsocketReset, settings: DEFAULT_SETTINGS});

    return (
        <MonitoringContext.Provider
            value={{
                execParameters: execParameters,
                execStartValues: execStartValues,
                execDefaultValues: execDefaultValues,
                executionLabel: executionLabel,
                executionDescription: executionDescription,
                simulationStartPoint: simulationStartPoint,
                simulationEndPoint: simulationEndPoint,
                simulationDuration: simulationDuration,
                simulationTimeoutWorker: simulationTimeoutWorker,
                simulationTimeoutInput: simulationTimeoutInput,
                nodeTypes: nodeTypes,
                edgeTypes: edgeTypes,
                nodes: nodes,
                edges: edges,
                missingRequiredFields: missingRequiredFields,
                blockStates: blockStates,
                connectionStates: connectionStates,
                resetEditor: resetEditor,
                onNodesChange: onNodesChange,
                onEdgesChange: onEdgesChange,
                updateExecution: updateExecution,
                addExecParameter: addExecParameter,
                updateExecParameters: updateExecParameters,
                removeKeyFromExecParameters: removeKeyFromExecParameters,
                addExecStartValue: addExecStartValue,
                updateExecStartValues: updateExecStartValues,
                removeKeyFromExecStartValues: removeKeyFromExecStartValues,
                addExecDefaultValue: addExecDefaultValue,
                updateExecDefaultValues: updateExecDefaultValues,
                removeKeyFromExecDefaultValues: removeKeyFromExecDefaultValues,
                updateExecutionLabel: updateExecutionLabel,
                updateExecutionDescription: updateExecutionDescription,
                updateSimulationStartPoint: updateSimulationStartPoint,
                updateSimulationEndPoint: updateSimulationEndPoint,
                updateSimulationDuration: updateSimulationDuration,
                updateMissingRequiredFields: updateMissingRequiredFields,
                registerValueUpdateCallback: registerValueUpdateCallback,
                registerStatusUpdateCallback: registerStatusUpdateCallback,
                updateSimulationTimeoutWorker: updateSimulationTimeoutWorker,
                updateSimulationTimeoutInput: updateSimulationTimeoutInput,
            }}
        >
            {children}
        </MonitoringContext.Provider>
    );

};

export default MonitoringProvider;