import { useCallback, useEffect, useState, useContext } from "react";
import { mat4, vec4 } from 'gl-matrix'
import { WebvisAppContext } from "./WebvisAppContext";

interface IOverlayProps {
    x?: number,
    y?: number,
    z?: number,
    visible: boolean,
    message?: string
    nodeId?: number
}

export default function CustomHTMLBackgroundMenu(props: IOverlayProps) {
    const { x, y, z, visible, message, nodeId } = props;

    const [meshMenuSSPos, setMeshMenuSSPos] = useState({ x: 0, y: 0 });
    const { context, viewer } = useContext(WebvisAppContext);
    const wv = window["webvis"];

    useEffect(() => {
        if (props.visible) {
            updateMenuSSPos();
        }
        // eslint-disable-next-line
    }, [props])

    const screenSpaceToWorldSpace = (screen) => {
        let knownPos = { x, y, z }

        let vm = viewer.getViewMatrix()
        let pm = viewer.getProjectionMatrix()

        let normalisedX = (knownPos.x / window.innerWidth) * 2 - 1
        let normalisedY = (knownPos.y / window.innerHeight) * 2 - 1

        let clipSpace = vec4.fromValues(normalisedX, -normalisedY, 0, 1)
        let ipm = mat4.invert(mat4.create(), pm)

        let cs = vec4.transformMat4(vec4.create(), clipSpace, ipm)

        let ivm = mat4.invert(mat4.create(), vm)
        let ws = vec4.transformMat4(vec4.create(), cs, ivm)

        return ws;
    }

    if (screenSpaceToWorldSpace) {
        // Warning
    }

    const updateMenuSSPos = useCallback(() => {
        if (visible) {
            const ws = vec4.fromValues(x, y, z, 1.0)
            let screen = worldSpaceToScreenSpace(ws)
            setMeshMenuSSPos({ ...meshMenuSSPos, x: screen.x, y: screen.y });
        }
    }, [visible, x, y, z])

    const worldSpaceToScreenSpace = (ws) => {
        let vm = context.getViewer().getViewMatrix()

        let cs = vec4.transformMat4(vec4.create(), ws, vm)

        let pm = context.getViewer().getProjectionMatrix()
        let clipSpace = vec4.transformMat4(vec4.create(), cs, pm)

        clipSpace[0] /= clipSpace[3]
        clipSpace[1] /= clipSpace[3]

        let x = (clipSpace[0] * 0.5 + 0.5) * window.innerWidth
        let y = (-clipSpace[1] * 0.5 + 0.5) * window.innerHeight

        return ({ x: x, y: y })
    }

    const zoomToMesh = async () => {
        // Zoom
        const viewer = context.getViewer();
        viewer.fitViewToNode(nodeId);

        // Set other nodes to transparent
        const instanceGraph = await context.getInstanceGraph();
        // Find root 
        // Note: assuming the first node is the root node
        // is this always true? Is there a better way to do 
        // this ?
        const allNodes = instanceGraph._nodes;
        const rootNode = allNodes[0];

        // Set all nodes to transparent
        await setNodesTransparentRecursive(rootNode.id);

        // Reset the selected node
        await context.resetProperty(nodeId, "appearanceURI");
    }

    const setNodesTransparentRecursive = async (nodeId) => {
        const children = await context.getProperty(nodeId, "children");

        // Only set leaf nodes to transparent
        if (children.length < 1) {
            await context.setProperty(nodeId, "appearanceURI", "urn:X-l3d:color:rgba:ffffff10");
            return;
        }

        for (let child of children) {
            await setNodesTransparentRecursive(child);
        }
    }

    useEffect(() => {
        if (!context) { return; }
        // Listen for events
        // register a callback for multiple events
        context.registerListener([wv.EventType.VIEW_CHANGED], updateMenuSSPos,
            // nodeID
            0,
            // observeSubTree
            true
        );

        return () => {
            context.unregisterListener(updateMenuSSPos)
        }
        // eslint-disable-next-line
    }, [context, x, y, z])

    return (
        visible ?
            <div className={"absolute top-px p-1 z-50 border-solid border-2 bg-blue text-white"} style={{ top: meshMenuSSPos.y + "px", left: meshMenuSSPos.x + "px" }}>
                {message ?
                    <div>{message}</div>
                    : <>
                    </>
                }
                <button onClick={zoomToMesh}>Focus</button>
            </div> : null
    )
}

