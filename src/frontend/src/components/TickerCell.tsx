import React, { useEffect, useState } from "react";
import { TickerData } from "../redux/reducers/ChartUI";
import { Button } from '@mui/material';
import AnimatedNumbers from "react-animated-numbers";
import { sortingOptions } from "../types/HomePage";



interface TickerCellProps{
    ticker: string,
    set_expanded: any,
    sortSelected: sortingOptions,
    graphTicker: TickerData
}

export const TickerCell = (props:TickerCellProps):JSX.Element => {

    const [resize, setResize] = useState({ width: 0, height: 0 });

    /** update animated numbers on resize */
    useEffect(() => {
        window.addEventListener('resize', updateDimensions);

        return function(){
            window.removeEventListener('resize', updateDimensions);
        }
    }, []);


    const sortValueDisplay = ():JSX.Element => {

        const headerTitle:string = props.sortSelected == 'dailyMovers' ? 'Daily Change' :
            props.sortSelected == 'yearlyMovers' ? 'Yearly Change' : 
            'Stock Volume';

        const value:string = props.sortSelected == 'dailyMovers' ? props.graphTicker.dailyChange + ' %' :
            props.sortSelected == 'yearlyMovers' ? props.graphTicker.yearlyChange + ' %' : 
            props.sortSelected == 'mostPopular' ?  Math.abs(Number(props.graphTicker.financials.Volume) / 1000000).toFixed(2) + " M" :
            '$ ' + props.graphTicker.currentValues.Price.value;

        return (
            <div style={{display: props.sortSelected == 'mostExpensive' ? 'none' : 'inline-block', position: 'sticky', left: '64%' }}>
                <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
                    <h2>{headerTitle}</h2>
                    <h3 style={{marginTop: '-1.5vh', color: DecideColor()}}>{value}</h3>

                </div>
            </div>
        )
    }

    const updateDimensions = () => {
        setResize({ width: window.innerWidth, height: window.innerHeight });
    };



    const AnimatedPrice = ():JSX.Element => {
    
        return (
            <AnimatedNumbers
                    animateToNumber={Number(props.graphTicker.currentValues.Price.value)}
                    fontStyle={{fontWeight: 'bolder', fontSize: 'calc(8px + 1vh)'}}
            ></AnimatedNumbers>
        )
    }

    

    const animatedPrice = React.useMemo(() => AnimatedPrice(), [props.graphTicker.currentValues.Price.value, resize]);

    const DecideColor = ():string => {
        const positiveColor:string = 'green';
        const negativeColor:string = 'red';

        switch(props.sortSelected){
            case 'dailyMovers':
                return Number(props.graphTicker.dailyChange) >= 0 ? positiveColor : negativeColor;
            case 'yearlyMovers':
                return Number(props.graphTicker.yearlyChange) >= 0 ? positiveColor : negativeColor;
            case 'mostPopular':
                return positiveColor;
            case 'mostExpensive':
                return negativeColor;
            default:
                return positiveColor;
        } 

    }

    return(
        <div key={props.ticker + ' tickerCell'} style={{width: '100%', height: '100%', paddingBottom: '25px', color: 'lightgray'}}>

            <Button variant='outlined' onClick={() => {
                props.set_expanded({
                    name: props.ticker,
                    expanded: true,
                });
            }}
            style={{
                backgroundColor: 'black',
                borderColor: DecideColor(),
                width: '100%',
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between'
            }}>
                <div key={props.ticker + 'tickerCell1'} style={{
                    color: 'lightgray',
                    display: 'flex',
                    alignItems: 'center',
                    justifyItems:'center',
                    textAlign: 'center',
                    width: '100%'
                    }}>
                    <div  key={props.ticker + 'tickerCell2'} style={{display: 'inline-block', left: '0%', position: 'sticky'}}>
                        <h1>{props.ticker}</h1>

                    </div>
                    <div key={props.ticker + 'tickerCell3'} style={{display: 'inline-block', position: 'sticky', left: props.sortSelected == 'mostExpensive' ? '30%' : '17%'}}>
                        <h2 style={{fontSize: 'calc(6px + 1vh)'}}>{props.graphTicker.companyProfile.name}</h2>
                    </div>
                    <div key={props.ticker + 'tickerCell4'} style={{display: 'inline-block', position: 'sticky', left: props.sortSelected == 'mostExpensive' ? '63%' : '45%' }}>
                    <img style={{
                        maxHeight: '60px',
                        height: '7vh',
                    }} key={'img_home' + props.ticker} className="logo_home" src={props.graphTicker.companyProfile.logo} alt={props.ticker} title={props.ticker}></img>
                    </div>
                    {sortValueDisplay()}
                    <div key={props.ticker + 'tickerCell5'} style={{display: 'inline-block', position: 'sticky', left: '90%' }}>
                        <div key={props.ticker + 'tickerCell6'} style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
                            <h1 style={{fontSize: 'calc(10px + 1vh)'}}>Price</h1>
                            <div key={props.ticker + 'tickerCell7'} style={{ marginTop: '-1.5vh', display: 'flex', flexDirection: 'row', alignItems: 'center', color: DecideColor()}}>
                                <h2 style={{paddingRight: '3px', fontSize: 'calc(8px + 1vh)'}}>$</h2>
                                {animatedPrice}

                            </div>
                        </div>

                    </div>
                </div>
            </Button>
        </div>

    )
}