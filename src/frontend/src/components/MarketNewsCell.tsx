import React from "react";
import { MarketNewsData } from "../types/MarketNews";
import useCollapse from 'react-collapsed';
import { NewsHeadline, ArticleLink, showDate } from './CompanyNewsCell';

interface MarketNewsCellProps {
    newsData: MarketNewsData
}
const MarketNewsCell = (props:MarketNewsCellProps):JSX.Element => {
    
    const { getCollapseProps, getToggleProps, isExpanded } = useCollapse();

    
    return props.newsData.headline !== '' ? (
        
        <div key={'marketNewsCell ' + props.newsData.headline} className="MarketNewsCell" style={{ padding: '20px 20px'}}>
            <NewsHeadline className="MarketNewsHeader" {...getToggleProps()} style={{cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'left'}}>
                <div style={{display: 'flex', alignContent: 'center', justifyContent: 'space-between'}}>
                    <h1 style={{  color: 'white', paddingRight: '20px', fontSize: 'calc(8px + 2vh)'}}>{props.newsData.source}</h1>
                    <h3 style={{ color:'gray', fontSize: 'calc(5px + 2vh)'}}>{props.newsData.category}</h3>
                    <h3 style={{ color: 'lightgray', fontStyle:'italic', fontSize: 'calc(5px + 2vh)'}}>{showDate(new Date(props.newsData.time))}</h3>
                </div>
                <div style={{display: 'flex', height: 'inherit', alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between'}}>
                    <h2 style={{fontWeight: 'bolder'}}>{props.newsData.headline}</h2>
                    <img style={{maxHeight: 'calc(125px + 4vh)'}} className="newsSplash" src={props.newsData.image}></img>
                </div>
            </NewsHeadline>
            <div className="SummaryWrapper" {...getCollapseProps()}>
                <div style={{display: 'flex', flexDirection: 'column', alignItems: 'left', paddingTop: '30px'}}>
                    {props.newsData.url != '' ? 
                        <div className="newsUrl" style={{textAlign: 'center', color: 'whitesmoke'}}>
                            <a href={props.newsData.url} target="_blank" style={{textDecoration: 'none'}}>
                                <ArticleLink>Full Article</ArticleLink>
                            </a>
                        </div> 
                    : <></>
                    }
                    <div className="Summary" style={{paddingTop: '20px'}}>
                        <p>{props.newsData.summary}</p>
                    </div>
                </div>
            </div>
            <div style={{paddingTop: '20px'}}>
                <hr style={{borderBottom: '5px solid gray', borderRadius: '10px'}}></hr>
            </div>
        </div>
    ) : <></>
}


export default MarketNewsCell;