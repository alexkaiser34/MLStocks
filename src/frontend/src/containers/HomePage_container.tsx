import React from 'react'
import '../App.css'
import '../styles/HomePage.css'
import 'simplebar/dist/simplebar.css';
import StockChart_Container from "./StockChart_Container";
import { connect, ConnectedProps } from 'react-redux'
import { RootState } from "../redux/store";
import { supported_stocks } from '../supported_stocks';
import { Query_API } from '../components/QueryHelper';
import  SortMenu  from '../components/SortMenu';
import Sorter from '../components/Sorter';
import SimpleBar from "simplebar-react";
import { TickerCell } from '../components/TickerCell';
import { QueryApi } from '@influxdata/influxdb-client';
import { set_currentValue, set_dailyChange, set_expanded, set_yearlyChange } from '../redux/reducers/ChartUI';
import { sortingOptions } from '../types/HomePage';
import { Query_Measurement } from '../components/QueryHelper';
import { Ml_Icon } from '../images/all_images';

interface HomePageContainerProps {
    qry_api: QueryApi,
}
const mapState = (state: RootState) => ({
    currentSort: state.HomePageReducer.sortingOps,
    graphTicker: state.ChartUI.ticker,
    expanded: state.ChartUI.isExpanded
});

const mapDispatch = {
    set_expanded: set_expanded,
    move_daily: set_dailyChange,
    move_value: set_currentValue,
    move_yearly: set_yearlyChange
}

interface IState {
    currentSort: sortingOptions,
}

const connector = connect(mapState, mapDispatch);

type PropsFromRedux = ConnectedProps<typeof connector>

class HomePage extends React.Component<PropsFromRedux & HomePageContainerProps, IState> {
    
    interval: any;
    
    componentDidMount() {
        console.log('in component did mount');
        window.scrollTo(0, 0);
        this.interval = setInterval(() => this.updateValues(), 25000);
    }

    /**
     * Clear the timer interval to avoid memory leaks
     */
    componentWillUnmount() {
        clearInterval(this.interval);
    }

    

    getActive():sortingOptions {
        let active:sortingOptions = 'dailyMovers';
        Object.entries(this.props.currentSort).map(([key,value]) => {
            if (value == true)
            {
                active = key as sortingOptions;
            }
        })
    
        return active;
    }

    updateValues(){
        if (!this.props.expanded) {

            const activeSort = this.getActive();

            Sorter(supported_stocks, activeSort, this.props.graphTicker).map((ticker) => {
                
                /** note, we want to update the price regardless of sort */
                const price = Query_Measurement(ticker, '-364d', 'Price', this.props.qry_api);
                price.then((data) => {
                    if (data.value.includes('No data')){
                        console.log('no data for this time period');
                    }
                    else {
                        this.props.move_value({
                            name: ticker,
                            measurement:'Price',
                            value: data.value,
                            percentChange: data.percentChange
                        });
                    }
                    }).catch((err) => {
                        console.log(err);
                });

                switch(activeSort){
                    /**lets update the daily change */
                    case 'dailyMovers':
                        const daily = Query_Measurement(ticker, '-1d', 'Price', this.props.qry_api);
                        daily.then((data) => {
                            if (data.value.includes('No data')){
                                console.log('no data for this time period');
                                const dailyAgain = Query_Measurement(ticker, '-2d', 'Price', this.props.qry_api);
                                dailyAgain.then((data) => {
                                if (data.value.includes('No data')){
                                    console.log('no data for this time period 2d');
                                    const dailyLast = Query_Measurement(ticker, '-3d', 'Price', this.props.qry_api);
                                    dailyLast.then((data) => {
                                    if (data.value.includes('No data')){
                                        console.log('just assume stock market is closed for a while');
                                        this.props.move_daily({
                                        name: ticker,
                                        value: 'No data',
                                        });
                                    }
                                    else {
                                        this.props.move_daily({
                                        name: ticker,
                                        value: data.percentChange
                                        });
                                    }
                                    }).catch((err) => {
                                    console.log(err);
                                    });
                                }
                                else {
                                    this.props.move_daily({
                                    name: ticker,
                                    value: data.percentChange
                                });
                                }
                                }).catch((err) => {
                                console.log(err);
                                });
                            }
                            else {
                                this.props.move_daily({
                                    name: ticker,
                                    value: data.percentChange
                                });
                            }
                            }).catch((err) => {
                                console.log(err);
                        });
                        break;
        
                    
                    case 'yearlyMovers':
                        const yearly = Query_Measurement(ticker, '-364d', 'Price', this.props.qry_api);
                        yearly.then((data) => {
                            if (data.value.includes('No data')){
                                console.log('no data for this time period');
                            }
                            else {
                                this.props.move_yearly({
                                    name: ticker,
                                    value: data.percentChange
                                });
                            }
                            }).catch((err) => {
                                console.log(err);
                        });

                        break;
        
                    /** for most expensive and most popular, no need to query
                     * mostExpensive --> Price is only displayed
                     * mostPopular --> Volume does not get updated often enough
                     */
                    default:
                        break;
                }
            
            
            });
    }
        
        
    }



    displayExpandChart():JSX.Element{

        let expandedTicker: string = '';
        supported_stocks.map((ticker) => {
            if (this.props.graphTicker[ticker].expanded){
                expandedTicker = ticker;
            }
        });

        return(
            <StockChart_Container ticker={expandedTicker} qry_api={this.props.qry_api}/>
        )
    }

    render() {
        return this.props.expanded ? (

            <div key={'homepageExpand'} style={{height: 'inherit'}}>
                    {this.displayExpandChart()}
            </div>
        ): (
            <div className='HomePageWrapper'>
                
                <div className='HomePageBar'>
                    
                    {/* <div className="glitch_home" title="MLStocks">MLStocks</div> */}
                    <div className='SortHeader'>
                        <div>
                            <h2>Supported Stock List</h2>
                        </div>
                        <div>
                            <a href="https://github.com/alexkaiser34/MLStocks" target="_blank">
                                <img style={{maxHeight: '100px', height: '12vh'}} src={Ml_Icon} alt="MLStocks" title='MLStocks Repository'></img>
                            </a>
                        </div>
                        <div className='SortMenu'>
                            <h2 style={{paddingRight: '20px'}}>Sort by: </h2>
                            <SortMenu  />
                        </div>
                    </div>
                    <hr style={{width: '100%', border: '4px solid #08eb08'}}></hr>
                </div>
                <SimpleBar className='SortTableWrapper'>
                <div className='HomePageList'>
                    {Sorter(supported_stocks, this.getActive(), this.props.graphTicker).map((ticker) => {
                        return (
                            <div key={'tickercellWrapperHome ' + ticker}>
                                <TickerCell sortSelected={this.getActive()} ticker={ticker} set_expanded={this.props.set_expanded} graphTicker={this.props.graphTicker[ticker]} />
                            </div>
                        )   
                    })}
                </div>
                </SimpleBar>
            </div>
        )
    }
}

export default connector(HomePage);