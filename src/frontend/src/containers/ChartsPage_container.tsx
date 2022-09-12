import React from "react";
import StockChart_Container from "./StockChart_Container";
import { supported_stocks } from '../supported_stocks';
import '../styles/ChartsPage.css';
import { fade } from "../components/AnimationComps";
import { BallTriangle } from 'react-loader-spinner';
import SimpleBar from "simplebar-react";
import { QueryApi } from "@influxdata/influxdb-client";

interface IState {
    loading?: boolean,
}
interface ChartsPageProps{
    qry_api: QueryApi
}
// NOTE: we really dont want this component to render often,
// rendering all stock charts constantly is a performance downgrade
// should only need to render when selected on nav bar
class ChartsPage extends React.Component<ChartsPageProps,IState> {
    interval: any;

    constructor(props: ChartsPageProps){
        super(props);
        this.state = {loading: true};
    }

    componentDidMount() {
        this.interval = setTimeout(() => this.changeLoad(), 10000);
    }

    changeLoad(){
        this.setState({loading: false});
        return () => clearTimeout(this.interval);
    }

    render() {
        return (
            <SimpleBar className="ChartsPage_Layout_wrapper" style={{overflow: this.state.loading ? 'hidden' : 'auto', height: 'inherit'}}>
                <div className="Loading" style={{display: this.state.loading ? '' : 'none', overflow: 'hidden'}}>
                    {fade(<span style={{color: 'white', fontSize: '5vh'}}>Gathering Stock Data</span>)}
                    {fade(
                        <BallTriangle color="green" ariaLabel="loading-indicator" height={100} width={100} />
                    )}
                </div>
            <div className="ChartsPage_Layout" style={{ visibility: this.state.loading? 'hidden' : 'visible'}}>
                {supported_stocks.map((ticker) => {
                   return (
                        <div key={ticker} id={ticker} className='chart' style={{height: 'inherit'}}> 
                            <StockChart_Container qry_api={this.props.qry_api} ticker={ticker} />
                        </div>
                )})}
            </div>
            </SimpleBar>
        )
    }
}

export default ChartsPage;