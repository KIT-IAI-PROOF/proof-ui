export interface IValueUpdate {
    blockId: string;
    valueName: string;
    valueId: string;
    value: any | undefined;
    dataType: string;
    status: string;
    communicationPoint: number,
    timestamp: number,
    simulationPhase: string
    offset?: number | undefined;
    messageId?: string | undefined;
}