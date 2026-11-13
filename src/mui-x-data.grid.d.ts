import '@mui/x-data-grid';

declare module "@mui/x-data-grid" {
    interface FooterPropsOverrides {
        selectedCount: number;
        stopLabel: string;
        deleteLabel: string;
        onBulkStop: () => void;
        onBulkDelete: () => void;
    }
}