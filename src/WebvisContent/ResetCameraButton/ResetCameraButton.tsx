import { useCallback, useContext } from "react";
import { WebvisAppContext } from "../../WebvisAppContext";

interface ResetCameraButtonProps {
}
const ResetCameraButton = (props: ResetCameraButtonProps) => {
    const { viewer } = useContext(WebvisAppContext)
    const handleButtonPress = useCallback(async () => {
        let view = new Float32Array(3);
        view[0] = 0; view[1] = 0; view[2] = 1;
        let up = new Float32Array(3);
        up[0] = 0; up[1] = 1; up[2] = 0;
        viewer.fitView(view, up, 0);
    }, [viewer])

    return (
        <button className={"absolute top-px top-20 p-2 z-50 bg-blue hover:bg-hoverblue rounded-lg text-white"} onClick={handleButtonPress}>
            Reset Camera
        </button>
    )
}
export default ResetCameraButton