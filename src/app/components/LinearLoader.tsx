import {Fragment, ReactNode} from "react";
import {LinearProgress} from "@mui/material";
import {useIsFetching, useIsMutating} from "@tanstack/react-query";
import {useDebouncedValue} from "@tanstack/react-pacer";

const LinearLoader: () => ReactNode = (): ReactNode => {

    const isFetching: number = useIsFetching({
        predicate: (query) => {
            return !query.meta?.isBackground;
        }
    });

    const isMutating: number = useIsMutating({
        predicate: (query) => {
            return !query.meta?.isBackground;
        }
    });

    const [debouncedLoading] = useDebouncedValue((!!isFetching), {
        wait: 500
    })

    const [debouncedMutating] = useDebouncedValue((!!isMutating), {
        wait: 500
    })

    const showMutating: boolean = debouncedMutating;
    const showLoading: boolean = debouncedLoading && !showMutating;

    return (
        <Fragment>
            {showLoading && <LinearProgress color={"primary"}/>}
            {showMutating && <LinearProgress color={"secondary"}/>}
        </Fragment>
    );

};

export default LinearLoader;