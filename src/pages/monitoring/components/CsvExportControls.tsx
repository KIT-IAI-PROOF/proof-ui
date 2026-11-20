import {ChangeEvent, ReactNode, useState} from "react";
import {Button, MenuItem, Stack, TextField} from "@mui/material";
import {useTranslation} from "react-i18next";
import {CSV_SEPARATOR} from "../../../utils/constants.ts";

interface IProps {
    disabled: boolean;
    onExport: (separator: string) => void;
}

const CsvExportControls = ({disabled, onExport}: IProps): ReactNode => {

    const {t} = useTranslation();
    const [selectedCSVSeparator, setSelectedCSVSeparator] = useState<string>(CSV_SEPARATOR.comma);

    return (
        <Stack
            spacing={2}
            direction={"row"}
            alignItems={"center"}
        >
            <TextField
                select={true}
                size={"small"}
                label={t("word.separator")}
                value={selectedCSVSeparator}
                onChange={(event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>): void => {
                    setSelectedCSVSeparator(event.target.value);
                }}
                sx={{minWidth: 120}}
            >
                {Object.values(CSV_SEPARATOR).map((separator: string): ReactNode => (
                    <MenuItem key={separator} value={separator}>
                        {separator === "\t"
                            ? t("word.tabulator")
                            : separator === " " ? t("word.space") : separator}
                    </MenuItem>
                ))}
            </TextField>
            <Button
                size={"small"}
                variant={"outlined"}
                onClick={(): void => onExport(selectedCSVSeparator)}
                disabled={disabled}
                sx={{
                    height: 40,
                    py: 0,
                    lineHeight: 1,
                    alignItems: "center",
                    justifyContent: "center",
                    whiteSpace: "nowrap",
                }}
            >
                CSV {t("action.export")}
            </Button>
        </Stack>
    );
};

export default CsvExportControls;
