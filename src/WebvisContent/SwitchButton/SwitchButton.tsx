import { useCallback, useEffect, useState, useContext } from "react";
import { WebvisAppContext } from "../../WebvisAppContext";
interface SwitchButtonProps {
    nodeID: string
}
const SwitchButton = (props: SwitchButtonProps) => {
    const [currentMode, setCurrentMode] = useState();
    const webvis = window["webvis"]
    const { context } = useContext(WebvisAppContext)
    useEffect(() => {
        const getCurrentMode = async () => {
            const mode = await context.getProperty(props.nodeID, 'renderMode');
            setCurrentMode(mode);
        }
        if (props.nodeID) {
            getCurrentMode()
        }
    }, [props.nodeID, context])

    const handleSwitchMode = useCallback(async () => {
        if (props.nodeID === null) {
            console.error('nodeID is not defined')
            return;
        }
        const currentRenderMode = await context.getProperty(props.nodeID, 'renderMode');
        const faceMode = webvis.RenderMode.Faces;
        const wireframMode = webvis.RenderMode.Topology;
        if (currentRenderMode !== wireframMode) {
            context.setProperty(props.nodeID, 'renderMode', wireframMode)
            setCurrentMode(wireframMode)
        }
        else {
            context.setProperty(props.nodeID, 'renderMode', faceMode)
            setCurrentMode(faceMode)
        }
    }, [props.nodeID, context])

    return (
        <button className={"absolute top-px p-2 z-50 bg-blue hover:bg-hoverblue rounded-lg text-white"} onClick={handleSwitchMode}>
            Switch to {' '}
            {currentMode === webvis.RenderMode.Topology ? 'shaded' : 'wireframe'}
        </button>
    )
}

export default SwitchButton