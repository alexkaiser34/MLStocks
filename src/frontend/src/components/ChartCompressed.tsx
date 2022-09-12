import React, { CSSProperties, useEffect, useState } from "react";
import { Expand_Icon } from '../images/all_images'
import StockGraph from "./StockGraph"
import '../styles/ChartCompressed.css'
import { QueryApi } from "@influxdata/influxdb-client";
import styled, {css} from 'styled-components';
import MeasurementMenu from "./MeasurementMenu";
import { TickerData } from "../redux/reducers/ChartUI";
import { AnimatedNumber, getActiveMeasurement } from './MeasurementHelper';

interface compressedProps {
    expand_d: any,
    moveValue: any,
    price: any,
    graphTicker: TickerData,
    ticker: string,
    qry_api: QueryApi,
    moveTime: any,
    moveMeasurement: any,
}

interface isPos{
    isPos: boolean
}

const ExpandButton = styled.button<isPos>`
        &:hover {
            filter: ${(p: isPos) => (p.isPos ? 'invert(44%) sepia(62%) saturate(2837%) hue-rotate(90deg) brightness(134%) contrast(94%)' : 'grayscale(100%) brightness(40%) sepia(100%) hue-rotate(-50deg) saturate(6000%) contrast(0.8)')}
        }`

const ChartCompressed = (props: compressedProps):JSX.Element => {

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

    const buttonStyle = (s: string):CSSProperties => {
        return(
        {
            backgroundColor: p.graphTicker['time'] == s && isPos ? 'rgb(100, 99, 97)' :
                    p.graphTicker['time'] == s && !isPos ? 'rgb(167, 165, 161)' : 'black',
            color: isPos  ? 'rgb(20, 202, 20)' : '#DC1C13',
            fontWeight: 'bolder',
            fontFamily:'sans-serif'
        }
        )

    }
    
    /** adjust the buttons if we are displaying machine learning */
    const buttonCont = ():JSX.Element => {
        return activeMeasurement != 'ML' ?
        (
        <div className="btns" >
            <button style={buttonStyle('-1h')} onClick={() => p.moveTime({name: p.ticker, time: '-1h'})}>1 H</button>
            <button style={buttonStyle('-1d')} onClick={() => p.moveTime({name: p.ticker, time: '-1d'})}>1 D</button>
            <button style={buttonStyle('-31d')} onClick={() => p.moveTime({name: p.ticker, time: '-31d'})}>1 M</button>
            <button style={buttonStyle('-364d')} onClick={() => p.moveTime({name: p.ticker, time: '-364d'})}>1 Y</button>
        </div>
        ) : (
        <div className="btns">
            <button style={buttonStyle('10d')} onClick={() => p.moveTime({name: p.ticker, time: '10d'})}>10 D</button>
            <button style={buttonStyle('30d')} onClick={() => p.moveTime({name: p.ticker, time: '30d'})}>30 D</button>
            <button style={buttonStyle('60d')} onClick={() => p.moveTime({name: p.ticker, time: '60d'})}>60 D</button>
            <button style={buttonStyle('180d')} onClick={() => p.moveTime({name: p.ticker, time: '180d'})}>180 D</button>
        </div>
        )
    }

    const animatedPriceChart = React.useMemo(() => AnimatedNumber(props.graphTicker,false, 'cp', isPos, activeMeasurement), [props.graphTicker.currentValues[activeMeasurement].value, isPos, resize]);
    const animatedPercentChangeChart = React.useMemo(() => AnimatedNumber(props.graphTicker,false, 'percent', isPos, activeMeasurement), [props.graphTicker.currentValues[activeMeasurement].percentChange, isPos, resize]);
    
    return(
        <div className="StockChart_Component" 
            style={{ borderStyle: 'solid', borderColor: isPos ? 'rgb(20, 202, 20)' : '#DC1C13', borderRadius: '20px'}}> 
            <div className="ChartHeader" 
                style={{ color: isPos ? 'rgb(20, 202, 20)' : '#DC1C13'}}>
                <div className="ticker_button">
                    <h1>{p.ticker}</h1>
                    <h2>{p.graphTicker.companyProfile.name}</h2>
                    <ExpandButton isPos={isPos}
                        onClick={() => {
                            p.expand_d({name: p.ticker, expanded: true});
                        }}>
                        <img src={Expand_Icon} title="expand" />
                    </ExpandButton>
                </div>
                <div className="header_labels">
                    {animatedPriceChart} 
                    {animatedPercentChangeChart}
                    <div>
                        <h2 id="Measurement" style={{paddingBottom: '8px'}}>Measurement</h2>
                        <MeasurementMenu ticker={p.ticker} graphTicker={p.graphTicker} moveMeasurement={p.moveMeasurement} moveTime={p.moveTime} activeMesurement={activeMeasurement} isPositive={isPos} />
                    </div>
                </div>
            </div>
            <div className="GraphVisual">
                <StockGraph qry_api={p.qry_api} ticker={p.ticker} time={p.graphTicker.time}/>
            </div>
            {buttonCont()}
                
        </div>
    )
}

export default ChartCompressed;