import { useEffect, useState } from "react";
import { mat4, vec3 } from 'gl-matrix'
import { useNavigate } from "react-router-dom";
import CustomHTMLBackgroundMenu from "./CustomHTMLBackgroundMenu";
import WebvisContent from "./WebvisContent/WebvisContent"
import { WebvisAppContext } from "./WebvisAppContext";


interface InitialState {
  visible: boolean,
  x?: number,
  y?: number,
  z?: number,
  nodeId?: number
}

const listNodeAppeareance = [{
  nodeID: 624,
  color: "urn:X-l3d:color:green",
}, {
  nodeID: 605,
  color: "urn:X-l3d:color:yellow",
}, {
  nodeID: 212,
  color: "urn:X-l3d:color:red",
}]

function App() {
  const [context, setContext] = useState(null);
  const [viewer, setViewer] = useState(null);
  const [meshMenuState, setMeshMenuState] = useState<InitialState>({ visible: false })
  const navigate = useNavigate();

  const webvisUI = window['webvisUI']
  const webvis = window['webvis']

  // load the refinery model
  useEffect(() => {
    const initData = new URLSearchParams(window.location.search).get('initData');
    if (!initData) {
      const dataURL = `https%3A%2F%2Fdata-public.threedy.io%2Ftestdata%2Fmicrosoft%2Frefinery_scene_max2015_3_4m_nov2022.obj%3Fi3dhparams%3DmaxQuantError%3A1.0&autoplay`;
      navigate(`?initData=${dataURL}`);
    }
    // eslint-disable-next-line
  }, [])

  // Returns a view matrix 
  function lookAt(eye, target, up) {
    let zaxis = vec3.normalize(vec3.create(), vec3.sub(vec3.create(), target, eye));
    let xaxis = vec3.normalize(vec3.create(), vec3.cross(vec3.create(), zaxis, up));
    let yaxis = vec3.cross(vec3.create(), xaxis, zaxis);

    zaxis[0] = -zaxis[0]; zaxis[1] = -zaxis[1]; zaxis[2] = -zaxis[2];

    let viewMatrix = new Float32Array(16);
    viewMatrix[0] = xaxis[0];
    viewMatrix[1] = yaxis[0];
    viewMatrix[2] = zaxis[0];
    viewMatrix[3] = 0;

    viewMatrix[4] = xaxis[1];
    viewMatrix[5] = yaxis[1];
    viewMatrix[6] = zaxis[1];
    viewMatrix[7] = 0;

    viewMatrix[8] = xaxis[2];
    viewMatrix[9] = yaxis[2];
    viewMatrix[10] = zaxis[2];
    viewMatrix[11] = 0;

    viewMatrix[12] = -vec3.dot(xaxis, eye);
    viewMatrix[13] = -vec3.dot(yaxis, eye);
    viewMatrix[14] = -vec3.dot(zaxis, eye);
    viewMatrix[15] = 1;

    return viewMatrix;
  }

  const handleKeyDown = event => {
    // Press enter to animate camera  
    if (event.key === 'Enter') {
      const viewMatrix = lookAt(vec3.fromValues(0, 50, 50), vec3.fromValues(10, 0, 0), vec3.fromValues(0, 1, 0));
      viewer.animateViewToViewmatrix(viewMatrix, 5000.0);
    }
  };

  const getM = () => {
    const trn = mat4.fromTranslation(mat4.create(), vec3.fromValues(1, 5, 0)); // axes as vector
    // Rotation
    const rot = mat4.fromRotation(mat4.create(), 45 * 0.0174533, vec3.fromValues(0, 1, 0));
    // Scale
    const scl = mat4.fromScaling(mat4.create(), vec3.fromValues(5, 2, 3));

    // combine
    let m = mat4.multiply(mat4.create(), rot, scl);
    m = mat4.multiply(mat4.create(), m, trn);
    return m
  }

  const listNodes = [
    // {
    //   urn: 'urn:x-i3d:shape:key',
    //   properties: { enable: true }
    // },
    // {
    //   urn: 'urn:x-i3d:shape:418',
    //   properties: {
    //     enabled: true,
    //     appearanceURI: 'urn:X-l3d:color:blue'
    //   }
    // }, {
    //   urn: 'urn:x-i3d:shape:cube',
    //   properties: {
    //     enabled: true,
    //     renderMode: webvis.RenderMode.Topology,
    //     localTransform: getM()
    //   }
    // }
  ]

  if (getM || listNodes) {
    // Warning
  }

  const handleNodeClicked = (event) => {
    context.getProperty(event.targetNodeID, "label").then(function (label) {
      console.log("Node clicked " + event.targetNodeID);
    });

    const x = event.pointerInfo.position[0];
    const y = event.pointerInfo.position[1];
    const z = event.pointerInfo.position[2];
    setMeshMenuState({ visible: true, x: x, y: y, z: z, nodeId: event.targetNodeID });
  }

  const handleBackgroundClicked = () => {
    setMeshMenuState({ visible: false });
  }

  const handleNodeAdded = (event) => {
    context.getProperty(event.targetNodeID, "label").then(function (label) {
      console.log("Node added " + event.targetNodeID);
    });
    // webvis.resolve(event.targetNodeID)
    context.resetProperty(event.targetNodeID, 'renderMode')
  }

  const handleNodePointerOut = (event) => {
    context.getProperty(event.targetNodeID, "label").then(function (label) {
      console.log("Node Out : " + event.targetNodeID + ' ' + label);
    });
  }

  const handleNodePointerEnter = (event) => {
    context.getProperty(event.targetNodeID, "label").then(function (label) {
      console.log("Node Enter : " + event.targetNodeID + ' ' + label);
    });
  }

  const loadSettings = (ctx) => {
    // Set the selection colour
    console.log('Load settings')

    ctx.changeSetting("selectionColor", "228FDE");
    ctx.changeSetting("preSelectionColor", "228FDE");

    //Disable Tooltips 3.6.x
    webvisUI.setSetting(webvisUI.UISetting.LABEL_TOOLTIP_ENABLED, false);

    // change wireframe color
    ctx.changeSetting(webvis.ViewerSettingStrings.TOPO_GEOMETRY_COLOR, "ff0000");
    ctx.changeSetting(webvis.ViewerSettingStrings.TOPO_GEOMETRY_SECONDARY_COLOR, "ff0000");

  }

  return (

    <div className={"h-full"}>
      <WebvisAppContext.Provider value={{
        context,
        setContext,
        viewer,
        setViewer
      }}>
        <WebvisContent
          listNodes={listNodes}
          listNodeAppearance={listNodeAppeareance}
          handleKeyDown={handleKeyDown}
          handleNodeClicked={handleNodeClicked}
          handleBackgroundClicked={handleBackgroundClicked}
          handleNodeAdded={handleNodeAdded}
          handleNodePointerOut={handleNodePointerOut}
          handleNodePointerEnter={handleNodePointerEnter}
          loadSettings={loadSettings}
        />
        <CustomHTMLBackgroundMenu {...meshMenuState} />
      </WebvisAppContext.Provider>
    </div>
  );
}

export default App;
