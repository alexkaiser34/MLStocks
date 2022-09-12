
import React from "react";
import { MeasurementOps } from "../types/ChartUI_Actions";
import { CompanyMeasurements } from "../types/QueryHelperTypes";
import { TickerData } from "../redux/reducers/ChartUI";
import AnimatedNumbers from "react-animated-numbers";


export function getActiveMeasurement(measurements: CompanyMeasurements ):MeasurementOps{

    let active: MeasurementOps = 'Price';
    Object.entries(measurements).map(([key,value]) => {
        if (value == true)
        {
            active = key as MeasurementOps;
        }
    })

    return active;

}

export interface fullNames{
    'sma': string,
    'wma': string,
    'momentum': string,
    'Price': string,
    'roc': string,
    'rsi': string,
    'ML': string,
}

export function getFullName(
    measurements: CompanyMeasurements,
    measurement?: MeasurementOps
    ):fullNames{

    const full:fullNames = {
        'sma': 'Simple Moving Average',
        'wma': 'Weighted Moving Average',
        'momentum': 'Momentum',
        'Price': 'Price',
        'roc': 'Rate of Change',
        'rsi': 'Relative Strength Index',
        'ML': 'Machine Learning'
        
    }

    // if (measurement != undefined) {
    //     let measure:string = '';
    //     Object.entries(full).map(([key,value]) => {
    //         if (key == measurement)
    //         {
    //             measure = value;
    //         }
    //     })
    //     return measure;
    // }

    return full;

}

export const DisplayPercentChange = (graphTicker: TickerData):JSX.Element => {

    const activeMeasurement = getActiveMeasurement(graphTicker.measurements);
    const headerTitle:string = (activeMeasurement == 'roc' || activeMeasurement == 'rsi' || activeMeasurement == 'momentum') ?
    'Difference over Period' : 'Percent Change';

    const headerValue:string = (activeMeasurement == 'rsi' || activeMeasurement == 'momentum') ?
        graphTicker.currentValues[activeMeasurement].percentChange :
        graphTicker.currentValues[activeMeasurement].percentChange + ' %';

    return (
        <h2>{headerTitle}</h2>
    )
}

export const DisplayCurrentValue = (graphTicker: TickerData):JSX.Element => {
    const activeMeasurement = getActiveMeasurement(graphTicker.measurements);
    const full:fullNames = getFullName(graphTicker.measurements);

    const headerValue: string = (activeMeasurement == 'rsi' || activeMeasurement == 'momentum') ?
        graphTicker.currentValues[activeMeasurement].value :
        (activeMeasurement == 'roc') ? 
        graphTicker.currentValues[activeMeasurement].value + ' %' :
        '$ '  + graphTicker.currentValues[activeMeasurement].value;

    const timeLabel: string = graphTicker.time == '10d' ? '10 Day' : 
        graphTicker.time == '30d' ? '30 Day' : 
        graphTicker.time == '60d' ? '60 Day' :
        graphTicker.time == '180d' ? '180 Day' : '';

    return activeMeasurement != 'ML' ?  (
            <h2>Current {full[activeMeasurement]}</h2>
    ) : (
        <h2>{timeLabel} Prediction</h2>
    )
}

export const AnimatedNumber = (
    props:TickerData,
    onTop: boolean,
    stat: string,
    isPos: boolean,
    activeMeasurement: MeasurementOps
    ):JSX.Element => {

    return onTop ? (
        <div style={{display: 'inline-block'}}>
            <h3 style={{display: 'inline-block', paddingRight: '20px', fontSize: '3vh'}}>Price: </h3>
            <h3 style={{display: stat != 'cp' ? 'none' : 'inline-block', fontSize: '3vh', color: isPos  ? 'rgb(20, 202, 20)' : '#DC1C13', paddingRight: '5px'}}>$ </h3>
            <div style={{display: 'inline-block'}}>
            <AnimatedNumbers
                    animateToNumber={Number(props.currentValues['Price'].value)}
                    fontStyle={{ fontSize: '3vh', fontWeight: 'bolder', color: isPos  ? 'rgb(20, 202, 20)' : '#DC1C13'  }}
                ></AnimatedNumbers>
                </div>
                </div>
    ) : (
        <div>
            {stat == 'cp' ? DisplayCurrentValue(props) : DisplayPercentChange(props)}
            <div style={{display: 'inline-block',  marginTop: '-1vh'}}>
            {stat == 'cp' && activeMeasurement != 'roc' && activeMeasurement != 'momentum' && activeMeasurement != 'rsi' ? <h3 style={{display: 'inline-block', paddingRight: '5px'}}>$</h3> : <></>}
            <div style={{display: 'inline-block'}}>
            <AnimatedNumbers
                    animateToNumber={
                        stat == 'cp' ? Number(props.currentValues[activeMeasurement].value) :
                        Number(props.currentValues[activeMeasurement].percentChange)}
                    fontStyle={{ fontSize: props.expanded ? '2.5vh' : '2vh', fontWeight: 'bolder', color: isPos  ? 'rgb(20, 202, 20)' : '#DC1C13'  }}
                ></AnimatedNumbers>
            </div>
            {stat != 'cp' || activeMeasurement == 'roc' ? <h3 style={{display: 'inline-block', paddingLeft: '5px'}}> %</h3> : <></>}
            </div>

        </div>
    )
}