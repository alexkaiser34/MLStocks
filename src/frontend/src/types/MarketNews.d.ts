import React from "react";



export interface MarketNewsData {
    headline: string,
    summary: string,
    source: string,
    image: string,
    url: string,
    category:string,
    time: string,
}

export interface MarketNewsPts {
    headline: string[],
    summary: string[],
    source: string[],
    image: string[],
    url: string[],
    category: string[],
    time: string[]   
}