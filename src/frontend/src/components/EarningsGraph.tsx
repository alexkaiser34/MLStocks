import React, {useMemo} from "react";
import { specEarnings } from "../redux/reducers/ChartUI";
import { connect, ConnectedProps } from 'react-redux'
import { RootState } from "../redux/store";
import { ResponsiveBar, BarDatum, BarTooltipProps} from "@nivo/bar";
import { BasicTooltip } from "@nivo/tooltip";
import "../styles/ChartExpanded.css";

interface scatterplot_props{
    ticker:string,
};


interface barPoint {
    id: string,
    "Actual": number,
    "Surprise": number,
    "Estimate": number,
}


const mapState = (state: RootState,   ownProps: scatterplot_props) => ({
    graph_earnings: specEarnings(state, ownProps.ticker)
  });
  
const connector = connect(mapState);

type PropsFromRedux = ConnectedProps<typeof connector>;

const EarningsGraph = (props: scatterplot_props & PropsFromRedux):JSX.Element => {

    const p = props;

    let data:barPoint[] = [];  

    // we have to create these flags for the time being to avoid repeated values
    // something is a little off with the query for earnings, and its somehow returning
    // the same object twice for each data point, which is causing errors
    // without these flags
    let flags:any = {
      q1Flag: false,
      q2Flag: false,
      q3Flag: false,
      q4Flag: false,
    };

    for (let i = 0; i < p.graph_earnings.length; i++) {
      let quarter:string = '';

      if ((Number(p.graph_earnings[i].time.split('-')[1]) <= 3) && !flags.q1Flag) {
        quarter = "Q1";
        flags.q1Flag = true;
      }
      else if ((Number(p.graph_earnings[i].time.split('-')[1]) >= 4 && Number(p.graph_earnings[i].time.split('-')[1]) <= 6) && !flags.q2Flag) {
        quarter = "Q2";
        flags.q2Flag = true;

      }
      else if ((Number(p.graph_earnings[i].time.split('-')[1]) >= 7 && Number(p.graph_earnings[i].time.split('-')[1]) <= 9) && !flags.q3Flag) {
        quarter = "Q3";
        flags.q3Flag = true;
      }
      else if (!flags.q4Flag && (Number(p.graph_earnings[i].time.split('-')[1]) > 9)){
        quarter = "Q4";
        flags.q4Flag = true;
      }
      else {
        quarter = '';
      }

      /** only push one data point for each quarter */
      if (quarter != ''){
        data.push({
          id: quarter + ',' +p.graph_earnings[i].time.split('-')[0],
          "Actual": Number(p.graph_earnings[i].Actual),
          "Estimate": Number(p.graph_earnings[i].Estimate),
          "Surprise": Number(p.graph_earnings[i].Surprise),
        })
      }
    };

    const max = Math.max(...p.graph_earnings.map(o => 
      Math.max(...[Number(o.Actual), Number(o.Estimate), Number(o.Surprise)])
      ));

    const min = Math.min(...p.graph_earnings.map(o => 
      Math.min(...[Number(o.Actual), Number(o.Estimate), Number(o.Surprise)])
      ));

    const keys = ["Actual", "Estimate", "Surprise"];

    const theme = {
      background: 'transparent',
      axis: {
          tickColor: "#eee",
          paddingLeft: '100px',
          ticks: {
          line: {
              stroke: "#555555",
              paddingLeft: '100px'

          },
          text: {
              fill: "#a9a9a9",
              fontSize: '1.3vw',
              fontWeight:'bolder'
          }
          },
          legend: {
          text: {
              fill: "#aaaaaa",
              fontSize: '50px'
          }
          }
      },
      tooltip: {
        container: {
          backgroundColor:'black'
        }
      },
      grid: {
          line: {
          stroke: "#a9a9a9",
          }
      },
      labels: {
          text: {
              fill: 'transparent'
          }
      },
      legends: {
        text: {
          fontSize: '1.3vw'
        }
      }
  };

  const tool_tip: React.FunctionComponent<BarTooltipProps<BarDatum>> = (props) => {
    return(
        <BasicTooltip
            id={props.label}
            value={props.value}
            enableChip
            color={props.color}
        />
    )
};

  const yAxesPts = ():number[] => {
    let yAxes:number[] = [0];

    for (let k = min; k <= max+((max-min)/3); k+=((max-min)/3)){
      yAxes.push(Number(k.toFixed(2)));
    }

    return yAxes;

  }  

  const commonProps = {
    margin: { top: 60, right: 170, bottom: 60, left: 80 },
    data: data as any,
    colors: ['#9fff80', '#ff4d4d', '#ffff66'],
    indexBy: 'id',
    padding: 0.3,
    innerPadding: 8
  }
  
    return(
        <div key={'barWrapper'} style={{ height: '100%', width: '100%',  display: 'flex', flexDirection: 'row', justifyContent: 'space-evenly',  paddingTop: '10px', paddingLeft: '50px', paddingRight: '20px'}}>
          <div key={'barDiv'} style={{height: 'inherit', width: 'inherit', display: 'flex', flexDirection: 'column', color: 'white'}}>
          
          <ResponsiveBar
            {...commonProps}
            tooltip={tool_tip}
            keys={keys}
            groupMode="grouped"
            axisLeft={{
              tickPadding: 10,
              tickSize: 2,
              tickValues: yAxesPts()
            }}
            gridYValues={yAxesPts()}
            theme={theme}
            enableGridX={false}
            enableGridY={true}
            legends={[
              {
                dataFrom: 'keys',
                anchor: 'top-right',
                direction: 'column',
                itemHeight: 20,
                itemWidth: 20,
                translateX: 40,
                itemTextColor: 'grey',
                translateY: 0,
                itemDirection:'left-to-right',
                itemOpacity: 1,
                symbolSize: 30,
                itemsSpacing: 30,
                effects: [
                  {
                    on: 'hover',
                    style: {
                      itemTextColor: 'white',
                      symbolSize: 40
                    },
                  },
                ],
              }
            ]}

          />
        </div>
        </div>

    )
}


export default connector(EarningsGraph);