import React from "react";
import { TickerData } from "../redux/reducers/ChartUI";
import Menu from '@mui/material/Menu';
import { Button } from '@mui/material';
import MenuItem from '@mui/material/MenuItem';
import { MeasurementOps, setMeasurement } from "../types/ChartUI_Actions";
import '../styles/MeasurementMenu.css';
import { getFullName } from "./MeasurementHelper";

interface MeasurementMenuProps {
    graphTicker: TickerData,
    moveMeasurement: any,
    moveTime: any,
    activeMesurement: MeasurementOps,
    ticker: string,
    isPositive: boolean,
}

const MeasurementMenu = (props: MeasurementMenuProps):JSX.Element => {
    
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
      };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const dispatchMeasurement = (s: string):setMeasurement => {
        return {
            name: props.ticker,
            measurements: {
                'sma' : s == 'sma' ? true : false,
                'wma' : s == 'wma' ? true : false,
                'rsi' : s == 'rsi' ? true : false,
                'momentum' : s == 'momentum' ? true : false,
                'roc' : s == 'roc' ? true : false,
                'Price' : s == 'Price' ? true : false,
                'ML' : s == 'ML' ? true : false,
            },
        }
    }
    const full = getFullName(props.graphTicker.measurements);
    

    // const memoizedMenu = React.useMemo(() => MenuComponent(props), [props.graphTicker.measurements])

    // return React.useMemo(() => {
        return(
        <div className="MeasurementMenu" style={{marginTop: '-2vh', zIndex: 10000000000}}>
            <Button style={{
                borderColor: props.isPositive ? 'rgb(20, 202, 20)' : '#DC1C13',
                color: props.isPositive ? 'rgb(20, 202, 20)' : '#DC1C13',
            }} variant="outlined" onClick={handleClick} className='MeasurementButton'>
                {Object.entries(props.graphTicker.measurements).map(([key, value]) => { 
                    if (value == true){
                        return key;
                    }
                })}
            </Button>
            <Menu
                anchorEl={anchorEl}
                keepMounted
                key={'measurement_menu'}
                open={Boolean(anchorEl)}
                onClose={handleClose}
                className="Menu"
            >
                {Object.entries(props.graphTicker.measurements).map(([key, value]) => { 
                    return(
                        <MenuItem style={{
                            color: props.isPositive ? 'rgb(20, 202, 20)' : '#DC1C13',
                            backgroundColor: 'black'
                        }} className='MeasurementItem' key={key} onClick={() => {
                            if (key == 'ML'){
                                props.moveTime(({name: props.ticker, time: '30d'}));
                            }

                            if (props.activeMesurement == 'ML' && key != 'ML'){
                                props.moveTime(({name: props.ticker, time: '-364d'}));
                            }

                            props.moveMeasurement(dispatchMeasurement(key));
                            handleClose();
                        }}>{full[key as MeasurementOps]}</MenuItem>
                    )
                })}
            </Menu>
        </div>
        )
    // }, [props.graphTicker.measurements])
}


export default MeasurementMenu;