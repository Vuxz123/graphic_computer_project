import React from 'react';
import {ViewerController} from "./SceneLoader";
import {Spin} from "antd";


// Viewer component with 1 parameter type ViewerController
// export const Viewer = ({controller:}) => {
//     const {loading, setLoading} = React.useState(true);
//
//     return (
//         loading ?
//         <div>Loading...</div> :
//         <div>
//             <h1>{controller.title}</h1>
//             <p>{controller.description}</p>
//             <div>
//                 controller.
//             </div>
//         </div>
//     )
// }

export const Viewer = (props: { controller: ViewerController; }) => {
    const {controller} = props;
    const [loading, setLoading] = React.useState(true);

    //add dom element to the scene
    const mount = React.useRef<HTMLDivElement>(null);
    React.useEffect(() => {
        console.log("Adding dom element to the scene");
        if (mount.current) {
            console.log("effect: " + controller.domElement);
            console.log(controller.domElement);
            mount.current.appendChild(controller.domElement);
        }
    }, [loading, mount]);
    React.useEffect(() => {
        controller.loadMovie().then(() => {
            console.log("Movie loaded");
            setLoading(false);
        }).catch((error) => {
            console.error(error);
        });
    }, [controller]);
    React.useEffect(() => {
        if (!loading) {
            controller.render();
        }
    }, [loading]);

    return (
        loading ?
            <Spin fullscreen/> :
            <div ref={mount}></div>
    );

}