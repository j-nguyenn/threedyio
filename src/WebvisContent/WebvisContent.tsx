import { useEffect, useRef, useState, useContext } from "react";
import { WebvisAppContext } from "../WebvisAppContext";
import AppearanceButton, { NodeAppearance } from "./ApperanceButton/ApperanceButton";
import ResetCameraButton from "./ResetCameraButton/ResetCameraButton";
import SwitchButton from "./SwitchButton/SwitchButton";

declare global {
    namespace JSX {
        interface IntrinsicElements {
            'webvis-viewer': any,
            'webvis-full': any
        }
    }
}

interface Node {
    urn: string,
    properties: { [key: string]: any }
}

interface WebvisContentProps {
    listNodes: Node[],
    listNodeAppearance: NodeAppearance[],
    handleKeyDown: (event: any) => void,
    handleNodeClicked: (event: any) => void,
    handleBackgroundClicked: (event: any) => void,
    handleNodeAdded: (event: any) => void,
    handleNodePointerOut: (event: any) => void,
    handleNodePointerEnter: (event: any) => void,
    loadSettings: (ctx: any) => void
}

const resetNodesAppearance = async (context) => {

    // Set other nodes to transparent
    const instanceGraph = await context.getInstanceGraph();
    // Find root 
    // Note: assuming the first node is the root node
    // is this always true? Is there a better way to do 
    // this ?
    const allNodes = instanceGraph._nodes;
    const rootNode = allNodes[0];
    await resetNodesAppearanceRecursive(context, rootNode.id);
}

const resetNodesAppearanceRecursive = async (context, nodeId) => {
    const wv = window["webvis"];
    const children = await context.getProperty(nodeId, "children");

    // Only set leaf nodes to transparent
    if (children.length < 1) {
        await context.setProperty(nodeId, "appearanceURI", "urn:X-l3d:color:rgba:ffffffff");
        return;
    }

    for (let child of children) {
        await resetNodesAppearanceRecursive(context, child);
    }
}


const WebvisContent = (props: WebvisContentProps) => {
    const { loadSettings, handleBackgroundClicked, handleNodeAdded, handleNodeClicked, handleKeyDown, handleNodePointerOut, handleNodePointerEnter, listNodeAppearance } = props;
    const container = useRef(null);
    const [isReady, setReady] = useState(false)
    const [currentNode, setCurrentNode] = useState(null);
    const webvis = window["webvis"]
    const { context, setContext, setViewer } = useContext(WebvisAppContext)

    useEffect(() => {
        container.current = document.getElementById("threedyContainer");
        if (container.current) {
            container.current?.requestContext().then(ctx => {
                console.log(ctx)
                ctx.requestRootNodeIds().then(([root]) => {
                    console.log({ root })
                    setCurrentNode(root);
                })
                setContext(ctx)
                // Load necessary settings
                loadSettings(ctx);
            })
            container.current.requestViewer().then(vw => {
                console.log({ vw });
                setViewer(vw)
            })
        }
    }, [])

    useEffect(() => {
        if (container.current && context) {
            // listNodes.forEach(({ urn, properties }) => {
            //     const node = webvis.add(urn);
            //     Object.keys(properties).forEach(key => {
            //         webvis.setProperty(node, key, properties[key])
            //     })
            // })

            // Set model to white 
            // resetNodesAppearance();


            // Listen for events
            // register a callback for multiple events
            context.registerListener(
                // different eventTypes
                [webvis.EventType.NODE_REMOVED, webvis.EventType.NODE_CLICKED,
                webvis.EventType.NODE_POINTER_OVER, webvis.EventType.NODE_POINTER_OUT,
                webvis.EventType.NODE_POINTER_ENTER, webvis.EventType.BACKGROUND_CLICKED, webvis.EventType.MODEL_RENDERED],

                // listener 
                async (event) => {
                    // node added 
                    switch (event.type) {
                        case webvis.EventType.MODEL_RENDERED:
                            console.log('Model rendered')
                            if (!isReady) {
                                setReady(true)
                            }
                            break;
                        case webvis.EventType.NODE_REMOVED:
                            context.getProperty(event.targetNodeID, "label").then(function (label) {
                                console.log("Node removed");
                            });
                            break;
                        case webvis.EventType.NODE_CLICKED:
                            handleNodeClicked(event);
                            break;
                        case webvis.EventType.BACKGROUND_CLICKED:
                            handleBackgroundClicked(event)
                            resetNodesAppearance(context);
                            break;
                        case webvis.EventType.NODE_POINTER_OUT:
                            handleNodePointerOut(event);
                            break;
                        case webvis.EventType.NODE_POINTER_ENTER:
                            handleNodePointerEnter(event);
                            break;
                        default:
                            console.log({ event })
                            break;
                    }

                },
                // nodeID
                0,
                // observeSubTree
                true
            )
        }
        // eslint-disable-next-line
    }, [container.current, context])

    useEffect(() => {
        const nodeID = new URLSearchParams(window.location.search).get('nodeID');

        if (nodeID && isReady) {
            webvis.setSelection(nodeID).then(result => {
                console.log(`Auto select the node ${nodeID}`, { result })
            })
        }
    }, [window.location.search, isReady])

    return (
        <>
            <SwitchButton nodeID={currentNode} />
            <ResetCameraButton />
            <AppearanceButton listNodes={listNodeAppearance} />
            <webvis-viewer id="threedyContainer" onKeyDown={handleKeyDown}></webvis-viewer>
        </>
    );
}

export default WebvisContent;
