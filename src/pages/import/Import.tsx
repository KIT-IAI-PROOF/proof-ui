import {Fragment, ReactNode} from "react";
import Grid from "@mui/material/Grid2";
import {Box, Paper, Typography} from "@mui/material";
import {useTranslation} from "react-i18next";
import {getRoutes} from "../../router/Routes.tsx";
import {IRoute} from "../../model/IRoute.ts";
import RoutePanel from "../landing/components/RoutePanel.tsx";
import {PAGE_CONTAINER_PADDING} from "../../utils/constants.ts";

const Import = () => {

    const {t} = useTranslation();

    return (
        <Fragment>
            <Box
                {...PAGE_CONTAINER_PADDING}>
                <Paper>
                    <Box padding={3}>
                        <Typography
                            variant={"h4"}
                            paddingBottom={2}>{t("page.header.import.index")}</Typography>
                        <Grid
                            container={true}
                            spacing={1}>
                            {
                                getRoutes(t)
                                    .filter((route: IRoute): boolean => route.routingPath === "/import")
                                    .flatMap((route: IRoute): IRoute[] => route.children)
                                    .filter((route: IRoute): boolean => !route.index)
                                    .filter((route: IRoute): boolean => route.menu["2"])
                                    .map((route: IRoute): ReactNode => {
                                        return (
                                            <Fragment key={route.name}>
                                                {
                                                    route && <RoutePanel route={route}/>
                                                }
                                            </Fragment>
                                        );
                                    })
                            }
                        </Grid>
                    </Box>
                </Paper>
            </Box>
        </Fragment>
    );

};

export default Import;