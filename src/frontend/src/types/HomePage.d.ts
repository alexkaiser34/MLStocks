import React from "react";


export interface sortOps {
    dailyMovers:boolean,
    yearlyMovers:boolean,
    mostPopular:boolean,
    mostExpensive:boolean
}

export type sortingOptions = 'dailyMovers' | 'yearlyMovers' | 'mostPopular' | 'mostExpensive';

