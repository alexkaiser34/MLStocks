import React from "react";
import SearchBar from "../components/SearchBar";
import { connect, ConnectedProps } from 'react-redux'
import { RootState } from "../redux/store";
import { set_expanded } from '../redux/reducers/ChartUI';
import { supported_stocks } from "../supported_stocks";
import StockChart_Container from "./StockChart_Container";
import MarketNewsTextBox from "../components/MarketNewsTextBox";
import { add_news } from '../redux/reducers/MarketNews';
import { Query_API, Query_MarketNews } from "../components/QueryHelper";
import { QueryApi } from "@influxdata/influxdb-client";
import '../styles/SearchPage.css';
import SimpleBar from 'simplebar-react';

interface StockChartContainerProps {
    qry_api: QueryApi,
}
const mapState = (state: RootState) => ({
    tickerObj: state.ChartUI.ticker,
    expanded: state.ChartUI.isExpanded
});
  
const mapDispatch = {
    move_Expanded: set_expanded,
    add_news: add_news
}

const connector = connect(mapState,mapDispatch);

type PropsFromRedux = ConnectedProps<typeof connector>;
class SearchPage extends React.Component<PropsFromRedux & StockChartContainerProps> {

    interval: any;

    /**
     * use componentDidMount function to set an interval that updates stock price
     * NOTE: this will cause a rerender of the graph, so live data should be shown
     * without any interval in the graph component
     */
    componentDidMount() {
        this.interval = setInterval(() => this.updateNews(), 15000);
    }

    /**
     * Clear the timer interval to avoid memory leaks
     */
    componentWillUnmount() {
        clearInterval(this.interval);
    }

    updateNews() {
        console.log('in update news');
        // const qry_api = Query_API();
        const newsData = Query_MarketNews('-3d', this.props.qry_api);
        newsData.then((data) => {
            data.map((o) => {
                this.props.add_news(o);
            })
          }).catch((err) => {
            console.log(err);
          });
        
        console.log('should have added news');

    }
    displayExpandChart():JSX.Element{

        let expandedTicker: string = '';
        supported_stocks.map((ticker) => {
            if (this.props.tickerObj[ticker].expanded){
                expandedTicker = ticker;
            }
        });

        return(
            <StockChart_Container ticker={expandedTicker} qry_api={this.props.qry_api}/>
        )
    }

    render() {
        return (
            this.props.expanded ?
                <div style={{height: 'inherit'}}>
                    {this.displayExpandChart()}
                </div>
            : 
                <div className="SearchPageWrapper">
                    <div className="SearchPageHeader" style={{display: 'flex', flexDirection: 'column'}}>
                        <SearchBar />
                        <div className="glitch" title="Trending Market News">Trending Market News</div>
                        <hr style={{
                            border: '6px solid green',
                            borderRadius: '10px',
                            width: '99%'
                            }}></hr>
                    </div>
                    <SimpleBar className="simplebarSearch">
                    <div>
                        <MarketNewsTextBox qry_api={this.props.qry_api} />
                    </div>
                    </SimpleBar>
                </div>
        )
    }
}

export default connector(SearchPage);