import React, { useState, useEffect } from "react";
import { ResponsiveLine } from "@nivo/line";
import { linearGradientDef } from "@nivo/core";
import { PointTooltipProps } from "@nivo/line";
import { BasicTooltip } from "@nivo/tooltip";
import { Query_GraphData, Query_Measurement } from "./QueryHelper";
import { set_currentValue, specGraphTicker, set_news, set_buy_hold, set_earnings } from "../redux/reducers/ChartUI";
import { connect, ConnectedProps } from 'react-redux'
import { RootState } from "../redux/store";
import { QueryApi } from "@influxdata/influxdb-client";
import { MeasurementOps, TimeOps } from "../types/ChartUI_Actions";
import { getActiveMeasurement, getFullName } from "./MeasurementHelper";

interface StockChartProps {
    ticker: string,
    time: TimeOps,
    qry_api: QueryApi,
}
  

const mapState = (state: RootState,   ownProps: StockChartProps) => ({
  graph_time: specGraphTicker(state, ownProps.ticker)
});

const mapDispatch = {
  move_value: set_currentValue,
  move_news: set_news,
  move_buyHold: set_buy_hold,
  move_earnings: set_earnings
}

const connector = connect(mapState,mapDispatch);

type PropsFromRedux = ConnectedProps<typeof connector>

/** This component will update only when needed.  This happens when the page is navigated too,
 *  when the user changes time view, or when the user expands the view. NOTE: This needs to happen
 * little as the nivo responsive line chart is very performance consuming.
 */
const GraphComponent = (props: StockChartProps & PropsFromRedux, data: any, isPos:boolean): JSX.Element => {  
  
    /** Lets start by updating the mreasurement */

    const activeMeasurement = getActiveMeasurement(props.graph_time.measurements);
    
    const currentVal = Query_Measurement(props.ticker, props.time, activeMeasurement, props.qry_api);
    currentVal.then((data) => {
          props.move_value({
            name: props.ticker, 
            measurement: activeMeasurement,
            value: data.value,
            percentChange: data.percentChange,
          });
      }).catch((err) => {
      console.log(err);
    });

    const decide_tooltip_unit = (
      yFormatted: string | number,
      xFormatted: string | number
    ):string => {
      let s:string = '';
      Object.entries(props.graph_time.measurements).map(([key,value]) => {
        if (value == true){
          switch(key){
            case 'wma':
              s = 'Avg $' + yFormatted + ' at ' + xFormatted;
              break;
            case 'sma':
              s = 'Avg $' + yFormatted + ' at ' + xFormatted;
              break;
            case 'rsi':
              s = yFormatted + ' at ' + xFormatted;
              break;
            case 'momentum':
              s = yFormatted + ' at ' + xFormatted;
              break;
            case 'roc':
              s = yFormatted + ' % at ' + xFormatted;
              break;
            case 'Price':
              s = '$' + yFormatted + ' at ' + xFormatted;
              break;
            case 'ML':
              s = '$' + yFormatted + ' at ' + xFormatted;
              break;
            default:
              break;
          }
        }
      })
      return s;

    }
      /** Basic tool tip, make this dynamic based on time format */
    const tool_tip: React.FunctionComponent<PointTooltipProps> = (props) => {
      return(
          <BasicTooltip
            id={props.point.serieId} // + ' - ' + decide_label()
            value={decide_tooltip_unit(props.point.data.yFormatted, props.point.data.xFormatted)}
            enableChip
            color={props.point.color}
          />
      )
    }

    /** var to hold the theme of the chart */
    const theme = {
      background: 'transparent',//props.graph_time['expanded'] ? "rgb(78, 76, 76)" : 'transparent',
      axis: {
        tickColor: "#eee",
        ticks: {
          line: {
            stroke: "#555555"
          },
          text: {
            fill: "#aaaaaa",
            fontWeight: 'bolder',
            fontSize: props.graph_time.expanded ? 'calc(6px + 0.7vw)' : 'calc(8px + 0.3vw)'
            // fontSize: 'auto'
          }
        },
        legend: {
          text: {
            fill: "#aaaaaa",
            fontWeight: 'bolder',
            fontSize: 'calc(10px + 1vh)'
          }
        }
      },
      grid: {
        line: {
          stroke: "#555555"
        }
      },
      tooltip: {
        container: {
          backgroundColor:'black'
        }
      },
      crosshair: {
        line: {
          stroke: 'white'
        }
      }
    };



    const decide_label = ():string => {
      let s:string = '';
      const full = getFullName(props.graph_time.measurements);
      const activeMeasurement = getActiveMeasurement(props.graph_time.measurements);

      return full[activeMeasurement];
    }

    /** Return the actual chart component, performance hog */
    return (
      <div style={{ height: '100%' , width: '100%'}}>
      <ResponsiveLine 
          data={data}
          tooltip={tool_tip}
          margin={{
          top: 50,
          right: props.graph_time.expanded ? 130 : 60,
          bottom: props.graph_time.expanded ? 75 : 65,
          left: props.graph_time.expanded ? 95 : 90
          }}
          colors={isPos ? ['#00FF00', '#90EE90']: ["#DC1C13", "#FF7F7F"]}
          yScale={{
          type: 'linear',
          stacked: false,
          min: 'auto',
          max: 'auto',
          }}
          theme={theme}
          curve="linear"
          axisBottom={{
            format: (props.time == '-1d' || props.time == '1d') ? "%H:%M" :  (props.time == '-1h') ?  "%H:%M" : (props.time == '-31d' || props.time == '10d' || props.time == '30d') ? "%_m/%-d" : "%_m/%-d/%y",
            legend: (props.time == '-1d' || props.time == '1d' || props.time == '-1h') ? "Time" : "Date", 
            legendPosition: 'middle',
            legendOffset: props.graph_time.expanded ? 65 : 55,
          }}
          axisLeft={{
          legend: decide_label(),
          legendPosition: 'middle',
          legendOffset: props.graph_time.expanded ? -70 : -65,
          }}
          xScale={{
            format: '%Y-%m-%dT%H:%M:%SZ',
            type: 'time', 
            // precision: (props.time == '-1d' || props.time == '1d') ? 'minute' : props.time == '-1h' ? 'second' : 'day',
            min: 'auto',
            max: 'auto'
          }}
          xFormat={(props.time == '-1d' || props.time == '1d') ? "time:%H:%M"  : (props.time == '-1h') ? "time:%H:%M:%S" : props.time == '180d' || props.time == '-364d' ? "time:%_m/%-d/%y" : "time: %_m/%-d"}
          enableGridX={true}
          enablePoints={false}
          enableGridY={true}
          defs={[
              linearGradientDef('positiveChange', [
                { offset: 0, color: 'rgb(0, 204, 130)' },
                { offset: 100, color: 'rgb(58, 181, 46)' },
            ],
            {
                gradientTransform: 'rotate(90 0.5 0.5)'
            }),
            linearGradientDef('negativeChange', [
              { offset: 0, color: 'rgb(255, 65, 108)' },
              { offset: 100, color: 'rgb(255, 75, 43)' },
            ],
            {
                gradientTransform: 'rotate(90 0.5 0.5)'
            }),
            
          ]}
          fill={[
            { match: "*", id:  isPos ? 'positiveChange' : 'negativeChange'}
          ]}
          animate={true}
          useMesh={true}
      />
      </div>
    )
}

/** Main component to export
 * Queries for stock data and price when rendered
 * Uses the useMemo hook to return a responsive graph only when needed
 */
const StockGraph = (props: StockChartProps & PropsFromRedux) => {

    // use state hook to set the data
    const [data, setData] = useState([]);

    // lets call use effect when we change the time, this is when we need to update
    // this component should rerender every price change, so no need to set interval
    useEffect(() => {
      console.log('in use effect')
      if (props.graph_time.measurements['Price']){
        const stockData = Query_GraphData(props.ticker, props.time, 'Price', props.qry_api); 
      
      /** Parse the returned promise, should just be an array of data */
        stockData.then((data) => {
            setData(data as any);
        }).catch((err) => {
            console.log(err);
        });

        if (props.time == '-1d' || props.time == '-1h') {

          const interval = setInterval(() => {
            const stockData = Query_GraphData(props.ticker, props.time, 'Price', props.qry_api); 
        
        /** Parse the returned promise, should just be an array of data */
            stockData.then((data) => {
                setData(data as any);
            }).catch((err) => {
                console.log(err);
            });
            
          }, 15000);
          return () => {
            clearInterval(interval);
          }; 
        }
      }
      else {
        const activeMeasurement = getActiveMeasurement(props.graph_time.measurements);
        const measure_data = Query_GraphData(props.ticker, props.time, activeMeasurement, props.qry_api);

        measure_data.then((data) => {
          setData(data as any);
        }).catch((err) => {
            console.log(err);
        });

      }

    }, [props.time, props.graph_time.expanded, props.graph_time.measurements]);

    const activeMeasurement = getActiveMeasurement(props.graph_time.measurements);
    const isPos = Number(props.graph_time.currentValues[activeMeasurement].percentChange) >= 0 
    // useMemo hook, pass in component props and queried data, update when user interacts with chart
    const memoizedChart = React.useMemo(() => GraphComponent(props, data, isPos), [data, props.time, props.graph_time.expanded, props.graph_time.measurements, isPos])

    // We really need to use the useMemo hook for this, otherwise this graph will
    // rerender every time the price changes, which gets update every 10 seconds.
    // The responsive graph is by far the biggest performance hog so this is ABSOLUTELY
    // neccessary.  By using the useMemo hook, we can only rerender the functional component
    // every time data changes, user hits the expand, or they change the time
    return (
      memoizedChart
    )

  }

export default connector(StockGraph);
