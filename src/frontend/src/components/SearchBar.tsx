import React, { useState } from "react";
import { createTheme, TextField, ThemeProvider, Theme, Paper} from "@mui/material";
import { makeStyles } from "@mui/styles";
import { green, purple } from '@mui/material/colors';
import { supported_stocks } from '../supported_stocks';
import { connect, ConnectedProps } from 'react-redux'
import { RootState } from "../redux/store";
import { set_expanded } from '../redux/reducers/ChartUI';
import { Autocomplete } from '@mui/lab';
import '../styles/SearchBar.css';
import SimpleBar from "simplebar-react";
import parse from 'autosuggest-highlight/parse';
import match from 'autosuggest-highlight/match';
import styled, {css} from 'styled-components';



const mapState = (state: RootState) => ({
    tickerObj: state.ChartUI.ticker,
    expanded: state.ChartUI.isExpanded
});
  
const mapDispatch = {
    move_Expanded: set_expanded
}

const connector = connect(mapState,mapDispatch);

type PropsFromRedux = ConnectedProps<typeof connector>;


type SearchData = {
    key: string,
    value: string,

}

const CustomList = styled.li`
        span{
            transition: all 500ms;
            text-align: left;
        }
        &:hover {
            font-size:150%;
            font-size-adjust: 20px;
        }
`

const theme = createTheme({
    palette: {
        primary: {
            main: green[500],
        },
        secondary: {
            main: green[500],
        }
    },
    
})

const useStyles = makeStyles({
    paper: {
      backgroundColor: 'black',
      "&::webkit-scrollbar": {
        display: 'none',
      },
    },
    '@global': {
        '*::-webkit-scrollbar': {
            display: 'none',
        },
    },
    popper: {
        border: '5px solid orange'
    },
    listbox: {
        border: '5px solid yellow'
    },
    root: {
        "& .MuiOutlinedInput": {
            border: '2px solid green'
        },

    }
  });


const SearchBar = (props: PropsFromRedux):JSX.Element => {

    const classes = useStyles();
    const p = props;

    const getData = ():SearchData[] => {
        let finalData:SearchData[] = [];

        supported_stocks.map((ticker) => {
            finalData.push({
                key: ticker,
                value: props.tickerObj[ticker].companyProfile.name
            });
        });

        return finalData;
    }

    const RenderExpandedChart = (s: string) => {
        if (s != ''){
            supported_stocks.map((ticker) => {
                    if (s === ticker){
                        props.move_Expanded({name: ticker, expanded: true});                        
                    }
            })
        }
    }


    return (
        <Autocomplete
            id="Stocks"
            
            onChange={(e, value) => {
                if (value == null){
                    RenderExpandedChart('');
                }
                else {
                    RenderExpandedChart(value.key);
                }
            }}
            fullWidth
            
            classes={{root: classes['@global']}}
            options={getData()}
            getOptionLabel={(option) => option.value + option.key}
            renderInput={(params) =>(
                <ThemeProvider theme={theme}>
                    <TextField
                        {...params}
                        id="searchBox"
                        variant="outlined"
                        fullWidth
                        // focused
                        placeholder="Search for a stock"
                        label="Stock Search"
                        sx={{
                            input: { color: 'white'},
                            label: { 
                                color: 'green',
                            },
                            "& .MuiOutlinedInput-root": {
                                "& fieldset": {
                                    border: '2px solid green',
                                },
                                '&:hover fieldset': {
                                    border: '2px solid green',
                                },
                            },
                            "&:hover .MuiInputLabel-root.Mui-focused": {
                                color: "green",
                            },
                            "&:hover .MuiInputLabel-root": {
                                color: "whitesmoke",
                            },
                        }}
                    />
                </ThemeProvider>
            )}

            renderOption={(props, option, { inputValue }) => {
                const matchesTicker = match(option.key, inputValue);
                const partsTicker = parse(option.key, matchesTicker);
                const matchesName = match(option.value, inputValue);
                const partsName = parse(option.value, matchesName);
                return (
                    <div key={'suggestionsbar' + option.key} className="SuggestionsBar" style={{marginTop: '-10px', marginBottom: '-10px', padding: '10px 10px'}}>
                    <CustomList key={'customlist' + option.key} className="lister" {...props} style={{width: '100%', display: 'flex', flexDirection: 'column'}}>
                        <div key={'suggestionswrapper' + option.key} style={{display: 'inline', width: '100%'}}>

                            <div key={'tickerauto' + option.key} className="CompanyTicker" style={{display: 'inline', float: 'left', left: '0%'}}>
                                {partsTicker.map((part, index) => (
                                    <span
                                    key={index}
                                    style={{
                                        fontWeight: part.highlight ? 'bolder' : 'normal',
                                        color: part.highlight ? 'green' : 'whitesmoke',
                                    }}
                                    >
                                    {part.text}
                                    </span>
                                ))}
                            </div>

                            <div key={'logoauto' + option.key} className="companyLogo" style={{display: 'inline',float: 'left', position: 'sticky', left: '47%'}}>
                                {supported_stocks.map((ticker) => {
                                        if (option.key === ticker){
                                            return (
                                                <img key={'img' + ticker} className="logo" src={p.tickerObj[ticker].companyProfile.logo} alt={ticker} title={ticker}></img>
                                            )
                                        }
                                    })}
                            </div>
                            
                            
                            
                            <div key={'nameauto' + option.key} className="companyName" style={{display: 'inline',float: 'right'}}>
                                {partsName.map((part, index) => (
                                    <span
                                    key={index}
                                    style={{
                                        fontWeight: part.highlight ? 'bolder' : 'normal',
                                        color: part.highlight ? 'green' : 'whitesmoke',
                                    }}
                                    >
                                    {part.text}
                                    </span>
                                ))}
                            </div>
                        </div>
                        <div key={'barauto' + option.key} style={{width: '100%'}}>
                            <hr style={{ 
                                    width: '100%', 
                                    border: '3px solid rgb(61, 61, 61)',
                                    borderRadius: '10px'
                                }}></hr>
                        </div>
                    </CustomList>
                    </div>
                )
            }}
        />
    )
}


export default connector(SearchBar);