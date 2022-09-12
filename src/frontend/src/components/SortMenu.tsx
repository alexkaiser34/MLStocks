import React from "react";
import Menu from '@mui/material/Menu';
import { Button } from '@mui/material';
import MenuItem from '@mui/material/MenuItem';
import { connect, ConnectedProps } from 'react-redux'
import { RootState } from "../redux/store";
import { moveSort } from "../redux/reducers/HomePageReducer";
import { sortingOptions, sortOps } from "../types/HomePage";


const mapState = (state: RootState) => ({
    currentSort: state.HomePageReducer.sortingOps
});
  
const mapDispatch = {
    move_sort: moveSort
}
const connector = connect(mapState, mapDispatch);

type PropsFromRedux = ConnectedProps<typeof connector>;

const SortMenu = (props: PropsFromRedux):JSX.Element => {
    
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
      };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const dispathSort = (s:sortingOptions):sortOps => {

        return ( {
            mostExpensive: s == 'mostExpensive' ? true : false,
            mostPopular: s == 'mostPopular' ? true : false,
            yearlyMovers: s == 'yearlyMovers' ? true : false,
            dailyMovers: s == 'dailyMovers' ? true : false,

        } )
    }

    const nameCleanUp = (s:sortingOptions):string => {
        switch(s){
            case 'mostExpensive':
                return 'Most Expensive';
            case 'mostPopular':
                return 'Most Popular';
            case 'yearlyMovers':
                return 'Yearly Movers';
            case 'dailyMovers':
                return 'Daily Movers';
            default:
                return '';
        }
    }

    const getActiveSort = ():sortingOptions => {
        let active:sortingOptions = 'dailyMovers';
        Object.entries(props.currentSort).map(([key,value]) => {
            if (value == true)
            {
                active = key as sortingOptions;
            }
        })
    
        return active;
    }
    

    // const memoizedMenu = React.useMemo(() => MenuComponent(props), [props.graphTicker.measurements])

    // return React.useMemo(() => {
        return(
        <div className="SortMenu" style={{zIndex: 10000000000}}>
            <Button style={{
                borderColor: '#08eb08',
                color: '#08eb08',
            }} variant="outlined" onClick={handleClick} className='SortButton'>
                {nameCleanUp(getActiveSort())}
            </Button>
            <Menu
                anchorEl={anchorEl}
                keepMounted
                open={Boolean(anchorEl)}
                onClose={handleClose}
                className="Menu"
            >
                {Object.entries(props.currentSort).map(([key, value]) => { 
                    return(
                        <MenuItem style={{
                            color: '#08eb08',
                            backgroundColor: 'black'
                        }} className='MeasurementItem' key={key} onClick={() => {
                            props.move_sort(dispathSort(key as sortingOptions));
                            handleClose();
                        }}>{nameCleanUp(key as sortingOptions)}</MenuItem>
                    )
                })}
            </Menu>
        </div>
        )
    // }, [props.graphTicker.measurements])
}


export default connector(SortMenu);