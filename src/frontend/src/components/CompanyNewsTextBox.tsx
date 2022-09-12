import React from "react";
import { set_newsExpanded, specGraphTicker} from '../redux/reducers/ChartUI';
import SimpleBar from "simplebar-react";
import '../styles/NewsTable.css';
import CompanyNewsCell from './CompanyNewsCell';
import { connect, ConnectedProps } from 'react-redux'
import { RootState } from "../redux/store";
import { CSSProperties } from 'styled-components';
import '../styles/NewsTable.css';
import { fade } from './AnimationComps';
import { CompanyNewsData } from '../types/QueryHelperTypes';

interface NewsTextBoxProps {
    news: CompanyNewsData[],
    isPositive: boolean,
    ticker: string,
}

const mapState = (state: RootState,   ownProps: NewsTextBoxProps) => ({
    graph_time: specGraphTicker(state, ownProps.ticker)
  });
  
const mapDispatch = {
    move_news_expanded: set_newsExpanded,
}

const connector = connect(mapState,mapDispatch);

type PropsFromRedux = ConnectedProps<typeof connector>;

const CompanyNewsTextBox = (props: NewsTextBoxProps & PropsFromRedux):JSX.Element => {

    const NewsTableStyle:CSSProperties = {
                height: props.graph_time.newsExpanded ? '' : '90vh',
                position: props.graph_time.newsExpanded ? 'fixed': 'relative',
                top: props.graph_time.newsExpanded ? 'calc(13vh)' : '',
                zIndex: props.graph_time.newsExpanded ? '10000' : '',
                bottom: props.graph_time.newsExpanded ? '10vh' : '',
                paddingBottom: props.graph_time.newsExpanded ? '12vh' : '',
                paddingTop: props.graph_time.newsExpanded ? '20px' : '',
                backgroundColor: 'black',
    }


    return (
        <div key={'newsTable ' + props.ticker} className="NewsTable" style={NewsTableStyle}>
            <div key={'wrappertable' + props.ticker} style={{
                visibility: !props.graph_time.newsExpanded ? 'hidden': 'visible',
                width: 'inherit',
                paddingBottom: '20px',
                display: 'flex',
                borderBottom: props.isPositive ? '4px solid rgb(20, 202, 20)' : '4px solid #DC1C13',
                alignItems: 'center',
                alignContent: 'center',
                justifyContent: 'space-between',
                height: !props.graph_time.newsExpanded ? '0%' : '6vh'
                }}>

                <h1 style={{
                    visibility: props.graph_time.newsExpanded ? 'visible' : 'hidden',
                    display: 'flex',
                    fontSize: 'calc(9px + 3vh)',
                    paddingLeft: '20px',
                    }}>
                    Top News Stories for {props.ticker}
                </h1>
                <button key={'companyButton' + props.ticker} className="ReadMore" disabled={!props.graph_time.newsExpanded}
                    onClick={() => {
                        props.move_news_expanded({
                            name: props.ticker,
                            expanded: false
                        });
                    }}
                    style={{
                        color: props.isPositive ? 'rgb(20, 202, 20)' : '#DC1C13',
                        visibility: !props.graph_time.newsExpanded ? 'hidden': 'visible',
                        backgroundColor: 'transparent',
                        outline: props.isPositive ? '2px solid rgb(20, 202, 20)' : '2px solid #DC1C13',
                        borderRadius: '10px',
                        border: 'none',
                        display: 'flex',
                        fontSize: 'calc(5px + 2vh)',
                        fontWeight: 'bolder',
                        padding: '10px 10px',
                        marginRight: '20px',
                    }}>
                    Back
                </button>
            </div>
            <SimpleBar key={'companySimple'+ props.ticker} className="TableSimplebar" style={{
                overflow: props.graph_time.newsExpanded ? 'auto' : 'hidden',
                height: props.graph_time.newsExpanded ? '100%' : 'inherit'
                }}>
                {props.news.map((o:CompanyNewsData) => {
                    return o.headline != '' || o.summary != '' ? (
                        fade(
                            <div key={`News_company_${o.headline}`}>
                                <CompanyNewsCell 
                                    headline={o.headline}
                                    summary={o.summary}
                                    source={o.source}
                                    image={o.image}
                                    url={o.url}
                                    time={new Date(o.time)} 
                                    isPositive={props.isPositive}
                                />
                                <hr style={{
                                    display: 'flex',
                                    alignSelf: 'center',
                                    width: '98%',
                                    border: '3px solid rgb(61, 61, 61)',
                                    borderRadius: '10px'
                                }}>
                                </hr>
                            </div>
                        )
                    ) : 
                    <></>
                })}
            </SimpleBar>
            <button key={'readmorecompany' + props.ticker} className="ReadMore" disabled={props.graph_time.newsExpanded}
                onClick={() => {
                    props.move_news_expanded({
                        name: props.ticker,
                        expanded: true
                    });
                }}
                style={{
                    color: props.isPositive ? 'rgb(20, 202, 20)' : '#DC1C13',
                    visibility: props.graph_time.newsExpanded ? 'hidden': 'visible',
                    backgroundColor: 'transparent',
                    border: 'none',
                    borderRadius: '10px',
                    outline: props.isPositive ? '2px solid rgb(20, 202, 20)' : '2px solid #DC1C13',
                    display: 'flex',
                    fontSize: 'calc(7px + 2vh)',
                    fontWeight: 'bolder',
                    marginTop: '20px',
                    padding: '10px 10px'
                }}>
                Read More!
            </button>
        </div>
    )
}


export default connector(CompanyNewsTextBox);