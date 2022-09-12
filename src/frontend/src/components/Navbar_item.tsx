import React from "react";
import '../styles/navbar.css';
import { 
    Settings_icon,
    News_icon,
    Home_icon,
    Search_icon,
    Chart_icon
} from '../images/all_images'
import { useAppDispatch } from '../redux/hooks'
import { switch_page } from "../redux/reducers/navigation";
import { set_expanded, set_time, set_newsExpanded, set_measurement } from "../redux/reducers/ChartUI";
import { connect, ConnectedProps } from 'react-redux'
import { RootState } from "../redux/store";
import { supported_stocks } from '../supported_stocks';
import { moveSort } from "../redux/reducers/HomePageReducer";

// hold some prop variables to pass in during instantiation of component
interface navbar_additional_props {
    name: string
    isWhite: boolean
}

// pass in the rootstate, gather variables needed from the redux store
const mapState = (state: RootState) => ({
    page: state.navigation.page,
    tickers: state.ChartUI.ticker,
    isExpanded: state.ChartUI.isExpanded
})

// state any actions desired to be dispatched
const mapDispatch = {
    move_page: switch_page,
    move_expanded: set_expanded,
    move_time: set_time,
    move_measurement: set_measurement,
    move_sort: moveSort,
    move_newsExpanded: set_newsExpanded
}

// grab the props from redux. leave either arg blank if not needed
const connector = connect(mapState, mapDispatch)
type PropsFromRedux = ConnectedProps<typeof connector>

// do this to provided both props from redux and additional props
type Navbar_ItemProps = PropsFromRedux & navbar_additional_props

/* This element simply returns a desired item to be placed in the navbar.
   Currently, there is a home, news, search, charts, and settings navbar item.
*/
const Navbar_item = (props: Navbar_ItemProps):JSX.Element => {
    const p = props;

    /* use this dispatcher hook to perform a redux action */
    const dispatch = useAppDispatch()

    const white_filter = 'invert(100%) sepia(2%) saturate(216%) hue-rotate(238deg) brightness(225%) contrast(100%)'
    
    const src_img = p.name == 'Home' ? Home_icon :
                    p.name == 'News' ? News_icon :
                    p.name == 'Search' ? Search_icon :
                    p.name == 'Charts' ? Chart_icon :
                    p.name == 'Settings' ? Settings_icon : ''

    /* for now, simply return an icon to be placed in the navbar.
       clicking the icon dispatches the move page redux action.
       the current page the user is on can be accessed via 
       the state.navigation.page redux variable */
    return (
        <div className={`navbar_${p.name}`} style={{height: 'inherit'}}>
            <img 
                style={{filter: p.isWhite ? white_filter : '', height: 'inherit'}} 
                title={p.name} 
                className={`${p.name}_icon`} 
                src={src_img} 
                onClick={() => {
                    dispatch(p.move_page(`${p.name}`));

                    supported_stocks.map((ticker) => {
                        if (p.tickers[ticker].time !== '-364d'){
                            dispatch(p.move_time({name: ticker, time: '-364d'}));
                        }

                        if (p.tickers[ticker].newsExpanded){
                            dispatch(p.move_newsExpanded({name: ticker, expanded: false}));
                        }

                        if (p.tickers[ticker].measurements.Price != true){
                            dispatch(p.move_measurement({name: ticker, measurements: {
                                'Price': true,
                                'sma': false,
                                'ML': false,
                                'wma': false,
                                'roc': false,
                                'rsi': false,
                                'momentum': false,
                            }}))
                        }

                        if (p.tickers[ticker].expanded){
                            dispatch(p.move_expanded({name: ticker, expanded: false}));
                        }

                        dispatch(p.move_sort({
                            yearlyMovers: false,
                            dailyMovers: false,
                            mostExpensive: true,
                            mostPopular: false,
                        }))
                    })
                }} 
                alt={p.name}
            />
        </div>
    );
}

export default connector(Navbar_item);