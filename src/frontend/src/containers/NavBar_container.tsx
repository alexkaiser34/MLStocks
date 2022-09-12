import React from 'react';
import { Link } from "react-router-dom";
import Navbar_item from '../components/Navbar_item';
import { connect, ConnectedProps } from 'react-redux'
import { RootState } from "../redux/store";
import '../styles/navbar.css';

interface NavBar_container_props {
    loadpath: string,
    isDevel: boolean,
}

const mapState = (state: RootState) => ({
    page: state.navigation.page
})

const connector = connect(mapState)
type PropsFromRedux = ConnectedProps<typeof connector>

type ClassProps = PropsFromRedux & NavBar_container_props;

class Navbar extends React.Component<ClassProps> {

    navbar_item(name:string, isWhite:boolean):JSX.Element {
        return (
            <div style={{height: 'inherit'}}>
                <li>
                    <Link to={this.props.isDevel ? "/" + name : this.props.loadpath + "/" + name}>
                        <Navbar_item name={name} isWhite={isWhite}/>
                    </Link>
                </li>
            </div>
        )
    }
    render() {
        const p = this.props;
        return(
            <div className='navigation_bar'>
                <ul id="nav_components">
                    {this.navbar_item('Home', p.page == "Home")}
                    {/* {this.navbar_item('News', p.page == "News")} */}
                    {this.navbar_item('Search', p.page == "Search")}
                    {this.navbar_item('Charts', p.page == "Charts")}
                    {this.navbar_item('Settings', p.page == "Settings")}
                </ul>
            </div>
        );
    } 

}

export default connector(Navbar)