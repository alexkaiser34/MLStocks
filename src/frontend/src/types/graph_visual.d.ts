interface StockChartProps {
    ticker: string,
    time: string
}
interface axis_points {
    x?: string,
    y?: string
  }
  
interface QueryData {
  id?: string,
  data?: axis_points[]
}

export type StockVisualProps = StockChartProps & axis_points & QueryData;