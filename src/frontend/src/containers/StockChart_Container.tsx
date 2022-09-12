import React from "react";
import { set_time, set_expanded, set_currentValue, specGraphTicker , set_newsExpanded, set_measurement} from "../redux/reducers/ChartUI";
import { connect, ConnectedProps } from 'react-redux'
import { RootState } from "../redux/store";
import ChartExpanded from '../components/ChartExpanded'
import ChartCompressed from '../components/ChartCompressed'
import { Query_Measurement } from "../components/QueryHelper";
import { QueryApi } from "@influxdata/influxdb-client";
import { fade } from '../components/AnimationComps';


interface StockChart_AdditonalProps {
    ticker: string,
    qry_api: QueryApi
}

/** Passing in ownprops is a hack to only give
 * the class properties of a single ticker.  This way
 * the class will only rerender when data of that specific ticker
 * changes. We want this class to only have the properties of its 
 * specific ticker, otherwise it will continuously rerender all supported
 * stocks whenever any single datapoint changes in the reducer key value list
 */
const mapState = (state: RootState, ownProps: StockChart_AdditonalProps) => ({
    graph_ticker: specGraphTicker(state, ownProps.ticker),
});

const mapDispatch = {
    move_time: set_time,
    move_value: set_currentValue,
    expand: set_expanded,
    news_expand: set_newsExpanded,
    move_measurement: set_measurement,

}

const connector = connect(mapState, mapDispatch);

type PropsFromRedux = ConnectedProps<typeof connector>

type StockChartProps = PropsFromRedux & StockChart_AdditonalProps;

class StockChart_Container extends React.Component<StockChartProps> {
    interval: any;

    /**
     * use componentDidMount function to set an interval that updates stock price
     * NOTE: this will cause a rerender of the graph, so live data should be shown
     * without any interval in the graph component
     */
    componentDidMount() {
        this.interval = setInterval(() => this.price_update(), 15000);
    }

    /**
     * Clear the timer interval to avoid memory leaks
     */
    componentWillUnmount() {
        clearInterval(this.interval);
    }

    /** only need to update the price when time is not 1d or 1h, this is because the graph will update automatically */
    price_update() {
        if (this.props.graph_ticker.time != '-1d' && this.props.graph_ticker.time != '-1h' && this.props.graph_ticker.measurements['Price'] == true) {
            const price = Query_Measurement(this.props.ticker, this.props.graph_ticker.time, 'Price', this.props.qry_api);
                price.then((data) => {
                    if (data.value.includes('No data')){
                        console.log('no data for this time period');
                    }
                    else {
                        this.props.move_value({
                            name: this.props.ticker,
                            measurement:'Price',
                            value: data.value,
                            percentChange: data.percentChange
                        });
                    }
                    }).catch((err) => {
                        console.log(err);
                    });
        }    
    }

     render(){
        const p = this.props;
        return (
            p.graph_ticker['expanded'] ? 
            <div style={{height: 'inherit'}}>
                <ChartExpanded 
                    qry_api={p.qry_api}
                    expand_d={p.expand} 
                    moveValue={p.move_value} 
                    price={p.graph_ticker.currentValues.Price} 
                    graphTicker={p.graph_ticker} 
                    ticker={p.ticker} 
                    moveTime={p.move_time}
                    newsExpand_d={p.news_expand}
                    moveMeasurement={p.move_measurement}
                />
            </div>
            :
            <div style={{height: 'inherit', width: 'inherit'}}>
            {fade(
            <ChartCompressed 
                qry_api={p.qry_api}
                expand_d={p.expand} 
                moveValue={p.move_value} 
                price={p.graph_ticker.currentValues.Price} 
                graphTicker={p.graph_ticker} 
                ticker={p.ticker} 
                moveTime={p.move_time}
                moveMeasurement={p.move_measurement}
            />)}
            </div>
        )
    }
}

export default connector(StockChart_Container);

