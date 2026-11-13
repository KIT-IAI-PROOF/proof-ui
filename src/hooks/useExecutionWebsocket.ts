import {Client, IMessage} from "@stomp/stompjs";
import {useEffect} from "react";
import {AuthContextProps, useAuth} from "react-oidc-context";
import {ISettings} from "../model/ISettings.ts";
import {useBatchedCallback} from "@tanstack/react-pacer";
import {IStatusUpdate} from "../model/IStatusUpdate.ts";
import {IValueUpdate} from "../model/IValueUpdate.ts";

interface IProps {
    executionId: string;
    settings: ISettings;
    onStatusUpdate?: (updates: IStatusUpdate[]) => void;
    onValueUpdate?: (updates: IValueUpdate[]) => void;
    onReset?: () => void;
}

const useExecutionWebsocket = ({executionId, settings, onStatusUpdate, onValueUpdate, onReset}: IProps): void => {

    const {user}: AuthContextProps = useAuth();

    const batchedStatusUpdate = useBatchedCallback(
        (updates: IStatusUpdate[]): void => {
            onStatusUpdate?.(updates);
        },
        {
            maxSize: 10,
            wait: 250
        }
    );

    const batchedValueUpdate = useBatchedCallback(
        (updates: IValueUpdate[]): void => {
            onValueUpdate?.(updates);
        },
        {
            maxSize: 100,
            wait: 250
        }
    );

    useEffect(() => {
        if (
            user?.access_token &&
            settings?.websocketPath &&
            executionId &&
            (onStatusUpdate || onValueUpdate)
        ) {
            onReset?.();
            const client: Client = new Client();
            client.beforeConnect = () => {
                client.reconnectDelay = 1000;
                client.brokerURL = settings.websocketPath;
                client.connectHeaders = {
                    "X-ACCESS_TOKEN": user.access_token
                };
            };

            client.onConnect = () => {
                if (onStatusUpdate) {
                    client.subscribe(`/queue/status.execution.${executionId}`, (message: IMessage): void => {
                        message.ack();
                        try {
                            const update: IStatusUpdate = JSON.parse(message.body);
                            update.offset = message.headers["x-stream-offset"]
                                ? parseInt(message.headers["x-stream-offset"])
                                : undefined;
                            update.messageId = message.headers["message-id"];
                            batchedStatusUpdate(update);
                        } catch (error) {
                            console.warn("Error parsing status update:", error);
                        }
                    }, {
                        "ack": "client-individual",
                        "durable": "true",
                        "prefetch-count": "1000",
                        "x-queue-type": "stream",
                        "x-stream-offset": "first"
                    });
                }

                if (onValueUpdate) {
                    client.subscribe(`/queue/value.execution.${executionId}`, (message: IMessage): void => {
                        message.ack();
                        try {
                            const update: IValueUpdate = JSON.parse(message.body);
                            update.offset = message.headers["x-stream-offset"]
                                ? parseInt(message.headers["x-stream-offset"])
                                : undefined;
                            update.messageId = message.headers["message-id"];
                            batchedValueUpdate(update);
                        } catch (error) {
                            console.warn("Error parsing value update:", error);
                        }
                    }, {
                        "ack": "client-individual",
                        "durable": "true",
                        "prefetch-count": "1000",
                        "x-queue-type": "stream",
                        "x-stream-offset": "first"
                    });
                }
            };

            client.activate();

            return () => {
                client.deactivate().then(() => {
                });
            };
        }
    }, [
        user?.access_token,
        settings?.websocketPath,
        executionId,
        onStatusUpdate,
        onValueUpdate,
        onReset,
        batchedStatusUpdate,
        batchedValueUpdate
    ]);

};

export {useExecutionWebsocket};