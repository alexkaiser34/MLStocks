import React from "react";
import { TickerData } from "../redux/reducers/ChartUI";


interface StatsTableProps{
    ticker: TickerData
}


export const StatsTable = (props: StatsTableProps):JSX.Element => {
    
    return(
        <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            columnGap: '40px',
            paddingRight: '20px',
            }}>

            
            {Object.entries(props.ticker.financials).map(([key, value]) => {   
                return(
                    <div key={key + ' wrapper'}style={{display: 'flex', flexDirection: 'column', width:'48vw'}}>
                        <div key={key} className="key" style={{display: 'flex', flexDirection: 'row', justifyContent: 'space-between'}}>
                            <h3 style={{color: 'gray', marginTop: '20px', paddingLeft: '10px'}}>{key}</h3>
                            <h1 style={{color: 'white', paddingRight: '20px', fontSize: 'calc(14px + 1vh)', marginTop: '20px'}}>{
                                value == 0 ? '--' :
                                Number.isNaN(Number(value)) ? value :
                                key == 'Volume' ? Math.abs(Number(value) / 1000000).toFixed(2) + " M" :
                                Number(value).toFixed(2)
                            }</h1>
                        </div>
                        <div>
                        <hr style={{width: '98%', border: '2px dotted gray', opacity: '.5'}}></hr>
                        </div>
                    </div>
                )
                })
            }
        </div>
    )
}