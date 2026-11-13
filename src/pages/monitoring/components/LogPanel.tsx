import {ChangeEvent, Fragment, ReactNode, useEffect, useMemo, useRef, useState} from "react";
import {Box, Button, FormControlLabel, Stack, Switch, ToggleButton, ToggleButtonGroup, Typography,} from "@mui/material";
import {Client, IMessage} from "@stomp/stompjs";
import {AuthContextProps, useAuth} from "react-oidc-context";
import {useTranslation} from "react-i18next";
import {DEFAULT_SETTINGS} from "../../../utils/settings.ts";
import {IWindow} from "../../../model/IWindow.ts";

const LOG_LEVEL_PRIORITY: Record<string, number> = {
    INFO: 1,
    WARN: 2,
    ERROR: 3,
};

interface IProps {
    window: IWindow;
}

const LogPanel = ({window}: IProps): ReactNode => {

    const {t} = useTranslation();
    const [follow, setFollow] = useState<boolean>(true);
    const [level, setLevel] = useState<string>("INFO");
    const [messages, setMessages] = useState<IMessage[]>([]);
    const {user}: AuthContextProps = useAuth();
    const endRef = useRef<HTMLDivElement | null>(null);

    const filteredMessages = useMemo(() => {
        const minPriority = LOG_LEVEL_PRIORITY[level] || 1;
        return messages
            .filter((msg) => {
                const msgLevel = (msg.headers["level"] || "INFO").toUpperCase();
                const msgPriority = LOG_LEVEL_PRIORITY[msgLevel] || 1;
                return msgPriority >= minPriority;
            })
            .sort((a, b): number => {
                const aOffset = a.headers["x-stream-offset"] ? parseInt(a.headers["x-stream-offset"]) : undefined;
                const bOffset = b.headers["x-stream-offset"] ? parseInt(b.headers["x-stream-offset"]) : undefined;
                return (aOffset ?? 0) - (bOffset ?? 0);
            })
    }, [messages, level]);

    const handleDownload = () => {
        if (messages.length === 0) return;
        const text = messages.map((m) => m.body).join("\n");
        const blob = new Blob([text], {type: "text/plain;charset=utf-8"});
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `logs-${window.id}-${new Date().toISOString()}.log`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const getLogColor = (body: string, msgLevel?: string): string => {
        const lvl = msgLevel?.toUpperCase();
        if (lvl === "ERROR" || body.includes("ERROR")) return "#f44336";
        if (lvl === "WARN" || body.includes("WARN")) return "#ffa726";
        return "#e0e0e0";
    };

    useEffect((): () => void => {
        const client: Client = new Client();
        if (user?.access_token && window.queue) {
            setMessages([]);
            const headers: any = {
                "X-ACCESS_TOKEN": user.access_token
            };
            client.reconnectDelay = 1000;
            client.brokerURL = DEFAULT_SETTINGS.websocketPath;
            client.connectHeaders = headers;
            client.onConnect = (): void => {
                client.subscribe(
                    `/queue/logs.${window.queue}`,
                    (message: IMessage): void => {
                        message.ack();
                        setMessages((prevMessages: IMessage[]) => [...prevMessages, message].slice(-1000));
                    }, {
                        "ack": "client-individual",
                        "durable": "true",
                        "prefetch-count": "1000",
                        "x-queue-type": "stream",
                        "x-stream-offset": "first"
                    }
                );
            };
            client.activate();
        }
        return (): void => {
            client.deactivate().then(() => {
            });
        };
    }, [window.queue, user?.access_token]);

    useEffect(() => {
        if (endRef.current && follow) {
            endRef.current.scrollIntoView({behavior: "smooth"});
        }
    }, [messages, follow, level]);

    return (
        <Fragment>
            <Box
                sx={{
                    p: 2,
                    flexGrow: 1,
                    backgroundColor: "#121212",
                    overflowY: "auto",
                    fontFamily: 'Consolas, Monaco, "Andale Mono", "Ubuntu Mono", monospace',
                    fontSize: "0.8125rem",
                    lineHeight: 1.5,
                }}
            >
                {filteredMessages.length === 0 ? (
                    <Typography variant="body2" sx={{color: "grey.600", fontStyle: "italic"}}>
                        {messages.length === 0
                            ? t("status.waitingForLogs", "Waiting for logs...")
                            : t("status.noMatchingLogs", "No logs match the selected filter.")}
                    </Typography>
                ) : (
                    filteredMessages.map((message: IMessage, index: number): ReactNode => {
                        const color = getLogColor(message.body, message.headers["level"]);
                        return (
                            <Box
                                key={message.headers["message-id"] || index}
                                component="pre"
                                sx={{
                                    m: 0,
                                    whiteSpace: "pre-wrap",
                                    wordBreak: "break-all",
                                    color,
                                    fontFamily: "inherit",
                                }}
                            >
                                {message.headers["x-stream-offset"]} {message.body}
                            </Box>
                        );
                    })
                )}
                <div ref={endRef}/>
            </Box>
            <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                spacing={2}
                sx={{
                    px: 2,
                    py: 1,
                    backgroundColor: "background.paper",
                    borderTop: "1px solid",
                    borderColor: "divider",
                }}
            >
                <FormControlLabel
                    control={
                        <Switch
                            size="small"
                            checked={follow}
                            onChange={(e: ChangeEvent<HTMLInputElement>) => setFollow(e.target.checked)}
                        />
                    }
                    label={
                        <Typography variant="caption">
                            {follow ? t("action.follow", "Follow") : t("action.notFollow", "Paused")}
                        </Typography>
                    }
                />

                <ToggleButtonGroup
                    size="small"
                    value={level}
                    exclusive
                    onChange={(_, val: string | null) => {
                        if (val) setLevel(val);
                    }}
                >
                    <ToggleButton value="INFO" color="info" sx={{px: 1.5, py: 0.25, fontSize: "0.75rem"}}>
                        INFO
                    </ToggleButton>
                    <ToggleButton value="WARN" color="warning" sx={{px: 1.5, py: 0.25, fontSize: "0.75rem"}}>
                        WARN
                    </ToggleButton>
                    <ToggleButton value="ERROR" color="error" sx={{px: 1.5, py: 0.25, fontSize: "0.75rem"}}>
                        ERROR
                    </ToggleButton>
                </ToggleButtonGroup>
                <Stack direction="row" spacing={1}>
                    <Button size="small" variant="outlined" onClick={handleDownload} disabled={messages.length === 0}>
                        {t("action.download", "Download")}
                    </Button>
                    <Button
                        size="small"
                        variant="text"
                        color="inherit"
                        onClick={() => setMessages([])}
                        disabled={messages.length === 0}
                    >
                        {t("action.clear", "Clear")}
                    </Button>
                </Stack>
            </Stack>
        </Fragment>
    );

}

export default LogPanel;