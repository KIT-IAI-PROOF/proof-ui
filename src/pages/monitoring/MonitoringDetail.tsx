import {Fragment, ReactNode, useContext, useEffect} from "react";
import {useParams} from "react-router-dom";
import {IMonitoringContext} from "../../provider/MonitoringProvider";
import {MonitoringContext} from "../../provider/MonitoringContext.tsx";
import {ExecutionDetail} from "@kit-iai-proof/proof-config-manager-client";
import {useQuery, UseQueryResult} from "@tanstack/react-query";
import {AxiosError} from "axios";
import {executionQueryOptions} from "../../query/options/executionQueryOptions.tsx";
import WindowProvider from "../../provider/WindowProvider.tsx";
import FloatingWindows from "./components/FloatingWindows.tsx";
import MonitorPanel from "./components/MonitorPanel.tsx";

const MonitoringDetail: () => ReactNode = (): ReactNode => {

    const {executionId} = useParams();
    const {updateExecution} = useContext<IMonitoringContext>(MonitoringContext);
    const {data: execution}: UseQueryResult<ExecutionDetail, AxiosError> = useQuery(executionQueryOptions(executionId));

    useEffect((): void => {
        if (execution) updateExecution(execution);
    }, [execution, updateExecution]);

    return (
        <Fragment>
            <WindowProvider>
                <MonitorPanel/>
                <FloatingWindows/>
            </WindowProvider>
        </Fragment>
    );

};

export default MonitoringDetail;