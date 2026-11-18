import dayjs from "dayjs";

export const getCsvFilename = (title: string): string => {
    const name = title.replace(/[<>:"/\\|?*]/g, "_").replace(/\s+/g, " ").trim() || "export";
    return `${name}-${dayjs().format("YYYY-MM-DD_HH-mm-ss")}.csv`;
};
