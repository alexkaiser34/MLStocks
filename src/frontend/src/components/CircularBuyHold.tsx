import React from "react";
import { CircularProgressbar } from "react-circular-progressbar";
import { specBuyHold } from "../redux/reducers/ChartUI";
import { connect, ConnectedProps } from 'react-redux'
import { RootState } from "../redux/store";

interface buyHoldProps{
    ticker:string,
};

const mapState = (state: RootState,   ownProps: buyHoldProps) => ({
    graph_buyHold: specBuyHold(state, ownProps.ticker)
  });
  
const connector = connect(mapState);

type PropsFromRedux = ConnectedProps<typeof connector>;



const BuyHoldCircle = (props:PropsFromRedux & buyHoldProps):JSX.Element => {
    const p = props;

    const decide_color = (p:number):string => {
        let res: string = '';
        
        if (p <= 0.2){
            res = '#FF0500';
        }
        else if (p > 0.2 && p <= 0.4) {
            res = '#FF4F4B';
        }
        else if (p > 0.4 && p <= 0.6) {
            res = '#FFCD01';
        }
        else if (p > 0.6 && p <= 0.8) {
            res = '#83f28f';
        }   
        else {
            res = '#00ab41';
        }
        return res;
    }

    const calc_percentage = ():string => {
        const strongSellWeight  = p.graph_buyHold.strongsell * 1;
        const sellWeight = p.graph_buyHold.sell * 0.5;
        const holdWeight = p.graph_buyHold.hold * 0.5;
        const buyWeight = p.graph_buyHold.buy * 0.5;
        const strongBuyWeight = p.graph_buyHold.strongbuy * 1;

        const per = ((((0.5*holdWeight) + buyWeight + strongBuyWeight - strongSellWeight - sellWeight) / (holdWeight + buyWeight + strongBuyWeight + sellWeight + strongSellWeight))*100).toFixed(2);

        return per;
    }
    
    const percentage = calc_percentage();
    
    return (
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: 'inherit', width: 'inherit' }}>
            <h1 style={{color: decide_color(Number(percentage) / 100), fontSize: '2vw'}}>Buy Reccomendation</h1>
            <CircularProgressbar 
                value={Number(percentage)}
                text={percentage + "%"}
                styles={{
                    root: {
                        verticalAlign: 'middle',
                        width: '100%'
                    },
                    path: {
                      stroke: decide_color(Number(percentage) / 100),
                      strokeLinecap: 'round',
                      transition: 'stroke-dashoffset 0.5s ease 0s',
                      transformOrigin: 'center center',
                    },
                    trail: {
                      stroke: '#d6d6d6',
                      strokeLinecap: 'round',
                      transformOrigin: 'center center',
                    },
                    text: {
                        fill: decide_color(Number(percentage) / 100),
                        textAnchor:'middle',
                        dominantBaseline: 'middle',
                        fontSize: '13px',
                    },
                    background: {
                      fill: 'transparent',
                    },
                  }} 
                />
        </div>
    )


}


export default connector(BuyHoldCircle);