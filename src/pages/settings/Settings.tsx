import {Fragment, ReactNode, useContext} from "react";
import {Box, Button, ButtonGroup, Checkbox, FormControl, FormControlLabel, FormGroup, FormHelperText, FormLabel, Paper, Stack, TextField, Theme, Tooltip, Typography, useTheme} from "@mui/material";
import SettingsIcon from "@mui/icons-material/Settings";
import {IAppContext} from "../../provider/AppProvider";
import {useTranslation} from "react-i18next";
import {ColorField} from "./components/ColorField.tsx";
import Grid from "@mui/material/Grid2";
import {IPalette} from "../../model/IPalette.ts";
import isURL from "validator/lib/isURL";
import {DEFAULT_PALETTE} from "../../utils/palette.ts";
import {Info} from "@mui/icons-material";
import {AppContext} from "../../provider/AppContext.tsx";
import {DEFAULT_SETTINGS} from "../../utils/settings.ts";
import {PAGE_CONTAINER_PADDING} from "../../utils/constants.ts";

const Settings: () => ReactNode = (): ReactNode => {

    const theme: Theme = useTheme();
    const {t} = useTranslation();
    const {
        palette,
        updatePalette,
        updatePrimaryPalette,
        updateSecondaryPalette,
    } = useContext<IAppContext>(AppContext);

    const handlePaletteChange = (color: string, index: number) => {
        const newPalette: IPalette[] = [...palette];
        newPalette[index] = {hex: color};
        updatePalette(newPalette);
    };

    return (
        <Fragment>
            <Box
                {...PAGE_CONTAINER_PADDING}>
                <Paper>
                    <Box padding={3}>
                        <Stack
                            direction={"row"}
                            spacing={1}
                            paddingBottom={2}>
                            <SettingsIcon
                                color={"primary"}
                                fontSize={"large"}/>
                            <Typography variant={"h4"}>{t("page.header.settings")}</Typography>
                        </Stack>
                        <Grid
                            container={true}
                            spacing={1}>
                            <Grid size={{xs: 12, sm: 12, lg: 7, xl: 8}}>
                                <Paper
                                    variant={"outlined"}
                                    style={{background: theme.palette.background.default}}>
                                    <Box padding={3}>
                                        <Typography
                                            variant={"h5"}
                                            color={"primary"}>{t("page.subheader.setting.general")}</Typography>
                                        <FormControl
                                            fullWidth={true}
                                            variant="standard"
                                        >
                                            <FormLabel sx={{paddingBottom: 2}}>{t("page.subheader.setting.description.general")}</FormLabel>
                                            <FormGroup
                                                row={false}
                                                sx={{paddingBottom: 1}}
                                            >
                                                <Stack
                                                    direction={"column"}
                                                    spacing={1}
                                                >
                                                    <TextField
                                                        error={!isURL(DEFAULT_SETTINGS.configBasePath, {
                                                            protocols: ["http", "https"],
                                                            require_tld: false
                                                        })}
                                                        disabled={true}
                                                        sx={{paddingTop: 1, paddingBottom: 1}}
                                                        value={DEFAULT_SETTINGS.configBasePath}
                                                        size={"small"}
                                                        label={
                                                            <Typography>
                                                                {t("word.configBaseUrl")}
                                                                <Tooltip
                                                                    title={t("tooltip.configBaseUrl")}
                                                                    placement="top"
                                                                >
                                                                    <Info color={"primary"} sx={{ml: 2, cursor: "pointer"}}/>
                                                                </Tooltip>
                                                            </Typography>
                                                        }
                                                        variant="outlined"
                                                    />
                                                    <TextField
                                                        error={!isURL(DEFAULT_SETTINGS.configBasePath, {
                                                            protocols: ["http", "https"],
                                                            require_tld: false
                                                        })}
                                                        disabled={true}
                                                        sx={{paddingTop: 1, paddingBottom: 1}}
                                                        value={DEFAULT_SETTINGS.executionBasePath}
                                                        size={"small"}
                                                        label={
                                                            <Typography>
                                                                {t("word.orchestratorBaseUrl")}
                                                                <Tooltip
                                                                    title={t("tooltip.orchestratorBaseUrl")}
                                                                    placement="top"
                                                                >
                                                                    <Info color={"primary"} sx={{ml: 2, cursor: "pointer"}}/>
                                                                </Tooltip>
                                                            </Typography>
                                                        }
                                                        variant={"outlined"}
                                                    />
                                                    <TextField
                                                        error={!isURL(DEFAULT_SETTINGS.websocketPath, {
                                                            protocols: ["ws"],
                                                            require_tld: false
                                                        })}
                                                        disabled={true}
                                                        sx={{paddingTop: 1, paddingBottom: 1}}
                                                        value={DEFAULT_SETTINGS.websocketPath}
                                                        size={"small"}
                                                        label={
                                                            <Typography>
                                                                {t("word.websocket")}
                                                                <Tooltip
                                                                    title={t("tooltip.websocket")}
                                                                    placement="top"
                                                                >
                                                                    <Info color={"primary"} sx={{ml: 2, cursor: "pointer"}}/>
                                                                </Tooltip>
                                                            </Typography>
                                                        }
                                                        variant={"outlined"}
                                                    />
                                                    <TextField
                                                        sx={{paddingTop: 1, paddingBottom: 1}}
                                                        value={DEFAULT_SETTINGS.version}
                                                        size={"small"}
                                                        label={
                                                            <Typography>
                                                                {t("word.proofVersion")}
                                                                <Tooltip
                                                                    title={t("tooltip.proofVersion")}
                                                                    placement="top"
                                                                >
                                                                    <Info color={"primary"} sx={{ml: 2, cursor: "pointer"}}/>
                                                                </Tooltip>
                                                            </Typography>
                                                        }
                                                        variant={"outlined"}
                                                        disabled={true}
                                                    />
                                                    <FormControlLabel
                                                        disabled={true}
                                                        control={
                                                            <Checkbox
                                                                disabled={true}
                                                                checked={DEFAULT_SETTINGS.silentMode}
                                                            />
                                                        }
                                                        label={
                                                            <Stack direction={"row"} spacing={1} alignItems={"center"}>
                                                                <Typography color={"inherit"}>
                                                                    {t("word.silent")}
                                                                </Typography>
                                                                <Tooltip title={t("tooltip.silent")}>
                                                                    <Info color={"primary"} sx={{ml: 2, cursor: "pointer"}}/>
                                                                </Tooltip>
                                                            </Stack>
                                                        }
                                                    />
                                                </Stack>
                                            </FormGroup>
                                            <FormHelperText>{t("word.automaticChanges")}</FormHelperText>
                                        </FormControl>
                                    </Box>
                                </Paper>
                            </Grid>
                            <Grid size={{xs: 12, sm: 12, lg: 5, xl: 4}}>
                                <Paper
                                    variant={"outlined"}
                                    style={{background: theme.palette.background.default}}>
                                    <Box padding={3}>
                                        <Typography
                                            variant={"h5"}
                                            color={"primary"}
                                        >
                                            {t("page.subheader.setting.theming")}
                                            <Tooltip
                                                title={t("tooltip.theming")}
                                                placement="top"
                                            >
                                                <Info sx={{ml: 2, cursor: "pointer"}}/>
                                            </Tooltip>
                                        </Typography>
                                        <Typography
                                            variant={"body1"}
                                            paddingBottom={2}>{t("page.subheader.setting.description.theming")}</Typography>
                                        <Stack>
                                            {
                                                palette.map((color, index): ReactNode => (
                                                    <ColorField
                                                        key={index}
                                                        label={`${t("word.color")} ${index + 1}`}
                                                        value={color.hex}
                                                        index={index}
                                                        onChange={(color: string) => {
                                                            handlePaletteChange(color, index)
                                                        }}
                                                    />
                                                ))}
                                            <Box paddingTop={2}>
                                                <ButtonGroup>
                                                    <Button
                                                        color={"inherit"}
                                                        variant={"contained"}
                                                        onClick={(): void => {
                                                            updatePalette(DEFAULT_PALETTE);
                                                            updatePrimaryPalette(2);
                                                            updateSecondaryPalette(3);
                                                        }}
                                                    >
                                                        {t("word.reset")}
                                                    </Button>
                                                </ButtonGroup>
                                            </Box>
                                        </Stack>
                                    </Box>
                                </Paper>
                            </Grid>
                        </Grid>
                    </Box>
                </Paper>
            </Box>
        </Fragment>
    );
};

export default Settings;