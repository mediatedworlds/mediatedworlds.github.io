import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

const $ = id => document.getElementById(id);


// ============================================================
// INTRO
// ============================================================

const intro = $("intro");
const startBox = $("startBox");

let introFinished = false;


function enterStation() {

  if (introFinished)
    return;

  introFinished = true;

  intro?.classList.add("hidden");

  if (startBox)
    startBox.style.display = "block";

}


["pointerdown", "wheel", "keydown", "touchstart"]
  .forEach(eventName => {

    addEventListener(
      eventName,
      enterStation,
      { once: true }
    );

  });


// ============================================================
// TOP BAR
// ============================================================

if (!$("stationTopBar")) {

  const bar =
    document.createElement("div");

  bar.id =
    "stationTopBar";

  bar.innerHTML =
    `<div class="station-title">
      What is My Machinic Station?
    </div>`;

  Object.assign(
    bar.style,
    {
      position: "fixed",
      top: "0",
      left: "0",
      width: "100%",
      height: "42px",
      background: "rgba(0,0,0,.88)",
      color: "white",
      display: "flex",
      alignItems: "center",
      padding: "0 20px",
      boxSizing: "border-box",
      zIndex: 9000,
      fontFamily: "inherit",
      fontSize: "15px",
      letterSpacing: ".02em",
      pointerEvents: "none"
    }
  );

  document.body.appendChild(bar);

}


// ============================================================
// ABOUT
// ============================================================

$("aboutButton")?.addEventListener(
  "click",
  () => {

    $("aboutPanel")?.classList.toggle(
      "visible"
    );

  }
);


$("closeAbout")?.addEventListener(
  "click",
  () => {

    $("aboutPanel")?.classList.remove(
      "visible"
    );

  }
);


// ============================================================
// SCENE
// ============================================================

const scene =
  new THREE.Scene();

scene.background =
  new THREE.Color("white");


const camera =
  new THREE.PerspectiveCamera(
    50,
    innerWidth / innerHeight,
    0.1,
    100
  );


camera.position.set(
  0,
  0,
  7
);


const renderer =
  new THREE.WebGLRenderer({
    antialias: true
  });


renderer.setSize(
  innerWidth,
  innerHeight
);


renderer.setPixelRatio(
  Math.min(
    window.devicePixelRatio,
    2
  )
);


renderer.outputColorSpace =
  THREE.SRGBColorSpace;


renderer.toneMapping =
  THREE.ACESFilmicToneMapping;


renderer.toneMappingExposure =
  1.15;


document.body.appendChild(
  renderer.domElement
);


// ============================================================
// LIGHTING
// ============================================================

function addLight(
  Type,
  intensity,
  position
) {

  const light =
    new Type(
      0xffffff,
      intensity
    );

  if (position)
    light.position.set(
      ...position
    );

  scene.add(
    light
  );

}


addLight(
  THREE.AmbientLight,
  3.2
);


addLight(
  THREE.HemisphereLight,
  3.5
);


addLight(
  THREE.DirectionalLight,
  4,
  [0, 6, 10]
);


addLight(
  THREE.DirectionalLight,
  3,
  [0, 5, -10]
);


addLight(
  THREE.DirectionalLight,
  3,
  [-10, 4, 0]
);


addLight(
  THREE.DirectionalLight,
  3,
  [10, 4, 0]
);


addLight(
  THREE.PointLight,
  5,
  [0, 8, 0]
);


// ============================================================
// CONTROLS
// ============================================================

const controls =
  new OrbitControls(
    camera,
    renderer.domElement
  );


controls.enablePan =
  false;


controls.minDistance =
  1.5;


controls.maxDistance =
  9.5;


controls.target.set(
  0,
  0,
  0
);


// ============================================================
// ROOM
// ============================================================

const ROOM_SIZE =
  20;

const HALF_ROOM =
  ROOM_SIZE / 2.53;

const WALL_X_BACK =
  -HALF_ROOM;

const WALL_X_FRONT =
  HALF_ROOM;

const WALL_OFFSET =
  0.15;


// ============================================================
// DATA
// ============================================================

const machines =
  [];

const gears =
  {};

let activeMachine =
  null;

let activeGear =
  null;

let previewGear =
  null;

let previewMachine =
  null;

let previewSide =
  null;

let typingPreviewMachine =
  null;

let link =
  null;

let gearSize =
  null;

let dragging =
  null;

let dragStart =
  null;

let dragMoved =
  false;


const raycaster =
  new THREE.Raycaster();


const mouse =
  new THREE.Vector2();


const speed =
  0.005;


const MIN_LINKS =
  10;


const MAX_LINKS =
  50;


// ============================================================
// LOAD WORLD
// ============================================================

const loader =
  new GLTFLoader();


loader.load(

  "./World.glb",

  gltf => {

    console.log(
      "World.glb loaded successfully."
    );


    const world =
      gltf.scene;


    scene.add(
      world
    );


    world.traverse(
      object => {

        if (object.isMesh)
          object.visible = false;

      }
    );


    const wall =
      world.getObjectByName(
        "Wall"
      );


    if (wall) {

      wall.visible =
        true;

      wall.position.set(
        WALL_X_BACK,
        0,
        0
      );


      const addWall =
        (
          position,
          rotation = [0, 0, 0]
        ) => {

          const clonedWall =
            wall.clone(true);

          clonedWall.position.set(
            ...position
          );

          clonedWall.rotation.set(
            ...rotation
          );

          scene.add(
            clonedWall
          );

        };


      addWall(
        [WALL_X_FRONT, 0, 0]
      );


      addWall(
        [0, 0, -HALF_ROOM],
        [0, Math.PI / 2, 0]
      );


      addWall(
        [0, 0, HALF_ROOM],
        [0, Math.PI / 2, 0]
      );


      addWall(
        [0, HALF_ROOM, 0],
        [0, 0, Math.PI / 2]
      );


      addWall(
        [0, -HALF_ROOM, 0],
        [0, 0, Math.PI / 2]
      );

    }


    link =
      world.getObjectByName(
        "ChainLink"
      );


    for (
      let i = 1;
      i <= 9;
      i++
    ) {

      const gear =
        world.getObjectByName(
          `Gear-${i}`
        );

      if (gear)
        gears[i] =
          gear;

    }


    if (gears[1]) {

      gearSize =
        new THREE.Box3()
          .setFromObject(
            gears[1]
          )
          .getSize(
            new THREE.Vector3()
          );

    }

  },

  progress => {

    if (progress.total) {

      console.log(
        `World.glb loading: ${Math.round(
          progress.loaded /
          progress.total *
          100
        )}%`
      );

    }

  },

  error => {

    console.error(
      "World.glb could not be loaded:",
      error
    );

  }

);


// ============================================================
// HELPERS
// ============================================================

function countWords(text) {

  return text?.trim()
    ? text
        .trim()
        .split(/\s+/)
        .filter(Boolean)
        .length
    : 0;

}


function countLinks(text) {

  return Math.min(
    MAX_LINKS,
    MIN_LINKS +
    countWords(text)
  );

}


function escapeHTML(text) {

  return String(text)
    .replaceAll(
      "&",
      "&amp;"
    )
    .replaceAll(
      "<",
      "&lt;"
    )
    .replaceAll(
      ">",
      "&gt;"
    )
    .replaceAll(
      '"',
      "&quot;"
    )
    .replaceAll(
      "'",
      "&#039;"
    );

}


// ============================================================
// CREATE MACHINE
// ============================================================

function createMachine(
  idea,
  connection,
  register = true
) {

  const machine =
    new THREE.Group();


  machine.userData = {

    idea:
      idea || "",

    connection:
      connection || "",

    count:
      countLinks(connection),

    radiusY:
      0,

    radiusZ:
      0,

    movement:
      0,

    gears:
      {
        left: null,
        right: null
      },

    answer:
      "",

    stoppedAnswer:
      "",

    running:
      false,

    wall:
      0

  };


  machine.scale.setScalar(
    1.6
  );


  const chain =
    new THREE.Group();


  machine.add(
    chain
  );


  scene.add(
    machine
  );


  if (register)
    machines.push(
      machine
    );


  buildBelt(
    machine
  );


  return machine;

}


// ============================================================
// WALLS
// ============================================================

function setMachineWall(
  machine,
  wallType
) {

  machine.userData.wall =
    wallType;


  const tilt =
    new THREE.Quaternion()
      .setFromAxisAngle(
        new THREE.Vector3(
          1,
          0,
          0
        ),
        Math.PI / 2
      );


  const rotations = [
    0,
    Math.PI / 2,
    Math.PI,
    -Math.PI / 2
  ];


  const rotation =
    new THREE.Quaternion()
      .setFromAxisAngle(
        new THREE.Vector3(
          0,
          1,
          0
        ),
        rotations[wallType]
      );


  if (wallType === 0)
    machine.position.x =
      WALL_X_BACK +
      WALL_OFFSET;


  if (wallType === 1)
    machine.position.z =
      HALF_ROOM -
      WALL_OFFSET;


  if (wallType === 2)
    machine.position.x =
      WALL_X_FRONT -
      WALL_OFFSET;


  if (wallType === 3)
    machine.position.z =
      -HALF_ROOM +
      WALL_OFFSET;


  machine.quaternion
    .copy(rotation)
    .multiply(tilt);

}


function machineCollides(
  machine,
  position
) {

  const old =
    machine.position.clone();


  machine.position.copy(
    position
  );


  machine.updateMatrixWorld(
    true
  );


  const box =
    new THREE.Box3()
      .setFromObject(
        machine
      );


  machine.position.copy(
    old
  );


  machine.updateMatrixWorld(
    true
  );


  for (
    const other of machines
  ) {

    if (
      other === machine ||
      other.userData.wall !==
      machine.userData.wall
    )
      continue;


    const otherBox =
      new THREE.Box3()
        .setFromObject(
          other
        );


    if (
      box.intersectsBox(
        otherBox
      )
    )
      return true;

  }


  return false;

}


function putMachineOnWall(
  machine,
  wallType,
  point
) {

  const oldWall =
    machine.userData.wall;


  const oldPosition =
    machine.position.clone();


  setMachineWall(
    machine,
    wallType
  );


  const p =
    machine.position.clone();


  if (
    wallType === 0 ||
    wallType === 2
  ) {

    p.y =
      point.y;

    p.z =
      point.z;

  } else {

    p.x =
      point.x;

    p.y =
      point.y;

  }


  if (
    machineCollides(
      machine,
      p
    )
  ) {

    setMachineWall(
      machine,
      oldWall
    );


    machine.position.copy(
      oldPosition
    );


    return false;

  }


  machine.position.copy(
    p
  );


  return true;

}


function findFreePointOnSameWall(
  machine,
  wallType,
  desiredPoint
) {

  const oldWall =
    machine.userData.wall;


  const oldPosition =
    machine.position.clone();


  setMachineWall(
    machine,
    wallType
  );


  const clamp =
    point => {

      const p =
        point.clone();


      const margin =
        1;


      p.y =
        THREE.MathUtils.clamp(
          p.y,
          -HALF_ROOM + margin,
          HALF_ROOM - margin
        );


      if (
        wallType === 0 ||
        wallType === 2
      ) {

        p.z =
          THREE.MathUtils.clamp(
            p.z,
            -HALF_ROOM + margin,
            HALF_ROOM - margin
          );

      } else {

        p.x =
          THREE.MathUtils.clamp(
            p.x,
            -HALF_ROOM + margin,
            HALF_ROOM - margin
          );

      }


      return p;

    };


  const direct =
    clamp(
      desiredPoint
    );


  if (
    !machineCollides(
      machine,
      direct
    )
  ) {

    machine.position.copy(
      direct
    );

    return direct;

  }


  const step =
    0.75;


  for (
    let radius = step;
    radius <= HALF_ROOM * 1.5;
    radius += step
  ) {

    const samples =
      Math.max(
        12,
        Math.ceil(
          Math.PI *
          2 *
          radius /
          step
        )
      );


    for (
      let i = 0;
      i < samples;
      i++
    ) {

      const angle =
        i /
        samples *
        Math.PI *
        2;


      const p =
        desiredPoint.clone();


      p.y +=
        Math.sin(angle) *
        radius;


      if (
        wallType === 0 ||
        wallType === 2
      ) {

        p.z +=
          Math.cos(angle) *
          radius;

      } else {

        p.x +=
          Math.cos(angle) *
          radius;

      }


      const candidate =
        clamp(
          p
        );


      if (
        !machineCollides(
          machine,
          candidate
        )
      ) {

        machine.position.copy(
          candidate
        );

        return candidate;

      }

    }

  }


  setMachineWall(
    machine,
    oldWall
  );


  machine.position.copy(
    oldPosition
  );


  return null;

}


// ============================================================
// WALL POINT
// ============================================================

const wallPlanes = [

  {
    type:
      0,

    plane:
      new THREE.Plane(
        new THREE.Vector3(
          1,
          0,
          0
        ),
        -WALL_X_BACK
      )

  },

  {
    type:
      1,

    plane:
      new THREE.Plane(
        new THREE.Vector3(
          0,
          0,
          1
        ),
        -HALF_ROOM
      )

  },

  {
    type:
      2,

    plane:
      new THREE.Plane(
        new THREE.Vector3(
          1,
          0,
          0
        ),
        -WALL_X_FRONT
      )

  },

  {
    type:
      3,

    plane:
      new THREE.Plane(
        new THREE.Vector3(
          0,
          0,
          1
        ),
        HALF_ROOM
      )

  }

];


function getMouseRay(
  event
) {

  mouse.set(

    event.clientX /
    innerWidth *
    2 -
    1,

    -(
      event.clientY /
      innerHeight
    ) *
    2 +
    1

  );


  raycaster.setFromCamera(
    mouse,
    camera
  );


  return raycaster;

}


function getWallPoint(
  event
) {

  const ray =
    getMouseRay(
      event
    );


  let closest =
    null;


  let closestDistance =
    Infinity;


  for (
    const wall of wallPlanes
  ) {

    const point =
      new THREE.Vector3();


    if (
      !ray.ray.intersectPlane(
        wall.plane,
        point
      )
    )
      continue;


    const distance =
      ray.ray.origin.distanceTo(
        point
      );


    if (
      distance <
      closestDistance
    ) {

      closestDistance =
        distance;


      closest = {

        point:
          point.clone(),

        wall:
          wall.type

      };

    }

  }


  return closest;

}


function getCameraWallPoint() {

  const raycasterForWall =
    new THREE.Raycaster();


  raycasterForWall.setFromCamera(
    new THREE.Vector2(
      0,
      0
    ),
    camera
  );


  let closest =
    null;


  let closestDistance =
    Infinity;


  for (
    const wall of wallPlanes
  ) {

    const point =
      new THREE.Vector3();


    if (
      !raycasterForWall.ray.intersectPlane(
        wall.plane,
        point
      )
    )
      continue;


    const distance =
      raycasterForWall.ray.origin.distanceTo(
        point
      );


    const inside =
      point.y >= -HALF_ROOM &&
      point.y <= HALF_ROOM &&
      (
        wall.type === 0 ||
        wall.type === 2
          ?
          point.z >= -HALF_ROOM &&
          point.z <= HALF_ROOM
          :
          point.x >= -HALF_ROOM &&
          point.x <= HALF_ROOM
      );


    if (
      !inside ||
      distance <= 0 ||
      distance >= closestDistance
    )
      continue;


    closestDistance =
      distance;


    closest = {

      point:
        point.clone(),

      wall:
        wall.type

    };

  }


  return closest;

}


function placeMachineAtCameraWall(
  machine
) {

  const hit =
    getCameraWallPoint();


  if (!hit)
    return false;


  const point =
    findFreePointOnSameWall(
      machine,
      hit.wall,
      hit.point
    );


  if (!point)
    return false;


  machine.position.y =
    point.y;


  if (
    hit.wall === 0 ||
    hit.wall === 2
  ) {

    machine.position.z =
      point.z;

  } else {

    machine.position.x =
      point.x;

  }


  return true;

}


// ============================================================
// BELT
// ============================================================

function buildBelt(
  machine
) {

  if (!link)
    return;


  const chain =
    machine.children[0];


  while (
    chain.children.length
  ) {

    chain.remove(
      chain.children[0]
    );

  }


  const size =
    new THREE.Box3()
      .setFromObject(
        link
      )
      .getSize(
        new THREE.Vector3()
      );


  const pitch =
    size.z /
    3.3;


  const count =
    Math.min(
      MAX_LINKS,
      Math.max(
        1,
        machine.userData.count
      )
    );


  machine.userData.count =
    count;


  const radius =
    count *
    pitch /
    (2 * Math.PI);


  machine.userData.radiusY =
    radius * 3;


  machine.userData.radiusZ =
    radius;


  for (
    let i = 0;
    i < count;
    i++
  ) {

    const angle =
      i /
      count *
      Math.PI *
      2;


    const newLink =
      link.clone();


    newLink.visible =
      true;


    newLink.position.set(

      0,

      0.4 +
      Math.cos(angle) *
      machine.userData.radiusY,

      Math.sin(angle) *
      machine.userData.radiusZ

    );


    newLink.rotation.x =
      -Math.atan2(
        -Math.sin(angle) *
        machine.userData.radiusY,
        Math.cos(angle) *
        machine.userData.radiusZ
      );


    chain.add(
      newLink
    );

  }


  updateGears(
    machine
  );

}


// ============================================================
// GEARS
// ============================================================

function gearPosition(
  machine,
  side
) {

  const radiusY =
    machine.userData.radiusY;


  const distance =
    radiusY -
    Math.min(
      gearSize?.y || 1,
      radiusY * 0.55
    );


  return new THREE.Vector3(

    0,

    side === "left"
      ? 0.4 + distance
      : 0.4 - distance,

    0

  );

}


function gearScale(
  machine
) {

  return 1 +
    machine.userData.count /
    100;

}


function updateGears(
  machine
) {

  for (
    const side of [
      "left",
      "right"
    ]
  ) {

    const data =
      machine.userData.gears[side];


    if (!data)
      continue;


    data.object.position.copy(
      gearPosition(
        machine,
        side
      )
    );


    data.object.scale.setScalar(
      gearScale(
        machine
      )
    );

  }

}


function randomGear(
  exclude = null
) {

  const available =
    Object.keys(gears)
      .map(Number)
      .filter(
        number =>
          number !== exclude &&
          gears[number]
      );


  if (!available.length)
    return null;


  const number =
    available[
      Math.floor(
        Math.random() *
        available.length
      )
    ];


  return {

    number,

    object:
      gears[number]

  };

}


// ============================================================
// PREVIEW
// ============================================================

function removePreview() {

  previewGear?.removeFromParent();

  previewGear =
    null;

  previewMachine =
    null;

  previewSide =
    null;

}


function showPreview(
  machine,
  side
) {

  removePreview();


  const selected =
    randomGear();


  if (!selected)
    return;


  previewGear =
    selected.object.clone(true);


  previewGear.visible =
    true;


  previewGear.position.copy(
    gearPosition(
      machine,
      side
    )
  );


  previewGear.scale.setScalar(
    gearScale(
      machine
    )
  );


  previewGear.userData.gearNumber =
    selected.number;


  previewGear.userData.preview =
    true;


  previewGear.traverse(
    object => {

      if (!object.isMesh)
        return;


      object.material =
        object.material.clone();


      object.material.transparent =
        true;


      object.material.opacity =
        0.35;

    }
  );


  machine.add(
    previewGear
  );


  previewMachine =
    machine;


  previewSide =
    side;

}


function selectPreviewGear() {

  if (
    !previewGear ||
    !previewMachine ||
    !previewSide
  )
    return;


  const machine =
    previewMachine;


  const firstNumber =
    previewGear.userData.gearNumber;


  const firstGear =
    previewGear;


  firstGear.userData.preview =
    false;


  firstGear.traverse(
    object => {

      if (!object.isMesh)
        return;


      object.material.transparent =
        false;


      object.material.opacity =
        1;

    }
  );


  firstGear.position.copy(
    gearPosition(
      machine,
      "left"
    )
  );


  firstGear.scale.setScalar(
    gearScale(
      machine
    )
  );


  const second =
    randomGear(
      firstNumber
    );


  if (!second)
    return;


  const secondGear =
    second.object.clone(true);


  secondGear.visible =
    true;


  secondGear.position.copy(
    gearPosition(
      machine,
      "right"
    )
  );


  secondGear.scale.setScalar(
    gearScale(
      machine
    )
  );


  secondGear.userData.preview =
    false;


  secondGear.traverse(
    object => {

      if (object.isMesh) {

        object.material =
          object.material.clone();

      }

    }
  );


  machine.add(
    secondGear
  );


  machine.userData.gears.left = {

    object:
      firstGear,

    number:
      firstNumber

  };


  machine.userData.gears.right = {

    object:
      secondGear,

    number:
      second.number

  };


  machine.userData.answer =
    "";


  machine.userData.stoppedAnswer =
    "";


  machine.userData.running =
    false;


  activeMachine =
    machine;


  activeGear =
    machine.userData.gears.left;


  previewGear =
    null;


  previewMachine =
    null;


  previewSide =
    null;


  showGearQuestion(
    machine
  );

}


function restoreGear(
  machine,
  number,
  side
) {

  if (
    !number ||
    !gears[number]
  )
    return;


  const object =
    gears[number].clone(true);


  object.visible =
    true;


  object.position.copy(
    gearPosition(
      machine,
      side
    )
  );


  object.scale.setScalar(
    gearScale(
      machine
    )
  );


  object.userData.preview =
    false;


  object.traverse(
    child => {

      if (!child.isMesh)
        return;


      child.material =
        child.material.clone();


      child.material.transparent =
        false;


      child.material.opacity =
        1;

    }
  );


  machine.add(
    object
  );


  machine.userData.gears[side] = {

    object,

    number

  };

}


// ============================================================
// HOVER
// ============================================================

function screenPosition(
  machine,
  side
) {

  const position =
    machine.localToWorld(
      gearPosition(
        machine,
        side
      ).clone()
    );


  position.project(
    camera
  );


  return {

    x:
      (position.x + 1) *
      0.5 *
      innerWidth,

    y:
      (-position.y + 1) *
      0.5 *
      innerHeight

  };

}


addEventListener(
  "pointermove",
  event => {

    if (dragging)
      return;


    let closestMachine =
      null;


    let closestSide =
      null;


    let closestDistance =
      Infinity;


    for (
      const machine of machines
    ) {

      if (
        machine.userData.gears.left ||
        machine.userData.gears.right
      )
        continue;


      for (
        const side of [
          "left",
          "right"
        ]
      ) {

        const point =
          screenPosition(
            machine,
            side
          );


        const distance =
          Math.hypot(
            event.clientX -
              point.x,

            event.clientY -
              point.y
          );


        if (
          distance <
          closestDistance
        ) {

          closestDistance =
            distance;


          closestMachine =
            machine;


          closestSide =
            side;

        }

      }

    }


    if (
      closestMachine &&
      closestDistance < 20
    ) {

      if (
        previewMachine !==
          closestMachine ||
        previewSide !==
          closestSide
      ) {

        showPreview(
          closestMachine,
          closestSide
        );

      }

    } else {

      removePreview();

    }

  }
);


// ============================================================
// FIND OBJECTS
// ============================================================

function findGear(
  event
) {

  const ray =
    getMouseRay(
      event
    );


  for (
    const machine of machines
  ) {

    for (
      const side of [
        "left",
        "right"
      ]
    ) {

      const data =
        machine.userData.gears[side];


      if (!data)
        continue;


      if (
        ray.intersectObject(
          data.object,
          true
        ).length
      ) {

        return {

          machine,

          data

        };

      }

    }

  }


  return null;

}


function findBelt(
  event
) {

  const ray =
    getMouseRay(
      event
    );


  let closest =
    null;


  let distance =
    Infinity;


  for (
    const machine of machines
  ) {

    const hits =
      ray.intersectObject(
        machine.children[0],
        true
      );


    if (
      hits.length &&
      hits[0].distance <
      distance
    ) {

      closest =
        machine;


      distance =
        hits[0].distance;

    }

  }


  return closest;

}


// ============================================================
// POINTER
// ============================================================

addEventListener(
  "pointerdown",
  event => {

    if (previewGear) {

      if (
        getMouseRay(
          event
        ).intersectObject(
          previewGear,
          true
        ).length
      ) {

        selectPreviewGear();

        return;

      }

    }


    const gear =
      findGear(
        event
      );


    if (gear) {

      activeMachine =
        gear.machine;


      activeGear =
        gear.data;


      showGearInfo(
        gear.machine
      );


      return;

    }


    const belt =
      findBelt(
        event
      );


    if (!belt)
      return;


    const wallHit =
      getWallPoint(
        event
      );


    if (!wallHit)
      return;


    dragging = {

      type:
        "belt",

      machine:
        belt,

      start:
        wallHit.point,

      wall:
        wallHit.wall,

      original:
        belt.position.clone()

    };


    dragStart = {

      x:
        event.clientX,

      y:
        event.clientY

    };


    dragMoved =
      false;


    controls.enabled =
      false;

  }
);


addEventListener(
  "pointermove",
  event => {

    if (!dragging)
      return;


    const dx =
      event.clientX -
      dragStart.x;


    const dy =
      event.clientY -
      dragStart.y;


    if (
      Math.hypot(
        dx,
        dy
      ) > 4
    )
      dragMoved =
        true;


    const wallHit =
      getWallPoint(
        event
      );


    if (wallHit) {

      putMachineOnWall(
        dragging.machine,
        wallHit.wall,
        wallHit.point
      );

    }

  }
);


addEventListener(
  "pointerup",
  () => {

    if (!dragging)
      return;


    const object =
      dragging;


    const clicked =
      !dragMoved;


    dragging =
      null;


    controls.enabled =
      true;


    if (
      clicked &&
      object.type ===
      "belt"
    ) {

      activeMachine =
        object.machine;


      activeGear =
        null;


      showBeltInfo(
        object.machine
      );

    }

  }
);


// ============================================================
// MACHINE STATE
// ============================================================

function updateMachineRunning(
  machine
) {

  const work =
    (
      machine.userData.answer ||
      ""
    ).trim();


  const stopped =
    (
      machine.userData.stoppedAnswer ||
      ""
    ).trim();


  machine.userData.running =
    !!work &&
    !stopped;


  return machine.userData.running;

}


// ============================================================
// INFO
// ============================================================

function showGearQuestion(
  machine
) {

  const info =
    $("info");


  if (!info)
    return;


  info.innerHTML = `

    <div class="info-title">
      ${escapeHTML(
        machine.userData.idea
      )}
    </div>


    <div class="info-question">
      Why does this idea work?
    </div>


    <textarea
      id="editText"
      placeholder="Write your answer..."
    >${escapeHTML(
      machine.userData.answer
    )}</textarea>


    <button id="saveText">
      Add gears
    </button>

  `;


  info.classList.add(
    "visible"
  );


  $("saveText").onclick =
    () => {

      machine.userData.answer =
        $("editText").value.trim();


      machine.userData.stoppedAnswer =
        "";


      updateMachineRunning(
        machine
      );


      showBeltInfo(
        machine
      );

    };

}


function showGearInfo(
  machine
) {

  showBeltInfo(
    machine
  );

}


function showBeltInfo(
  machine
) {

  const info =
    $("info");


  if (!info)
    return;


  updateMachineRunning(
    machine
  );


  info.innerHTML = `

    <div class="info-title">
      ${escapeHTML(
        machine.userData.idea
      )}
    </div>


    <div class="info-question">
      What connects you to this idea?
    </div>


    <div class="info-answer">
      ${escapeHTML(
        machine.userData.connection
      )}
    </div>


    ${
      machine.userData.answer
        ? `
          <div class="info-question">
            Why does this idea work?
          </div>

          <div class="info-answer">
            ${escapeHTML(
              machine.userData.answer
            )}
          </div>
        `
        : ""
    }


    ${
      machine.userData.stoppedAnswer
        ? `
          <div class="info-question">
            Why did this idea stop working?
          </div>

          <div class="info-answer">
            ${escapeHTML(
              machine.userData.stoppedAnswer
            )}
          </div>
        `
        : ""
    }


    <button id="editInfo">
      Edit
    </button>


    <button
      id="deleteIdea"
      class="delete"
    >
      Delete idea
    </button>

  `;


  info.classList.add(
    "visible"
  );


  $("editInfo").onclick =
    () => editBelt(
      machine
    );


  $("deleteIdea").onclick =
    () => deleteMachine(
      machine
    );

}


function editBelt(
  machine
) {

  const info =
    $("info");


  if (!info)
    return;


  info.innerHTML = `

    <div class="info-title">
      ${escapeHTML(
        machine.userData.idea
      )}
    </div>


    <div class="info-question">
      What connects you to this idea?
    </div>


    <textarea id="editText">${escapeHTML(
      machine.userData.connection
    )}</textarea>


    <div class="info-question">
      Why does this idea work?
    </div>


    <textarea
      id="editAnswer"
      placeholder="Write your answer..."
    >${escapeHTML(
      machine.userData.answer
    )}</textarea>


    <div class="info-question">
      Why did this idea stop working?
    </div>


    <textarea
      id="editStoppedAnswer"
      placeholder="Leave empty if it still works..."
    >${escapeHTML(
      machine.userData.stoppedAnswer
    )}</textarea>


    <button id="saveText">
      Save
    </button>

  `;


  info.classList.add(
    "visible"
  );


  $("saveText").onclick =
    () => {

      const connection =
        $("editText")
          .value
          .trim();


      if (!connection)
        return;


      machine.userData.connection =
        connection;


      machine.userData.count =
        countLinks(
          connection
        );


      machine.userData.answer =
        $("editAnswer")
          .value
          .trim();


      machine.userData.stoppedAnswer =
        $("editStoppedAnswer")
          .value
          .trim();


      buildBelt(
        machine
      );


      updateMachineRunning(
        machine
      );


      showBeltInfo(
        machine
      );

    };

}


// ============================================================
// DELETE / CLEAR
// ============================================================

function deleteMachine(
  machine
) {

  removePreview();

  machine.removeFromParent();


  const index =
    machines.indexOf(
      machine
    );


  if (index !== -1)
    machines.splice(
      index,
      1
    );


  if (
    activeMachine ===
    machine
  ) {

    activeMachine =
      null;

    activeGear =
      null;

  }


  $("info")?.classList.remove(
    "visible"
  );

}


function clearMachines() {

  removePreview();

  removeTypingPreview();


  while (
    machines.length
  ) {

    machines
      .pop()
      .removeFromParent();

  }


  activeMachine =
    null;


  activeGear =
    null;

}


// ============================================================
// TYPING PREVIEW
// ============================================================

function updateTypingPreview() {

  if (!link)
    return;


  const ideaInput =
    $("ideaInput");


  const connectionInput =
    $("connectionInput");


  if (
    !ideaInput ||
    !connectionInput
  )
    return;


  const idea =
    ideaInput.value.trim();


  const connection =
    connectionInput.value;


  if (!idea)
    return;


  if (!typingPreviewMachine) {

    typingPreviewMachine =
      createMachine(
        idea,
        connection,
        false
      );


    placeMachineAtCameraWall(
      typingPreviewMachine
    );

  }


  typingPreviewMachine.userData.idea =
    idea;


  typingPreviewMachine.userData.connection =
    connection;


  typingPreviewMachine.userData.count =
    countLinks(
      connection
    );


  placeMachineAtCameraWall(
    typingPreviewMachine
  );


  buildBelt(
    typingPreviewMachine
  );

}


function removeTypingPreview() {

  typingPreviewMachine
    ?.removeFromParent();


  typingPreviewMachine =
    null;

}


// ============================================================
// ADD IDEA / START
// ============================================================

$("addIdea")?.addEventListener(
  "click",
  () => {

    removeTypingPreview();


    $("ideaInput").value =
      "";


    $("connectionInput").value =
      "";


    $("connectionBox")
      .style
      .display =
      "none";


    $("info")
      .classList
      .remove(
        "visible"
      );


    $("ideaBox")
      .style
      .display =
      "block";

  }
);


$("yesIdea")?.addEventListener(
  "click",
  () => {

    $("startBox")
      .style
      .display =
      "none";


    $("ideaBox")
      .style
      .display =
      "block";

  }
);


$("noIdea")?.addEventListener(
  "click",
  () => {

    $("startBox")
      .style
      .display =
      "none";

  }
);


$("continueIdea")?.addEventListener(
  "click",
  () => {

    const idea =
      $("ideaInput")
        .value
        .trim();


    if (!idea)
      return;


    $("ideaBox")
      .style
      .display =
      "none";


    $("connectionBox")
      .style
      .display =
      "block";


    updateTypingPreview();

  }
);


$("connectionInput")?.addEventListener(
  "input",
  updateTypingPreview
);


$("createBelt")?.addEventListener(
  "click",
  () => {

    const idea =
      $("ideaInput")
        .value
        .trim();


    const connection =
      $("connectionInput")
        .value
        .trim();


    if (
      !idea ||
      !connection
    )
      return;


    removeTypingPreview();


    const machine =
      createMachine(
        idea,
        connection,
        true
      );


    if (
      !placeMachineAtCameraWall(
        machine
      )
    ) {

      machine.removeFromParent();


      const index =
        machines.indexOf(
          machine
        );


      if (index !== -1)
        machines.splice(
          index,
          1
        );


      return;

    }


    $("connectionBox")
      .style
      .display =
      "none";


    $("addIdea")
      .style
      .display =
      "block";

  }
);


// ============================================================
// SAVE JSON
// ============================================================

function saveJSON() {

  const data = {

    version:
      3,


    camera: {

      position: {

        x:
          camera.position.x,

        y:
          camera.position.y,

        z:
          camera.position.z

      },


      target: {

        x:
          controls.target.x,

        y:
          controls.target.y,

        z:
          controls.target.z

      }

    },


    machines:
      machines.map(
        machine => {

          updateMachineRunning(
            machine
          );


          return {

            idea:
              machine.userData.idea,

            connection:
              machine.userData.connection,

            answer:
              machine.userData.answer,

            stoppedAnswer:
              machine.userData.stoppedAnswer,

            count:
              machine.userData.count,

            wall:
              machine.userData.wall,


            position: {

              x:
                machine.position.x,

              y:
                machine.position.y,

              z:
                machine.position.z

            },


            quaternion: {

              x:
                machine.quaternion.x,

              y:
                machine.quaternion.y,

              z:
                machine.quaternion.z,

              w:
                machine.quaternion.w

            },


            scale:
              machine.scale.x,

            movement:
              machine.userData.movement,

            running:
              machine.userData.running,


            gears: {

              left:
                machine.userData
                  .gears
                  .left
                  ?.number
                  ??
                  null,

              right:
                machine.userData
                  .gears
                  .right
                  ?.number
                  ??
                  null

            }

          };

        }
      )

  };


  const blob =
    new Blob(
      [
        JSON.stringify(
          data,
          null,
          2
        )
      ],
      {
        type:
          "application/json"
      }
    );


  const url =
    URL.createObjectURL(
      blob
    );


  const a =
    document.createElement(
      "a"
    );


  a.href =
    url;


  a.download =
    "my-machinic-station.json";


  document.body.appendChild(
    a
  );


  a.click();


  a.remove();


  URL.revokeObjectURL(
    url
  );

}


// ============================================================
// LOAD JSON
// ============================================================

function uploadJSON() {

  const input =
    document.createElement(
      "input"
    );


  input.type =
    "file";


  input.accept =
    "application/json,.json";


  input.style.display =
    "none";


  document.body.appendChild(
    input
  );


  input.onchange =
    event => {

      const file =
        event.target.files[0];


      if (!file) {

        input.remove();

        return;

      }


      const reader =
        new FileReader();


      reader.onload =
        () => {

          try {

            loadJSON(
              JSON.parse(
                reader.result
              )
            );

          } catch (error) {

            console.error(
              error
            );


            alert(
              "Could not read this JSON file."
            );

          }


          input.remove();

        };


      reader.onerror =
        () => {

          alert(
            "Could not read this file."
          );


          input.remove();

        };


      reader.readAsText(
        file
      );

    };


  input.click();

}


$("saveJSON")?.addEventListener(
  "click",
  saveJSON
);


$("uploadJSON")?.addEventListener(
  "click",
  uploadJSON
);


// ============================================================
// LOAD JSON DATA
// ============================================================

function loadJSON(
  data
) {

  if (
    !data ||
    !Array.isArray(
      data.machines
    )
  ) {

    alert(
      "This is not a valid My Machinic Station JSON file."
    );


    return;

  }


  clearMachines();


  if (
    data.camera?.position
  ) {

    const p =
      data.camera.position;


    camera.position.set(

      Number(p.x) || 0,

      Number(p.y) || 0,

      Number(p.z) || 7

    );

  }


  if (
    data.camera?.target
  ) {

    const t =
      data.camera.target;


    controls.target.set(

      Number(t.x) || 0,

      Number(t.y) || 0,

      Number(t.z) || 0

    );

  }


  for (
    const saved of
    data.machines
  ) {

    const machine =
      createMachine(
        saved.idea || "",
        saved.connection || "",
        true
      );


    machine.userData.answer =
      saved.answer || "";


    machine.userData.stoppedAnswer =
      saved.stoppedAnswer || "";


    machine.userData.wall =
      saved.wall ?? 0;


    machine.userData.movement =
      Number(
        saved.movement
      ) || 0;


    machine.scale.setScalar(
      Number(
        saved.scale
      ) || 1.6
    );


    const p =
      saved.position ||
      {};


    machine.position.set(

      Number(p.x) || 0,

      Number(p.y) || 0,

      Number(p.z) || 0

    );


    if (
      saved.quaternion
    ) {

      const q =
        saved.quaternion;


      machine.quaternion.set(

        Number(q.x) || 0,

        Number(q.y) || 0,

        Number(q.z) || 0,

        Number(q.w) || 1

      );

    }


    machine.userData.count =
      countLinks(
        machine.userData.connection
      );


    buildBelt(
      machine
    );


    if (
      saved.gears
    ) {

      restoreGear(
        machine,
        saved.gears.left,
        "left"
      );


      restoreGear(
        machine,
        saved.gears.right,
        "right"
      );

    }


    updateMachineRunning(
      machine
    );

  }


  controls.update();

}


// ============================================================
// ANIMATION
// ============================================================

function animate() {

  requestAnimationFrame(
    animate
  );


  for (
    const machine of
    machines
  ) {

    if (
      !updateMachineRunning(
        machine
      )
    )
      continue;


    machine.userData.movement +=
      speed;


    const {

      count,

      radiusY,

      radiusZ,

      movement

    } =
      machine.userData;


    machine.children[0]
      .children
      .forEach(
        (chainLink, index) => {

          const angle =
            index /
            count *
            Math.PI *
            2 +
            movement;


          chainLink.position.set(

            0,

            0.4 +
            Math.cos(angle) *
            radiusY,

            Math.sin(angle) *
            radiusZ

          );


          chainLink.rotation.x =
            -Math.atan2(

              -Math.sin(angle) *
              radiusY,

              Math.cos(angle) *
              radiusZ

            );

        }
      );


    for (
      const side of [
        "left",
        "right"
      ]
    ) {

      const data =
        machine.userData.gears[side];


      if (data) {

        data.object.rotation.x +=
          speed *
          count /
          8;

      }

    }

  }


  controls.update();


  renderer.render(
    scene,
    camera
  );

}


animate();


// ============================================================
// RESIZE
// ============================================================

addEventListener(
  "resize",
  () => {

    camera.aspect =
      innerWidth /
      innerHeight;


    camera.updateProjectionMatrix();


    renderer.setSize(
      innerWidth,
      innerHeight
    );

  }
);