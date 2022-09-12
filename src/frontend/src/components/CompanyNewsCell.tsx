import React from "react";
import useCollapse from 'react-collapsed';
import styled, {css} from 'styled-components';

interface NewsCellProps {
    headline: string,
    summary: string,
    source: string,
    image: string,
    url: string,
    time: Date,
    isPositive: boolean,
}

export function showDate(s:Date):string{
    const now = new Date();
    
    const diff_ms:number = Math.abs(+(s) - +(now));
    const diff_mins: number = Math.floor((diff_ms / (1000 * 60)));
    const diff_hours: number = Math.floor((diff_ms / (1000 * 60 * 60)));
    const diff_days:number = Math.floor((diff_ms / (1000 * 60 * 60 * 24)));

    if (diff_mins < 60){
        if (diff_mins == 0){
            return '1 minute ago';
        }
        else {
            return diff_mins + ' minute ago';
        }
    }
    else if (diff_hours < 48){
        if (diff_hours == 1){
            return diff_hours + ' hour ago';
        }
        else {
            return diff_hours + ' hours ago';
        }
    }
    else {
        return diff_days + ' days ago';
    }

}

export const NewsHeadline = styled.div`
        h2 {
            transition: all 500ms;
        }
        &:hover {
            font-size:120%;
            font-size-adjust: 20px;
        }`

export const ArticleLink = styled.h2`
        color: white;
        &:hover {
            color: green;
            cursor: pointer;
            transition: all 0.3s ease;
        }`

const CompanyNewsCell = (props: NewsCellProps):JSX.Element => {

    const { getCollapseProps, getToggleProps, isExpanded } = useCollapse();

    return (
        <div key={'newscell'} className="NewsCell" style={{ padding: '20px 20px'}}>
            <NewsHeadline className="NewsHeader" {...getToggleProps()} style={{cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'left'}}>
                <div style={{display: 'inline-block'}}>
                    <h1 style={{display:'inline-block', color: 'white', paddingRight: '20px', fontSize: 'calc(8px + 2vh)'}}>{props.source}</h1>
                    <h3 style={{display: 'inline-block', color: 'lightgray', fontStyle:'italic', fontSize: 'calc(5px + 2vh)'}}>{showDate(props.time)}</h3>
                </div>
                <div style={{display: 'flex', height: 'inherit', alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between'}}>
                    <h2 style={{fontWeight: 'bolder'}}>{props.headline}</h2>
                    <img style={{maxHeight: 'calc(125px + 4vh)'}} className="newsSplash" src={props.image}></img>
                </div>
            </NewsHeadline>
            <div className="SummaryWrapper" {...getCollapseProps()}>
                <div style={{display: 'flex', flexDirection: 'column', alignItems: 'left', paddingTop: '30px'}}>
                    {props.url != '' ? 
                        <div className="newsUrl" style={{textAlign: 'center', color: 'whitesmoke'}}>
                            <a href={props.url} target="_blank" style={{textDecoration: 'none'}}>
                                <ArticleLink>Full Article</ArticleLink>
                            </a>
                        </div> 
                    : <></>
                    }
                    <div className="Summary" style={{paddingTop: '20px'}}>
                        <p>{props.summary}</p>
                    </div>
                </div>
            </div>
        </div>
    )
}


export default CompanyNewsCell;