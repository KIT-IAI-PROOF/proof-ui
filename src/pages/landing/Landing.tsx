import {Fragment, ReactNode} from "react";
import {Box, Paper, Typography} from "@mui/material";
import {getRoutes} from "../../router/Routes.tsx";
import {IRoute} from "../../model/IRoute.ts";
import RoutePanel from "./components/RoutePanel.tsx";
import {useTranslation} from "react-i18next";
import Grid from "@mui/material/Grid2";
import {PAGE_CONTAINER_PADDING} from "../../utils/constants.ts";

const Landing: () => ReactNode = (): ReactNode => {

    const {t} = useTranslation();

    return (
        <Fragment>
            <Box
                {...PAGE_CONTAINER_PADDING}>
                <Paper>
                    <Box padding={3}>
                        <Typography
                            variant={"h4"}
                            paddingBottom={2}>{t("page.header.start")}</Typography>
                        <Grid
                            container={true}
                            spacing={1}>
                            {
                                getRoutes(t)
                                    .filter((route: IRoute): boolean => route.menu["2"])
                                    .map((route: IRoute): ReactNode => {
                                        return (
                                            <RoutePanel
                                                key={route.displayPath}
                                                route={route}
                                            />
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

export default Landing;