import React from 'react';
import './App.css';
import {
  ChartsPage,
  HomePage,
  Navbar,
  NewsPage,
  SearchPage,
  SettingsPage
} from './containers/all_containers';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from "react-router-dom";
import SimpleBar from "simplebar-react";
import 'simplebar/src/simplebar.css';
import { useAppDispatch } from './redux/hooks';
import { 
  initial_set, 
  set_profile, 
  set_buy_hold, 
  set_earnings, 
  set_news, 
  set_financials,
  set_currentValue,
  set_yearlyChange,
  set_dailyChange
} from './redux/reducers/ChartUI';
import { connect, ConnectedProps } from 'react-redux'
import { RootState } from "./redux/store";
import { supported_stocks } from './supported_stocks';
import { Query_MarketNews, Query_CompanyProfile, Query_Earnings, Query_CompanyNews, Query_BuyHold, Query_API, Query_CompanyFinancials, Query_Measurement } from './components/QueryHelper';
import { CompanyProfileData } from './types/QueryHelperTypes';
import { add_news } from './redux/reducers/MarketNews';
import { fade } from './components/AnimationComps';
import { QueryApi } from '@influxdata/influxdb-client';
import { RotatingSquare, TailSpin } from 'react-loader-spinner';
import getWindowVals from './getWindowVals';
import { ThumbUpSharp } from '@mui/icons-material';

const mapState = (state: RootState) => ({
  page: state.navigation.page,
  isExpand: state.ChartUI.isExpanded,
})

// state any actions desired to be dispatched
const mapDispatch = {
  initialize: initial_set,
  profile_init: set_profile,
  buyHold_init: set_buy_hold,
  earnings_init: set_earnings,
  news_init: set_news,
  move_value: set_currentValue,
  financials_init: set_financials,
  add_news: add_news,
  move_yearly: set_yearlyChange,
  move_daily: set_dailyChange
}

const connector = connect(mapState, mapDispatch)
type PropsFromRedux = ConnectedProps<typeof connector>

export interface initial_props{
  stocks: string[],
  companyProfile: CompanyProfileData[]
}
interface Istate{
  loading?:boolean,
}

class App extends React.Component<PropsFromRedux, Istate> {
  loadPath: string;
  timeout: any;
  qry_api: QueryApi;

  constructor(props: PropsFromRedux){
    super(props);
    this.loadPath = window.location.pathname;
    this.state = ({loading: true});

    // parse in the env vars from the window object
    // defined in the preload script for electron
    // accessible via the context bridge, used when developing locally
    
    // const windowVal = getWindowVals(window);
    // const TOKEN = windowVal.token;
    // const ORG = windowVal.org;


    // hard code in token when not running backend locally, grabs data from server
    const TOKEN = "OqBpM6l039-pfImQwMyik-fVvUFwKPszSn39gfboG-infVM-dTODlMWf72eXgjM9SaT6r2gJnGQjH_glZTdIxQ==";
    const ORG = "alexkaiser";
    
    this.qry_api = Query_API(TOKEN,ORG, 'BUCKET');
    this.lets_get_it_started();
    
  }

  lets_get_it_started(){
    this.props.initialize(supported_stocks);
    const newsData = Query_MarketNews('-3d', this.qry_api);
      newsData.then((data) => {
          data.map((o) => {
              this.props.add_news(o);
          })
        }).catch((err) => {
          console.log(err);
        });

    supported_stocks.map((str) => {
      const prof = Query_CompanyProfile(str, '-364d', this.qry_api);
      prof.then((data) => {
          this.props.profile_init({
            ticker: str,
            companyProfile: data
          });
          }).catch((err) => {
          // console.log(err);
      });

      const earnings = Query_Earnings(str, '-364d', this.qry_api);
      earnings.then((data) => {
        this.props.earnings_init({
          name: str,
          earnings: data
        });
      }).catch((err) => {
        // console.log(err);
      });

      const news = Query_CompanyNews(str, '-7d', this.qry_api);

      news.then((data) => {
        data.map((o) => {
          this.props.news_init({
            name: str,
            companyNews: o,
          });
        })
      }).catch((err) => {
        // console.log(err);
      });

      
      

      const buyHold = Query_BuyHold(str, '-364d', this.qry_api);

      buyHold.then((data) => {
        this.props.buyHold_init({
          name: str,
          buyHold: data,
        });
      }).catch((err) => {
        // console.log(err);
      });

      const financials = Query_CompanyFinancials(str, '-364d', this.qry_api);

      financials.then((data) => {
        this.props.financials_init({
          name: str,
          financials: data,
        });
      }).catch((err) => {
        // console.log(err);
      });

      const price = Query_Measurement(str, '-364d', 'Price', this.qry_api);
      price.then((data) => {
        if (data.value.includes('No data')){
            // console.log('no data for this time period');
        }
        else {
            this.props.move_value({
                name: str,
                measurement:'Price',
                value: data.value,
                percentChange: data.percentChange
            });
        }
        }).catch((err) => {
            console.log(err);
      });

      const yearly = Query_Measurement(str, '-364d', 'Price', this.qry_api);
      yearly.then((data) => {
        if (data.value.includes('No data')){
            // console.log('no data for this time period');
        }
        else {
            this.props.move_yearly({
                name: str,
                value: data.percentChange
            });
        }
        }).catch((err) => {
            console.log(err);
      });

      const daily = Query_Measurement(str, '-1d', 'Price', this.qry_api);
      daily.then((data) => {
        if (data.value.includes('No data')){
            // console.log('no data for this time period');
            const dailyAgain = Query_Measurement(str, '-2d', 'Price', this.qry_api);
            dailyAgain.then((data) => {
              if (data.value.includes('No data')){
                // console.log('no data for this time period 2d');
                const dailyLast = Query_Measurement(str, '-3d', 'Price', this.qry_api);
                dailyLast.then((data) => {
                  if (data.value.includes('No data')){
                    // console.log('just assume stock market is closed for a while');
                    this.props.move_daily({
                      name: str,
                      value: 'No data',
                    });
                  }
                  else {
                    this.props.move_daily({
                      name: str,
                      value: data.percentChange
                    });
                  }
                }).catch((err) => {
                  // console.log(err);
                });
              }
              else {
                this.props.move_daily({
                  name: str,
                  value: data.percentChange
              });
              }
            }).catch((err) => {
              // console.log(err);
            });
        }
        else {
            this.props.move_daily({
                name: str,
                value: data.percentChange
            });
        }
        }).catch((err) => {
            // console.log(err);
      });




    })
  }

  componentDidMount(){
    this.timeout = setTimeout(() => this.changeLoad(), 8000);
  }

  changeLoad(){
    this.setState({loading:false});
    return () => clearTimeout(this.timeout);

  }
  // //(this.props.isExpand || this.props.page == 'Search' || this.props.page == 'Home') ? 'hidden' : 'auto'}}>
  render(){
    const isDevel = process.env.NODE_ENV === "development" ? true : false;
    return !this.state.loading ? (
        <div className='App'>
              <Router>
              <SimpleBar className='simple-bar-wrapper'> 
                <div id="test" className='app page'>
                  <Routes>
                      <Route path={this.loadPath} element={<Navigate to={isDevel ? "/Home" : this.loadPath + "/Home"} replace={true} />} />
                      <Route path={isDevel ? "/Home" : this.loadPath + "/Home"} element={<HomePage qry_api={this.qry_api} />} />
                      <Route path={isDevel ? "/Search" : this.loadPath + "/Search"} element={<SearchPage qry_api={this.qry_api} />} />
                      <Route path={isDevel ? "/Charts" : this.loadPath + '/Charts'} element={<ChartsPage qry_api={this.qry_api} />} />
                      <Route path={isDevel ? "/Settings" : this.loadPath + '/Settings'} element={<SettingsPage />} />
                  </Routes>
                </div>
              </SimpleBar> 
              <div className='app navbar'>
                <Navbar loadpath={this.loadPath} isDevel={isDevel}/>
              </div>
            </Router> 
        </div>
      ) : (
        <div className='Loading_app'>
          <div style={{display: 'flex', height: '100vh', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-evenly'}}>
          {fade(<span style={{
            color: 'lightgray',
            fontSize: '6vh'
        }}>Getting things ready for you...</span>)}
          {fade(
          <TailSpin width={200} height={200} color='green' ariaLabel="loading-indicator" />
          )}
        </div>
        </div>
      );
  }
}

export default connector(App);
