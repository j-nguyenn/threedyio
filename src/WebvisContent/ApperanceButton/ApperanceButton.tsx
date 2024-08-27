import { useCallback, useContext } from 'react'
import { WebvisAppContext } from '../../WebvisAppContext';
export interface NodeAppearance {
    nodeID: number,
    color: string,
}
interface AppearanceButtonProps {
    listNodes: NodeAppearance[]
}
const AppearanceButton = (props: AppearanceButtonProps) => {
    const { listNodes } = props;
    const { context } = useContext(WebvisAppContext)

    const handleChangeAppearance = useCallback(async () => {
        for (const node of listNodes) {
            const { nodeID, color } = node;
            const currentColor = await context.getProperty(nodeID, 'appearanceURI');
            if (color !== currentColor) {
                const { results } = await context.setProperty(nodeID, "appearanceURI", color)
                console.log(`Node ${nodeID} has changed from ${results[0].oldValue} to ${results[0].newValue}`)
            }
            else {
                context.resetProperty(nodeID, 'appearanceURI')
            }
        }
    }, [context])

    return (
        <button className={"absolute top-px top-10 p-2 z-50 bg-blue hover:bg-hoverblue rounded-lg text-white"} onClick={handleChangeAppearance}>
            Change appearances
        </button>
    )
}

export default AppearanceButton