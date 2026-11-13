import {Fragment, ReactNode, useContext, useState} from 'react';
import {Splitter, Tree} from "antd";
import PhaseSelector from "../components/PhaseSelector.tsx";
import JSZip from 'jszip';
import FileSaver from 'file-saver';
import {Box, Button, Divider, Paper, Stack, Theme, Typography, useTheme} from "@mui/material";
import PageHeader from "../../../app/components/PageHeader.tsx";
import {FileUpload, UploadRounded} from "@mui/icons-material";
import {useMutation, UseMutationResult} from "@tanstack/react-query";
import {AxiosError} from "axios";
import CodeMirror from "@uiw/react-codemirror";
import {json} from "@codemirror/lang-json";
import {EditorView} from "@codemirror/view";
import {githubLight} from "@uiw/codemirror-theme-github";
import {IAppContext} from "../../../provider/AppProvider.tsx";
import {AppContext} from "../../../provider/AppContext.tsx";
import Grid from "@mui/material/Grid2";
import {usePersistedState} from "../../../hooks/usePersistedState.ts";
import ConfirmDialog from "../../../app/components/ConfirmDialog.tsx";
import {useTranslation} from "react-i18next";
import {PAGE_CONTAINER_PADDING} from "../../../utils/constants.ts";
import {attachmentService, blockService, fmuImporterService, programService} from "../../../services/instances.ts";

const FmuImport: () => ReactNode = (): ReactNode => {

    const {updateError, sessionKey} = useContext<IAppContext>(AppContext);
    const theme: Theme = useTheme();
    const [treeData, setTreeData] = usePersistedState<any[]>([], 'treeData');
    const [checkedKeys, setCheckedKeys] = usePersistedState<any[]>([], 'checkedKeys');
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [modalBlockData, setModalBlockData] = useState<any>(null);
    const [processedBlock, setProcessedBlock] = useState<any>(null);
    const [createAttachments, setCreateAttachments] = useState(false);
    const [baseName, setBaseName] = useState('');
    const {t} = useTranslation();

    const processMutation: UseMutationResult<string, AxiosError, string, any> = useMutation({
        retry: false,
        mutationKey: ['processSelectedBlocks'],
        mutationFn: async (data: string): Promise<any> => {
            return await fmuImporterService.processSelected(undefined, data);
        },
        onMutate: async (): Promise<void> => {
            setModalBlockData(null);
            setProcessedBlock(null);
        },
        onSuccess: async (data: any): Promise<void> => {
            const updatedData = {
                ...data,
                inputs: data.inputs.map((input: any) => ({
                    ...input,
                    phase: input.phase || 'EXECUTE',
                    communicationType: input.communicationType || 'STEPBASED',
                })),
                outputs: data.outputs.map((output: any) => ({
                    ...output,
                    phase: output.phase || 'EXECUTE',
                    communicationType: output.communicationType || 'STEPBASED',
                })),
            };
            updateError(undefined);
            setModalBlockData(updatedData);
            setIsModalVisible(true);
        },
        onError: (): void => {
            updateError('Fehler beim Verarbeiten der ausgewählten Werte');
        }
    });

    const processDefinitionsMutation: UseMutationResult<string, AxiosError, string, any> = useMutation({
        retry: false,
        mutationKey: ['processDefinitions'],
        mutationFn: async (data: string): Promise<any> => {
            return await fmuImporterService.processDefinitions(undefined, data)
        },
        onMutate: async (): Promise<void> => {
            setIsModalVisible(false);
            setCheckedKeys([]);
        },
        onSuccess: async (data: any): Promise<void> => {
            updateError(undefined);
            setProcessedBlock(data);
        },
        onError: (): void => {
            updateError('Fehler beim Verarbeiten der BlockIODefinitions');
        }
    });

    const uploadMutation: UseMutationResult<any, AxiosError, File, any> = useMutation({
        retry: false,
        mutationKey: ['uploadXml'],
        mutationFn: async (file: File): Promise<any> => {
            return await fmuImporterService.uploadXml(undefined, file)
        },
        onSuccess: (data: any): void => {
            setIsModalVisible(false);
            setModalBlockData(null);
            setProcessedBlock(null);
            setCheckedKeys([]);
            setTreeData(data);
        },
        onError: (): void => {
            updateError('Fehler beim Hochladen oder Verarbeiten der XML-Datei!');
        }
    });

    const downloadMutation: UseMutationResult<void, AxiosError, void, any> = useMutation({
        retry: false,
        mutationKey: ['downloadConfiguration'],
        mutationFn: async (): Promise<void> => {
            if (!processedBlock) return;
            if (createAttachments && baseName) {
                const zip: JSZip = new JSZip();
                const attachmentData: any = await fmuImporterService.download(undefined, baseName, modalBlockData);
                const processedBlockJson: string = JSON.stringify(processedBlock, null, 2);
                const attachmentJson: string = JSON.stringify(attachmentData["attachment.json"], null, 2);
                const programJson: string = JSON.stringify(attachmentData["program.json"], null, 2);
                zip.file("processedBlock.json", processedBlockJson);
                zip.file("attachment.json", attachmentJson);
                zip.file("program.json", programJson);
                const content: Blob = await zip.generateAsync({type: "blob"});
                FileSaver.saveAs(content, getDownloadFilename() + ".zip");
            } else {
                const jsonString: string = JSON.stringify(processedBlock, null, 2);
                const blob: Blob = new Blob([jsonString], {type: 'application/json'});
                const url: string = URL.createObjectURL(blob);
                const a: HTMLAnchorElement = document.createElement('a');
                a.href = url;
                a.download = getDownloadFilename() + ".json";
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            }
        },
        onError: (): void => {
            updateError('Fehler beim Herunterladen der Anhänge');
        }
    });

    const importMutation: UseMutationResult<void, AxiosError, void, any> = useMutation({
        retry: false,
        mutationKey: ['importConfiguration'],
        mutationFn: async (): Promise<void> => {
            if (!processedBlock) return;
            await blockService.saveBlock(processedBlock, undefined, sessionKey);
            if (createAttachments && baseName) {
                const attachmentData: any = await fmuImporterService.download(undefined, baseName, modalBlockData);
                const attachment: any = attachmentData["attachment.json"];
                const program: any = attachmentData["program.json"];
                await programService.saveProgram(program, undefined, sessionKey);
                await attachmentService.createAttachmentWithFile(attachment, undefined, undefined, sessionKey);
            }
        },
        onError: (): void => {
            updateError('Fehler beim Importieren der FMU-Konfiguration');
        }
    });

    const handleModalBlockChange: (block: any, attachmentsEnabled: boolean, textBaseName: string) => void = (block: any, attachmentsEnabled: boolean, textBaseName: string): void => {
        setModalBlockData(block);
        setCreateAttachments(attachmentsEnabled);
        setBaseName(textBaseName);
    };

    const getDownloadFilename: () => string = (): string => {
        const now = new Date();
        const isoString: string = now.toISOString().replace(/:/g, '_').replace(/\..+/, '');
        return `FmuKonfiguration-${isoString}`;
    };

    return (
        <Fragment>
            <Box
                {...PAGE_CONTAINER_PADDING}
            >
                <Paper elevation={0}>
                    <Box padding={3}>
                        <PageHeader
                            headerKey={"page.header.import.fmu"}
                            tooltipTitle={"tooltip.fmu"}
                            icon={
                                <Fragment>
                                    <FileUpload
                                        color={"primary"}
                                        fontSize={"large"}
                                    />
                                </Fragment>
                            }
                            subHeaderValue={""}
                            buttons={
                                <Fragment>
                                </Fragment>
                            }
                        />
                        <Divider/>
                        <Grid
                            container={true}
                            padding={1}
                            paddingTop={5}
                            spacing={2}
                        >
                            <Grid size={{xs: 12}} paddingBottom={3}>
                                <Stack direction={"row"} spacing={1} alignItems={"center"}>
                                    <input
                                        id={"file"}
                                        type={"file"}
                                        accept={"text/xml, application/xml"}
                                        multiple={false}
                                        style={{display: "none"}}
                                        onChange={async (e: any): Promise<void> => {
                                            const file: any = e.target.files[0];
                                            if (file) {
                                                await uploadMutation.mutateAsync(file);
                                            }
                                        }}
                                    />
                                    <label
                                        htmlFor={"file"}
                                        style={{
                                            cursor: "pointer",
                                            color: theme.palette.primary.main,
                                            border: "1px solid " + theme.palette.primary.main,
                                            padding: "5px 20px",
                                            borderRadius: "4px",
                                            alignItems: "center",
                                            justifyContent: "center",
                                        }}
                                    >
                                        <Stack direction={"row"} spacing={1}>
                                            <UploadRounded/>
                                            <Typography variant={"body1"}>
                                                Upload
                                            </Typography>
                                        </Stack>
                                    </label>
                                </Stack>
                            </Grid>
                            <Grid size={{xs: 12}} paddingBottom={3}>
                                <Splitter style={{background: theme.palette.background.default, borderRadius: "5px"}}>
                                    <Splitter.Panel
                                        defaultSize="40%"
                                        min="20%"
                                        max="70%"
                                    >
                                        <Stack padding={1} spacing={1}>
                                            <Button
                                                onClick={async () => {
                                                    if (checkedKeys.length === 0) {
                                                        updateError('Bitte wähle mindestens einen Wert aus.');
                                                    } else {
                                                        const data: string = JSON.stringify({treeData, checkedKeys});
                                                        await processMutation.mutateAsync(data)
                                                    }
                                                }}
                                            >
                                                Verarbeiten
                                            </Button>
                                            {
                                                treeData && <Tree
                                                    checkable
                                                    checkedKeys={checkedKeys}
                                                    treeData={treeData}
                                                    showLine={true}
                                                    showIcon={true}
                                                    multiple={true}
                                                    onCheck={(checkedKeysValue: any) => {
                                                        setCheckedKeys(checkedKeysValue);
                                                    }}
                                                />
                                            }
                                        </Stack>
                                    </Splitter.Panel>
                                    <Splitter.Panel>
                                        <Stack padding={1} spacing={1}>
                                            <Stack alignItems={"center"} justifyContent={"center"} direction={"row"} spacing={1}>
                                                <Button
                                                    onClick={() => downloadMutation.mutate()}
                                                    disabled={!processedBlock}
                                                >
                                                    Herunterladen
                                                </Button>
                                                <Button
                                                    onClick={() => importMutation.mutate()}
                                                    disabled={!processedBlock}
                                                >
                                                    Importieren
                                                </Button>
                                            </Stack>
                                            {
                                                processedBlock && <CodeMirror
                                                    value={JSON.stringify(processedBlock, null, 2)}
                                                    extensions={[json(), EditorView.lineWrapping]}
                                                    theme={githubLight}
                                                />
                                            }
                                        </Stack>
                                    </Splitter.Panel>
                                </Splitter>
                            </Grid>
                        </Grid>
                    </Box>
                </Paper>
            </Box>
            <ConfirmDialog
                dialogTitle={t("dialog.header.configureBlock")}
                confirmAction={t("action.configure")}
                open={isModalVisible}
                setOpen={setIsModalVisible}
                callback={async () => {
                    const data: string = JSON.stringify(modalBlockData)
                    await processDefinitionsMutation.mutateAsync(data)
                }}
                extraContent={
                    <Fragment>
                        {
                            modalBlockData && <PhaseSelector
                                block={modalBlockData}
                                setModifiedBlock={handleModalBlockChange}
                            />
                        }
                    </Fragment>
                }
            />
        </Fragment>
    );
};

export default FmuImport;
