import React, { useEffect } from "react";
import { connect, ConnectedProps } from 'react-redux'
import { RootState } from "../redux/store";
import { add_news } from '../redux/reducers/MarketNews';
import { Query_API, Query_MarketNews } from "./QueryHelper";
import { QueryApi } from "@influxdata/influxdb-client";
import { MarketNewsData } from "../types/MarketNews";
import MarketNewsCell from "./MarketNewsCell";
import { fade } from './AnimationComps';

interface MarketNewsTextBoxProps {
    qry_api: QueryApi
}

const mapState = (state: RootState) => ({
    news: state.MarketNews.news
});

const mapDispatch = {
    add_news: add_news
}

const connector = connect(mapState, mapDispatch);

type PropsFromRedux = ConnectedProps<typeof connector>


const MarketNewsTextbox = (props:MarketNewsTextBoxProps & PropsFromRedux):JSX.Element => {


    return (
        <div className="MarketNewsBoxTable" style={{
            display: 'flex',
            flexDirection: 'column',
            width: '99%',
            height: '100%',
            color: 'white'
        }}>
            {props.news.map((newsObject:MarketNewsData) => {
                return(
                    <div key={newsObject.headline}>
                    {fade(<MarketNewsCell newsData={newsObject} />)}
                    </div>
                )
            })}
        </div>
    ) 
}

export default connector(MarketNewsTextbox);