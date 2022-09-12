import React from 'react';
import { Fade, Flip, Zoom } from 'react-awesome-reveal';


export const flip = (s:JSX.Element):JSX.Element => {
    return (
        <Flip direction="horizontal">
            {s}
        </Flip>
    )
}

//direction="up" triggerOnce
export const fade = (s:JSX.Element):JSX.Element => {
    return (
        <Fade>
            {s}
        </Fade>
    )
}

export const zoom = (s:JSX.Element):JSX.Element => {
    return (
        <Zoom>
            {s}
        </Zoom>
    )
}