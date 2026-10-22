import {Box, LinearProgress, Stack, Typography} from "@mui/material";
import {ExecutionDetail} from "@kit-iai-proof/proof-config-manager-client";
import {ReactNode, useCallback, useMemo} from "react";

interface IProps {
    execution: ExecutionDetail
}

const Progress: ({execution}: IProps) => ReactNode = ({execution}: IProps): ReactNode => {

    const current: number = useMemo(() => {
        return execution?.currentCP ?? (execution?.workflow?.stepBasedConfig?.startPoint ?? 0);
    }, [execution?.currentCP, execution?.workflow?.stepBasedConfig?.startPoint])

    const getPosition: () => number = useCallback((): number => {
        const start = execution?.workflow?.stepBasedConfig?.startPoint ?? 0;
        const end = execution?.workflow?.stepBasedConfig?.endPoint ?? 1;
        const totalLength = end - start;
        const progressSoFar = current - start;
        if (totalLength <= 0) return 0;
        const percentage = (progressSoFar / totalLength) * 100;
        return Math.min(Math.max(percentage, 0), 100);
    }, [current, execution?.workflow?.stepBasedConfig?.endPoint, execution?.workflow?.stepBasedConfig?.startPoint]);

    return (
        <Stack paddingX={3} paddingY={1}>
            <Box sx={{display: 'flex', alignItems: 'center'}}>
                <Box sx={{width: '100%', mr: 2}}>
                    <LinearProgress variant={"determinate"} value={getPosition()}/>
                </Box>
            </Box>
            <Stack direction={"row"} flex={1} alignItems={"center"}>
                <Typography color={"primary"} flexGrow={1} paddingTop={1} variant={"body2"}>Start Point: {execution.workflow?.stepBasedConfig?.startPoint}</Typography>
                <Typography color={"textPrimary"} flexGrow={1} paddingTop={1} textAlign={"center"} variant={"body1"}>Current Point: {execution?.currentCP}</Typography>
                <Typography color={"primary"} flexGrow={1} paddingTop={1} textAlign={"right"} variant={"body2"}>End Point: {execution.workflow?.stepBasedConfig?.endPoint}</Typography>
            </Stack>
        </Stack>
    );

};

export default Progress;