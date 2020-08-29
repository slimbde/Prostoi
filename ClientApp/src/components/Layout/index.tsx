import * as React from 'react';
import NavMenu from './NavMenu';
import './index.css'

export default (props: { children?: React.ReactNode }) => (
    <React.Fragment>
        <NavMenu />
        <div className="container">
            {props.children}
        </div>
    </React.Fragment>
);
