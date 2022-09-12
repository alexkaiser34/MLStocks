import React, { CSSProperties, useEffect, useState } from "react";
import { Expand_Icon } from '../images/all_images';
import SimpleBar from "simplebar-react";
import StockGraph from "./StockGraph";
import '../styles/ChartExpanded.css';
import { QueryApi } from "@influxdata/influxdb-client";
import EarningsGraph from './EarningsGraph';
import BuyHoldGraph from './BuyHoldGraph';
import BuyHoldCircle from './CircularBuyHold'
import styled, {css} from 'styled-components';
import CompanyNewsTextBox from './CompanyNewsTextBox';
import { fade } from './AnimationComps';
import { TickerData } from '../redux/reducers/ChartUI';
import { StatsTable } from "./StatsTable";
import MeasurementMenu from "./MeasurementMenu";
import { getActiveMeasurement } from './MeasurementHelper';
import { AnimatedNumber } from "./MeasurementHelper";

interface expandedProps {
    expand_d: any,
    newsExpand_d: any,
    moveValue: any,
    price: any,
    graphTicker: TickerData,
    ticker: string,
    qry_api: QueryApi,
    moveTime: any, 
    moveMeasurement: any,
}
interface isPos{
    isPos:boolean
}
const ExpandButton = styled.button<isPos>`
        &:hover {
            filter: ${(p: isPos) => (p.isPos ? 'invert(44%) sepia(62%) saturate(2837%) hue-rotate(90deg) brightness(134%) contrast(94%)' : 'grayscale(100%) brightness(40%) sepia(100%) hue-rotate(-50deg) saturate(6000%) contrast(0.8)')};
        }`

const ViewMoreButton = styled.button<isPos>`
        
        background-color: black;
        color: ${(p: isPos) => (p.isPos ? 'rgb(20, 202, 20)' : '#DC1C13')};
        border: none;
        font-size: calc(11px + 0.8vh);
        &:hover {
            color: white ;
            transition: all 0.3s ease;
            cursor: pointer;
        }`


const ChartExpanded = (props: expandedProps):JSX.Element => {

    const p = props;
    const activeMeasurement = getActiveMeasurement(props.graphTicker.measurements);
    const isPos:boolean = Number(p.graphTicker.currentValues[activeMeasurement].percentChange) >= 0;

    const [resize, setResize] = useState({ width: 0, height: 0 });

    /** add an event listener for resizing of window.
     * We want the animated numbers to rerender on resize,
     * otherwise they look weird.
     */
    useEffect(() => {
        window.addEventListener('resize', updateDimensions);

        return function(){
            window.removeEventListener('resize', updateDimensions);
        }
    }, []);

    const updateDimensions = () => {
        setResize({ width: window.innerWidth, height: window.innerHeight });
    };



    const timeButtonStyle = (s: string):CSSProperties => {
        return(
            {
                backgroundColor: p.graphTicker['time'] == s && isPos ? 'rgb(100, 99, 97)' :
                        p.graphTicker['time'] == s && !isPos ? 'rgb(167, 165, 161)' : 'black',
                color: isPos  ? 'rgb(20, 202, 20)' : '#DC1C13',
                fontWeight: 'bolder',
                fontFamily:'sans-serif',
            }
        )
    }

    const SmartText = (s: string):JSX.Element => {
        const [showLess, setShowLess] = React.useState(true);
        const length = 300;
        
        if (s.length < length) {
            return <p>{s}</p>;
        }

        return (
            <div>
                <p style={{
                    fontSize: 'calc(10px + 0.8vh)',
                    fontWeight: 'bold',
                    color: 'lightgray',
                    paddingRight: '20px',
                    lineHeight: 'calc(20px + 1vh)'}}
                >{ showLess ? `${s.slice(0, length)}...` : s }</p>
                <ViewMoreButton isPos={isPos} onClick={() => setShowLess(!showLess)}>
                    View {showLess ? "More" : "Less"}
                </ViewMoreButton>
            </div>
        );
    }

    const animatedPriceTop = React.useMemo(() => AnimatedNumber(props.graphTicker,true,  'cp', isPos, activeMeasurement), [props.price.value, isPos, resize]);
    const animatedPriceChart = React.useMemo(() => AnimatedNumber(props.graphTicker,false, 'cp', isPos, activeMeasurement), [props.graphTicker.currentValues[activeMeasurement].value, isPos, resize]);
    const animatedPercentChangeChart = React.useMemo(() => AnimatedNumber(props.graphTicker,false, 'percent', isPos, activeMeasurement), [props.graphTicker.currentValues[activeMeasurement].percentChange, isPos, resize]);


    /** adjust the buttons if we are displaying machine learning */
    const buttonCont = ():JSX.Element => {
        return activeMeasurement != 'ML' ?
        (
        <div className="btns_Expand" >
            <button style={timeButtonStyle('-1h')} onClick={() => p.moveTime({name: p.ticker, time: '-1h'})}>1 H</button>
            <button style={timeButtonStyle('-1d')} onClick={() => p.moveTime({name: p.ticker, time: '-1d'})}>1 D</button>
            <button style={timeButtonStyle('-31d')} onClick={() => p.moveTime({name: p.ticker, time: '-31d'})}>1 M</button>
            <button style={timeButtonStyle('-364d')} onClick={() => p.moveTime({name: p.ticker, time: '-364d'})}>1 Y</button>
        </div>
        ) : (
        <div className="btns_Expand">
            <button style={timeButtonStyle('10d')} onClick={() => p.moveTime({name: p.ticker, time: '10d'})}>10 D</button>
            <button style={timeButtonStyle('30d')} onClick={() => p.moveTime({name: p.ticker, time: '30d'})}>30 D</button>
            <button style={timeButtonStyle('60d')} onClick={() => p.moveTime({name: p.ticker, time: '60d'})}>60 D</button>
            <button style={timeButtonStyle('180d')} onClick={() => p.moveTime({name: p.ticker, time: '180d'})}>180 D</button>
        </div>
        )
    }
    return (
        <div className="ExpandedChart" style={{color: 'white' }}>
                <div className="ticker_button_Expand"
                    style={{borderBottom: isPos ? '1vh solid rgb(20, 202, 20)' : '1vh solid #DC1C13'}}>
                    <h1>{p.ticker}</h1>
                    <h3 className="companyName" style={{color: 'white'}}>{p.graphTicker['companyProfile']['name']}</h3>
                    <a href={p.graphTicker['companyProfile']['weburl']} target="_blank">
                        <img className="logo" src={p.graphTicker['companyProfile']['logo']} alt={p.ticker} title={p.ticker + "'s website"}></img>
                    </a>  
                    {animatedPriceTop}
                    <ExpandButton isPos={isPos} onClick={() => {
                            p.expand_d({name: p.ticker, expanded: false});
                            p.moveMeasurement({name: p.ticker, measurements: {
                                    'Price': true,
                                    'sma': false,
                                    'ML': false,
                                    'wma': false,
                                    'roc': false,
                                    'rsi': false,
                                    'momentum': false,
                                }})
                            p.newsExpand_d({name: p.ticker, expanded: false})}}>
                        <img className="expand_icon" src={Expand_Icon} title="collapse"/>
                    </ExpandButton>
                </div>
            <SimpleBar className='simple-bar-expand' style={{overflowY: props.graphTicker['newsExpanded'] ? 'hidden': 'auto'}}>
                <div className="ChartHeader_Expand" style={{color: isPos  ? 'rgb(20, 202, 20)' : '#DC1C13'}}>

                    {animatedPriceChart}
                    {animatedPercentChangeChart}
                    <div>
                        <h2 id="Measurement" style={{paddingBottom: '8px'}}>Measurement</h2>
                        <MeasurementMenu ticker={p.ticker} graphTicker={p.graphTicker} moveMeasurement={p.moveMeasurement} moveTime={p.moveTime} activeMesurement={activeMeasurement} isPositive={isPos} />
                    </div>
                </div>
                <div className="GraphVisual_Expand">
                    <StockGraph qry_api={p.qry_api} ticker={p.ticker} time={p.graphTicker.time}/>
                </div>
                {buttonCont()}
                <div className="about" style={{paddingBottom: '50px', paddingTop: '50px', color: 'whitesmoke'}}>
                    {fade(<h1>About {p.ticker}</h1>)}
                    {fade(<hr style={{width: '99%', float: 'left'}}></hr>)}
                    {fade(SmartText(p.graphTicker['companyProfile']['description']))}
                </div>
                <div className="stats" style={{display: 'flex', flexDirection: 'column'}}>
                    <div style={{display: 'flex', flexDirection: 'column'}}>
                        {fade(<h1>Stats</h1>)}
                        {fade(<hr style={{width: '99%', float: 'left'}}></hr>)}
                    </div>
                    <div className="statstable" style={{display: 'flex', alignContent: 'center', justifyContent: 'center', paddingTop: '20px'}}>
                        {fade(<StatsTable ticker={p.graphTicker} />)}
                    </div>
                </div>
                <div style={{ display: 'flex', alignSelf:'center', flexDirection:'column', paddingBottom: '50px', color: 'whitesmoke', paddingTop:'50px', width: '99%'}} className="top_stock_news">
                    {fade(<h1>Top News Stories</h1>)}
                    <CompanyNewsTextBox 
                        news={p.graphTicker['news']}
                        ticker={p.ticker}
                        isPositive={isPos}
                    />
                </div>
                <div className="buyHold" style={{paddingBottom: '50px', paddingTop: '50px', color: 'whitesmoke'}}>
                    {fade(<h1>Buy Hold</h1>)}
                    <hr style={{width: '99%', float: 'left'}}></hr>
                    {fade(
                    <div style={{ display:'flex', alignSelf:'center', flexDirection: 'row', paddingLeft: '20px', justifyContent: 'space-evenly', height: '60vh', width: '99%'}}>
                        <div style={{ display: 'flex', flexDirection: 'column', height: '95%', width: '20vw'}}>
                            <BuyHoldCircle ticker={p.ticker} />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', height: 'inherit', width: '73vw'}}> 
                            <BuyHoldGraph ticker={p.ticker} />
                        </div>
                    </div>
                    )}
                    <hr style={{width: '99%', float: 'left'}}></hr>
                </div>
                {fade(<h1 style={{color: 'whitesmoke'}}>Earning Calendar</h1>)}
                <hr style={{width: '99%', float: 'left', color: 'whitesmoke'}}></hr>
                <div className="earnings" style={{paddingBottom: '50px', display: 'flex', justifyContent: 'center', height:'100%', width:'99%', paddingTop: '50px'}}>                    
                    {fade(<div style={{ display:'flex', alignSelf:'center', paddingBottom: '100px', height: '60vh', width: '98vw'}}>
                        <EarningsGraph ticker={p.ticker} />
                    </div>)}
                </div>
            </SimpleBar>
        </div>
    )
}


export default ChartExpanded;