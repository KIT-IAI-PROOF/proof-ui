import {Box, Slider, Typography} from "@mui/material";
import {LineChart} from '@mui/x-charts/LineChart';
import {useDrawingArea} from '@mui/x-charts/hooks';
import type {AxisValueFormatterContext} from '@mui/x-charts/models';
import {ReactNode, useEffect, useRef, useState} from "react";

interface IProps {
    dataLabel: string | undefined
    chartData: {
        cp: number
        input: number | null
        output: number | null
    }[]
}

interface IPlotWidth {
    left: number;
    width: number;
}

const PlotWidthObserver = ({onChange}: { onChange: (area: IPlotWidth) => void }) => {
    const {left, width} = useDrawingArea();

    useEffect(() => {
        onChange({left, width});
    }, [left, width, onChange]);

    return null;
};

export const LineDiagram: ({dataLabel, chartData}: IProps) => ReactNode = ({dataLabel, chartData}: IProps) => {
    const [zoomRange, setZoomRange] = useState<number[]>([0, 100]);
    const containerRef = useRef<HTMLDivElement | null>(null);
    const [containerHeight, setContainerHeight] = useState(0);
    const [plotWidth, setPlotWidth] = useState<IPlotWidth>({left: 0, width: 0});

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const resizeObserver = new ResizeObserver(([entry]) => {
            setContainerHeight(entry.contentRect.height);
        });
        resizeObserver.observe(container);
        return () => resizeObserver.disconnect();
    }, []);

    const chartHeight = Math.max(280, containerHeight - 80);
    const series = [
        {curve: 'linear' as const, dataKey: "input", label: "Input"},
        {curve: 'linear' as const, dataKey: "output", label: "Output"},
    ].filter(({dataKey}) => chartData.some((point) => {
        const value = dataKey === "input" ? point.input : point.output;
        return value !== null && Number.isFinite(value);
    }));

    const visibleChartData = chartData.filter((_point, index) => {
        const lastIndex = chartData.length - 1;
        const startIndex = Math.floor((zoomRange[0] / 100) * lastIndex);
        const endIndex = Math.ceil((zoomRange[1] / 100) * lastIndex);
        return index >= startIndex && index <= endIndex;
    });

    return (
        <Box ref={containerRef} sx={{backgroundColor: "#121212", height: "100%", minHeight: 336}}>
            <LineChart
                dataset={visibleChartData}
                xAxis={[{
                    scaleType: "point",
                    dataKey: "cp",
                    label: "CP",
                    valueFormatter: (value: string, context: AxisValueFormatterContext<'point'>) =>
                        context.location === 'tooltip' ? `CP: ${value}` : String(value)
                }]}
                yAxis={[{label: dataLabel}]}
                series={series}
                height={chartHeight}
                grid={{vertical: true, horizontal: true}}
            >
                <PlotWidthObserver onChange={setPlotWidth}/>
            </LineChart>
            <Typography variant="caption" color="text.secondary"
                        sx={{
                            display: "block",
                            textAlign: "left",
                            ml: `${plotWidth.left}px`,
                            transform: "translateY(-14px)"
                        }}>
                CP range: {visibleChartData[0]?.cp ?? "—"} – {visibleChartData[visibleChartData.length - 1]?.cp ?? "—"}
            </Typography>
            <Box sx={{
                ml: `${plotWidth.left}px`,
                width: `${plotWidth.width}px`,
                maxWidth: `max(0px, calc(100% - ${plotWidth.left}px))`
            }}>
                <Slider
                    sx={{mt: -3, mb: 0}}
                    getAriaLabel={() => "CP range"}
                    value={zoomRange}
                    min={0}
                    max={100}
                    disableSwap
                    valueLabelDisplay="auto"
                    valueLabelFormat={(value) => {
                        const index = Math.round((value / 100) * Math.max(chartData.length - 1, 0));
                        return String(chartData[index]?.cp ?? "—");
                    }}
                    onChange={(_event, value) => setZoomRange(value as number[])}
                />
            </Box>
        </Box>
    )
}
