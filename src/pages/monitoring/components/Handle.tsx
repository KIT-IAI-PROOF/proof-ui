import {InputDetail, InputDetailTypeEnum} from "@kit-iai-proof/proof-config-manager-client";
import React, {ChangeEvent, Dispatch, Fragment, ReactNode, SetStateAction, SyntheticEvent, useCallback, useContext} from "react";
import Grid from "@mui/material/Grid2";
import {Alert, Autocomplete, AutocompleteRenderInputParams, Box, FormControl, FormLabel, Stack, TextField, Theme, Tooltip, Typography, useTheme} from "@mui/material";
import CodeMirror from "@uiw/react-codemirror";
import {json} from "@codemirror/lang-json";
import {jsonSyntaxLinter} from "../../../utils/linter/jsonSyntaxLinter.ts";
import {EditorView} from "@codemirror/view";
import {IMonitoringContext} from "../../../provider/MonitoringProvider.tsx";
import {MonitoringContext} from "../../../provider/MonitoringContext.tsx";
import {useTranslation} from "react-i18next";
import {Info} from "@mui/icons-material";
import {oneDark} from "@codemirror/theme-one-dark";
import {githubLight} from "@uiw/codemirror-theme-github";
import {useQuery} from "@tanstack/react-query";
import {fileService} from "../../../services/instances.ts";

interface IProps {
    handle: InputDetail;
    jsonError: Record<string, string | undefined>;
    setJsonError: Dispatch<SetStateAction<Record<string, string | undefined>>>;
    showLeftColumn?: boolean;
}

/**
 * Handle component renders a single input row.
 *
 * When showLeftColumn=false (default): Used for static inputs (required/optional sections)
 *   - Column 1: Label (xs: 4, lg: 2)
 *   - Column 2: Input field with unit (xs: 8, lg: 10)
 *
 * When showLeftColumn=true: Used for non-static inputs section
 *   - Column 1: Label (xs: 4, lg: 2)
 *   - Column 2: Start value with unit (xs: 4, lg: 5)
 *   - Column 3: Default value with unit (xs: 4, lg: 5)
 */
const Handle = ({handle, jsonError, setJsonError, showLeftColumn: showLeftColumn = false}: IProps): ReactNode => {

    const {t} = useTranslation();
    const theme: Theme = useTheme();

    const {
        execParameters,
        addExecParameter,
        removeKeyFromExecParameters,
        missingRequiredFields,
        execStartValues,
        addExecStartValue,
        removeKeyFromExecStartValues,
        execDefaultValues,
        addExecDefaultValue,
        removeKeyFromExecDefaultValues
    } = useContext<IMonitoringContext>(MonitoringContext);

    const updateJsonError: (key: string, value: string | undefined) => void = useCallback((key: string, value: string | undefined): void => {
        setJsonError((prevState: { [p: string]: string | undefined }): { [p: string]: string | undefined } => ({
            ...prevState,
            [key]: value
        }))
    }, [setJsonError]);

    const {data: files} = useQuery({
        queryKey: ['files'],
        queryFn: async ({signal}) => {
            return await fileService.listFiles("userdata", signal);
        }
    });

    return (
        <Fragment>
            <Grid
                key={handle.id}
                size={12}
                container={true}
                spacing={1}
                display={"flex"}
                flexDirection={"row"}
                alignItems={"center"}
                sx={{paddingTop: 0, paddingBottom: 0.5}}
            >
                {/* Label Column */}
                <Grid
                    size={{xs: 4, lg: 2}}
                    display={"flex"}
                    alignItems={"center"}
                >
                    <Stack direction={"row"} alignItems={"center"}>
                        <Typography
                            variant={"body1"}
                            color={"primary"}
                            sx={{
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                                flexShrink: 1,
                                minWidth: 0
                            }}
                        >
                            {handle.label} {handle.required && '*'}
                        </Typography>
                        <Tooltip
                            title={
                                <Stack>
                                    <Typography>
                                        {handle.description}
                                    </Typography>
                                    {handle.defaultValue &&
                                        <Typography>
                                            {t("word.defaultValue")}: {handle.defaultValue}
                                        </Typography>
                                    }
                                    {handle.startValue &&
                                        <Typography>
                                            {t("word.startValue")}: {handle.startValue}
                                        </Typography>
                                    }
                                </Stack>
                            }
                        >
                            <Info
                                color={"primary"}
                                fontSize={"small"}
                                sx={{ml: 1, cursor: "pointer"}}
                            />
                        </Tooltip>
                    </Stack>
                </Grid>
                {/* add left Column when showLeftColumn is true */}
                {showLeftColumn && (
                    <Grid
                        size={{xs: 4, lg: 5}}
                    >
                        <Stack direction={"row"} alignItems={"center"} spacing={1}>
                            {
                                handle.type === InputDetailTypeEnum.FileName &&
                                <Autocomplete
                                    size={"small"}
                                    fullWidth={true}
                                    freeSolo={true}
                                    multiple={false}
                                    value={execStartValues[handle.id!] ?? (handle as any)?.startValue ?? ""}
                                    options={files ?? []}
                                    onInputChange={(_event: SyntheticEvent<Element, Event>, value: string | null): void => {
                                        if (value && value !== "") {
                                            addExecStartValue(handle.id!, value)
                                        } else {
                                            removeKeyFromExecStartValues(handle.id!)
                                        }
                                    }}
                                    renderInput={(params: AutocompleteRenderInputParams) => <TextField
                                        {...params}
                                        label={t("word.startValue")}
                                        required={handle.required}
                                        error={handle.required && missingRequiredFields.includes(handle.id!)}
                                        helperText={
                                            handle.required && missingRequiredFields.includes(handle.id!)
                                                ? t("word.required")
                                                : ""
                                        }
                                    />
                                    }
                                />
                            }
                            {
                                (handle.type === InputDetailTypeEnum.String || handle.type === InputDetailTypeEnum.Float || handle.type === InputDetailTypeEnum.Integer) &&
                                <TextField
                                    type={handle.type === InputDetailTypeEnum.Integer || handle.type === InputDetailTypeEnum.Float ? "number" : "text"}
                                    size={"small"}
                                    required={handle.required}
                                    value={execStartValues[handle.id!] ?? (handle as any)?.startValue ?? ""}
                                    onChange={(event: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>): void => {
                                        if (event.target.value.toString() !== "")
                                            addExecStartValue(handle.id!, event.target.value.toString())
                                        else
                                            removeKeyFromExecStartValues(handle.id!)
                                    }}
                                    fullWidth={true}
                                    error={handle.required && missingRequiredFields.includes(handle.id!)}
                                    helperText={
                                        handle.required && missingRequiredFields.includes(handle.id!)
                                            ? t("word.required")
                                            : ""
                                    }
                                >
                                </TextField>
                            }
                            {
                                (handle.type === InputDetailTypeEnum.Object || handle.type === InputDetailTypeEnum.ObjectArray || handle.type === InputDetailTypeEnum.StringArray || handle.type === InputDetailTypeEnum.IntegerArray || handle.type === InputDetailTypeEnum.FloatArray) &&
                                <FormControl
                                    fullWidth={true}
                                    required={handle.required}
                                    error={handle.required && missingRequiredFields.includes(handle.id!)}
                                >
                                    <CodeMirror
                                        value={execStartValues[handle.id!] ?? (handle as any)?.startValue ?? ""}
                                        extensions={[json(), jsonSyntaxLinter(t, handle.type), EditorView.lineWrapping]}
                                        onChange={(value: string): void => {
                                            try {
                                                JSON.parse(value)
                                                updateJsonError(handle.id!, undefined);
                                            } catch (error) {
                                                if (error instanceof SyntaxError)
                                                    updateJsonError(handle.id!, error.message);
                                            }
                                            if (value === "")
                                                updateJsonError(handle.id!, undefined);
                                            if (value !== '')
                                                addExecStartValue(handle.id!, value)
                                            else
                                                removeKeyFromExecStartValues(handle.id!)
                                        }}
                                        theme={theme.palette.mode === "dark" ? oneDark : githubLight}
                                    >

                                    </CodeMirror>
                                    <Box paddingTop={1}>
                                        {
                                            (handle.required && missingRequiredFields.includes(handle.id!)) && (
                                                <Alert severity="error" sx={{mt: 1}}>
                                                    {t("word.required")}
                                                </Alert>
                                            )}
                                        {
                                            jsonError[handle.id!] &&
                                            <Alert severity={"warning"}>
                                                {jsonError[handle.id!]}
                                            </Alert>
                                        }
                                    </Box>
                                </FormControl>
                            }
                            {
                                handle.unit && <FormLabel color={"primary"}>{handle.unit}</FormLabel>
                            }
                        </Stack>
                    </Grid>
                )}
                {/* Main Column */}
                <Grid
                    size={{xs: showLeftColumn ? 4 : 8, lg: showLeftColumn ? 5 : 10}}
                >
                    <Stack direction={"row"} alignItems={"center"} spacing={1}>
                        {
                            handle.type === InputDetailTypeEnum.FileName &&
                            <Autocomplete
                                size={"small"}
                                fullWidth={true}
                                freeSolo={true}
                                multiple={false}
                                value={showLeftColumn ? (execDefaultValues[handle.id!] ?? "") : (execParameters[handle.id!] ?? handle.defaultValue ?? "")}
                                options={files ?? []}
                                onInputChange={(_event: SyntheticEvent<Element, Event>, value: string | null): void => {
                                    if (value && value !== "") {
                                        if (showLeftColumn) addExecDefaultValue(handle.id!, value)
                                        else addExecParameter(handle.id!, value)
                                    } else {
                                        if (showLeftColumn) removeKeyFromExecDefaultValues(handle.id!)
                                        else removeKeyFromExecParameters(handle.id!)
                                    }
                                }}
                                renderInput={(params: AutocompleteRenderInputParams) => <TextField
                                    {...params}
                                    required={handle.required}
                                    error={handle.required && missingRequiredFields.includes(handle.id!)}
                                    helperText={
                                        handle.required && missingRequiredFields.includes(handle.id!)
                                            ? t("word.required")
                                            : ""
                                    }
                                />
                                }
                            />
                        }
                        {
                            (handle.type === InputDetailTypeEnum.String || handle.type === InputDetailTypeEnum.Float || handle.type === InputDetailTypeEnum.Integer) &&
                            <TextField
                                type={handle.type === InputDetailTypeEnum.Integer || handle.type === InputDetailTypeEnum.Float ? "number" : "text"}
                                size={"small"}
                                required={handle.required}
                                value={showLeftColumn ? (execDefaultValues[handle.id!] ?? "") : (execParameters[handle.id!] ?? handle.defaultValue ?? "")}
                                onChange={(event: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>): void => {
                                    if (event.target.value.toString() !== "") {
                                        if (showLeftColumn) addExecDefaultValue(handle.id!, event.target.value.toString())
                                        else addExecParameter(handle.id!, event.target.value.toString())

                                    } else {
                                        if (showLeftColumn) removeKeyFromExecDefaultValues(handle.id!)
                                        else removeKeyFromExecParameters(handle.id!)
                                    }
                                }}
                                fullWidth={true}
                                error={handle.required && missingRequiredFields.includes(handle.id!)}
                                helperText={
                                    handle.required && missingRequiredFields.includes(handle.id!)
                                        ? t("word.required")
                                        : ""
                                }
                            >
                            </TextField>
                        }
                        {
                            (handle.type === InputDetailTypeEnum.Object || handle.type === InputDetailTypeEnum.ObjectArray || handle.type === InputDetailTypeEnum.StringArray || handle.type === InputDetailTypeEnum.IntegerArray || handle.type === InputDetailTypeEnum.FloatArray) &&
                            <FormControl
                                fullWidth={true}
                                required={handle.required}
                                error={handle.required && missingRequiredFields.includes(handle.id!)}
                            >
                                <CodeMirror
                                    value={showLeftColumn ? (execDefaultValues[handle.id!] ?? "") : (execParameters[handle.id!] ?? handle.defaultValue ?? "")}
                                    extensions={[json(), jsonSyntaxLinter(t, handle.type), EditorView.lineWrapping]}
                                    onChange={(value: string): void => {
                                        try {
                                            JSON.parse(value)
                                            updateJsonError(handle.id!, undefined);
                                        } catch (error) {
                                            if (error instanceof SyntaxError)
                                                updateJsonError(handle.id!, error.message);
                                        }
                                        if (value === "")
                                            updateJsonError(handle.id!, undefined);
                                        if (value !== '') {
                                            if (showLeftColumn) addExecDefaultValue(handle.id!, value)
                                            else addExecParameter(handle.id!, value)
                                        } else {
                                            if (showLeftColumn) removeKeyFromExecDefaultValues(handle.id!)
                                            else removeKeyFromExecParameters(handle.id!)
                                        }
                                    }}
                                    theme={theme.palette.mode === "dark" ? oneDark : githubLight}
                                >

                                </CodeMirror>
                                <Box paddingTop={1}>
                                    {
                                        (handle.required && missingRequiredFields.includes(handle.id!)) && (
                                            <Alert severity="error" sx={{mt: 1}}>
                                                {t("word.required")}
                                            </Alert>
                                        )}
                                    {
                                        jsonError[handle.id!] &&
                                        <Alert severity={"warning"}>
                                            {jsonError[handle.id!]}
                                        </Alert>
                                    }
                                </Box>
                            </FormControl>
                        }
                        {
                            handle.unit && <FormLabel color={"primary"}>{handle.unit}</FormLabel>
                        }
                    </Stack>
                </Grid>
            </Grid>
        </Fragment>
    );
}

export default React.memo(Handle)