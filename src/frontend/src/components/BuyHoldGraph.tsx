import React from "react";
import { specBuyHold } from "../redux/reducers/ChartUI";
import { connect, ConnectedProps } from 'react-redux'
import { RootState } from "../redux/store";
import "../styles/ChartExpanded.css";
import { ResponsiveBar, BarDatum, BarTooltipProps} from "@nivo/bar";
import { BasicTooltip } from "@nivo/tooltip";
import { linearGradientDef } from "@nivo/core";

interface buyHoldProps{
    ticker:string,
};

type barData = {
    id: string,
    value: number,
}

const mapState = (state: RootState,   ownProps: buyHoldProps) => ({
    graph_buyHold: specBuyHold(state, ownProps.ticker)
});
  
const connector = connect(mapState);

type PropsFromRedux = ConnectedProps<typeof connector>;

const BuyHoldGraph = (props: buyHoldProps & PropsFromRedux):JSX.Element => {

    const p = props; 

    let data:barData[] = [
        {
            id: 'Buy',
            value: p.graph_buyHold.buy,
        },
        {
            id: 'Sell',
            value: p.graph_buyHold.sell,
        },
        {
            id: 'Hold',
            value: p.graph_buyHold.hold,
        },
        {
            id: 'Strong Sell',
            value: p.graph_buyHold.strongsell,
        },
        {
            id: 'Strong Buy',
            value: p.graph_buyHold.strongbuy,
        },
    ]


    const tool_tip: React.FunctionComponent<BarTooltipProps<BarDatum>> = (props) => {
        return(
            <BasicTooltip
                id={props.data.id}
                value={props.data.value}
                enableChip
                color={props.color}
            />
        )
    };

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
            }
            },
            legend: {
            text: {
                fill: "#aaaaaa"
            }
            }
        },
        grid: {
            line: {
            stroke: "#a9a9a9",
            }
        },
        labels: {
            text: {
                fontSize: '1.3vw',
            }
        },
    };

    const colors:any = {'Buy': '#9fff80', 'Sell': '#ff4d4d', 'Hold': '#ffff66', 'Strong Sell': '#990000', 'Strong Buy': '#008000'};

    return(
        <div style={{height: 'inherit', width: 'inherit', display: 'flex', flexDirection: 'column', color: 'black', fontWeight: 'bolder'}}>
          <ResponsiveBar
            data={data as BarDatum[]}
            indexBy="id"
            layout="horizontal"
            margin={{ top: 60, right: 80, bottom: 60, left: 150 }}
            animate={true}
            theme={theme}
            axisLeft={{
                tickPadding: 10,
                tickSize: 2
                
            }}
            enableGridX={true}
            enableGridY={false}
            labelTextColor={(data) => {return data.data.value > 0 ? "black": "transparent"}}
            keys={['value']}
            colors={({id,data}) => colors[data['id']]}
            tooltip={tool_tip}
            defs={[
                linearGradientDef('holdColor', [
                    { offset: 0, color: 'rgb(255, 230, 109)' },
                    { offset: 100, color: 'rgb(87, 232, 107)' },
                ],
                {
                    gradientTransform: 'rotate(90 0.5 0.5)'
                }),
                linearGradientDef('sellColor', [
                    { offset: 0, color: 'rgb(255, 65, 108)' },
                    { offset: 100, color: 'rgb(255, 75, 43)' },
                ],
                {
                    gradientTransform: 'rotate(90 0.5 0.5)'
                }),
                linearGradientDef('strongSellColor', [
                    { offset: 0, color: 'rgb(253, 44, 56)' },
                    { offset: 100, color: 'rgb(176, 2, 12)' },
                ],
                {
                    gradientTransform: 'rotate(90 0.5 0.5)'
                }),
                linearGradientDef('strongBuyColor', [
                    { offset: 0, color: 'rgb(0, 204, 130)' },
                    { offset: 100, color: 'rgb(58, 181, 46)' },
                ],
                {
                    gradientTransform: 'rotate(90 0.5 0.5)'
                }),
                linearGradientDef('buyColor', [
                    { offset: 0, color: '#0ba360' },
                    { offset: 100, color: '#3cba92' },
                ],
                {
                    gradientTransform: 'rotate(90 0.5 0.5)'
                }),

            ]}
            // fill={[
            //     { match: d => d.data.indexValue === 'Buy', id: 'buyColor' },
            //     { match: d => d.data.indexValue === 'Sell', id: 'sellColor' },
            //     { match: d => d.data.indexValue === 'Strong Sell', id: 'strongSellColor' },
            //     { match: d => d.data.indexValue === 'Strong Buy', id: 'strongBuyColor' },
            //     { match: d => d.data.indexValue === 'Hold', id: 'holdColor' },
            // ]}
          />
        </div>
    )
}


export default connector(BuyHoldGraph);