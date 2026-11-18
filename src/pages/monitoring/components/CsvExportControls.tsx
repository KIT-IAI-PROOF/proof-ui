import {ChangeEvent, ReactNode, useState} from "react";
import {Button, MenuItem, Stack, TextField} from "@mui/material";
import {useTranslation} from "react-i18next";
import {CSV_DELIMITER} from "../../../utils/constants.ts";

interface IProps {
    disabled: boolean;
    onExport: (delimiter: string) => void;
}

const CsvExportControls = ({disabled, onExport}: IProps): ReactNode => {

    const {t} = useTranslation();
    const [selectedCSVDelimiter, setSelectedCSVDelimiter] = useState<string>(CSV_DELIMITER.comma);

    return (
        <Stack
            spacing={2}
            direction={"row"}
            alignItems={"center"}
        >
            <TextField
                select={true}
                size={"small"}
                label={t("word.delimiter")}
                value={selectedCSVDelimiter}
                onChange={(event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>): void => {
                    setSelectedCSVDelimiter(event.target.value);
                }}
                sx={{minWidth: 120}}
            >
                {Object.values(CSV_DELIMITER).map((delimiter: string): ReactNode => (
                    <MenuItem key={delimiter} value={delimiter}>
                        {delimiter === "\t"
                            ? t("word.tabulator")
                            : delimiter === " " ? t("word.space") : delimiter}
                    </MenuItem>
                ))}
            </TextField>
            <Button
                size={"small"}
                variant={"outlined"}
                onClick={(): void => onExport(selectedCSVDelimiter)}
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
