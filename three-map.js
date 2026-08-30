import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';


// ============================================================
// CANVAS
// ============================================================

const canvas =
    document.getElementById('three-canvas');

if (!canvas) {

    throw new Error(
        'Canvas #three-canvas was not found.'
    );

}


// ============================================================
// SCENE
// ============================================================

const scene =
    new THREE.Scene();

scene.background =
    new THREE.Color(0x000000);


// ============================================================
// CAMERA
// ============================================================

const camera =
    new THREE.PerspectiveCamera(
        45,
        window.innerWidth / window.innerHeight,
        0.001,
        1000
    );

camera.position.set(
    0,
    4.5,
    0
);

camera.lookAt(
    0,
    0,
    0
);


// ============================================================
// RENDERER
// ============================================================

const renderer =
    new THREE.WebGLRenderer({

        canvas: canvas,

        antialias: true,

        alpha: false

    });

renderer.setSize(
    window.innerWidth,
    window.innerHeight,
    false
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
    1;


// ============================================================
// LIGHTING
// ============================================================

scene.add(
    new THREE.AmbientLight(
        0xffffff,
        0.28
    )
);


const directionalLight =
    new THREE.DirectionalLight(
        0xffffff,
        0.65
    );

directionalLight.position.set(
    2,
    6,
    2
);

scene.add(
    directionalLight
);


// ============================================================
// WORLD
// ============================================================

const world =
    new THREE.Group();

scene.add(
    world
);


// ============================================================
// PROJECTS
// ============================================================



const projects = [


    {
        title: 'My Machinic Station',

        description: 'My Machinic Station is a space where ideas are metaphorized through machinic assemblages.',

        image: 'Projects/MyMachinicStation/MyMachinicStation.png',

        url: 'Projects/MyMachinicStation/index.html',

        date:
            'August 14, 2026'
    },

    {
        title:
            'Poem Iris',

        date:
            'July 11, 2026',

        description:
            'A radial coordinate system for short poems',

        image:
            'Projects/PoemIris/Poem-Iris.png',

        url:
            'Projects/PoemIris/PoemIris-App/index.html'
    },


    {
        title:
            'Partisan Polarization on X',

        description:
            'This project traces the geometry of social media networks, revealing how information and belief flow through echo chambers. Through interactive visualization, users experience these dynamics as immersive spaces that make digital interactions visible.',

        image:
            'Projects/ymr.x/ymr.jpg',

        url:
            'Projects/ymr.x/ymrx.html',

        date:
            'September 17, 2025'
    },


    {
        title:
            'Speaking Through the Citations: Wikipedia and Epistemic Traceability',

        description:
            'How does anonymity under the “NPOV” (neutral point of view) policy redistribute traceability and epistemic responsibility in Wikipedia’s knowledge production?',

        image:
            'Projects/Wikipedia and Epistemic Traceability/Visualizations/Diagrams-w-labels.jpg',

        url:
            'Projects/Wikipedia and Epistemic Traceability/Wikipedia and Epistemic Traceability.html',

        date:
            'April 20, 2026'
    },


    {
        title:
            'How Unity Sells and Polarized Diversity Fractures Through Social Media',

        description:
            'Representation and Polarization in Iran 2026',

        image:
            'Projects/Feb22.2026/Lindsey-LionSunFlag2.jpeg',

        url:
            'Projects/Feb22.2026/feb22.2026.html',

        date:
            'February 22, 2026'
    },


    {
        title:
            'Observing Iran on X: Munich demonstration on February 14',

        description:
            'A Social Network Analysis of Online Discourses Around the Munich February 14 Demonstration',

        image:
            'images/Retweets_HighClustering1.jpg',

        url:
            'Projects/Feb19.2026/feb19.2026.html',

        date:
            'February 19, 2026'
    },


    {
        title:
            'DeTerriTales',

        description:
            'A Critical Cartography Practice',

        image:
            'Projects/DeTerriTales/DeTerriTales Map.jpg',

        url:
            'Projects/DeTerriTales/DeTerriTales.html',

        date:
            'July 15, 2025'
    }

];


// ============================================================
// STATE
// ============================================================

let scene2 = null;

let scene2Map = null;

let sourceTile1 = null;

let sourceTile2 = null;

let hoveredSphere = null;

let projectPanel = null;

let scene2Ready = false;

const projectLabels =
    new Map();


// ============================================================
// MAP SETTINGS
// ============================================================

const TILE_SIZE =
    4.2;

const GRID_SIZE =
    3;

const MAP_SIZE =
    TILE_SIZE *
    GRID_SIZE;


const tilePattern = [

    ['tile1', 'tile2', 'tile1'],

    ['tile2', 'tile1', 'tile2'],

    ['tile1', 'tile2', 'tile1']

];


// ============================================================
// NAVIGATION
// ============================================================

const scene2Navigation = {

    speed:
        2.2,

    edgeSize:
        0.12,

    verticalEdgeSize:
        0.22,

    x:
        0,

    y:
        0,

    maxX:
        Math.max(
            0,
            (MAP_SIZE - 4.5) / 2
        ),

    maxY:
        Math.max(
            0,
            (MAP_SIZE - 4.5) / 2
        )

};


const scene2Mouse = {

    x:
        0.5,

    y:
        0.5,

    active:
        false

};


// ============================================================
// LOADER / RAYCASTER
// ============================================================

const loader =
    new GLTFLoader();

const raycaster =
    new THREE.Raycaster();

const mouse =
    new THREE.Vector2();


// ============================================================
// PROJECT PANEL
// ============================================================

function createProjectPanel() {

    if (projectPanel)
        return;


    projectPanel =
        document.createElement(
            'div'
        );

    projectPanel.id =
        'project-hover-panel';


    projectPanel.innerHTML = `

        <div id="project-panel-image-wrap">

            <img
                id="project-panel-image"
                alt=""
            >

        </div>


        <div id="project-panel-content">

            <div id="project-panel-title"></div>

            <div id="project-panel-description"></div>

            <div
                id="project-panel-hint"
                style="
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    gap: 20px;
                "
            >

                <span>
                    CLICK TO ENTER PROJECT
                </span>

                <span
                    id="project-panel-date"
                    style="
                        margin-left: auto;
                        white-space: nowrap;
                    "
                ></span>

            </div>

        </div>

    `;


    document.body.appendChild(
        projectPanel
    );

}


function showProjectPanel(
    sphere
) {

    if (
        !sphere?.userData?.project
    ) {

        hideProjectPanel();

        return;

    }


    createProjectPanel();


    const project =
        sphere.userData.project;


    document.getElementById(
        'project-panel-title'
    ).textContent =
        project.title;


    document.getElementById(
        'project-panel-description'
    ).textContent =
        project.description || '';


    document.getElementById(
        'project-panel-date'
    ).textContent =
        project.date || '';


    const image =
        document.getElementById(
            'project-panel-image'
        );


    image.src =
        project.image || '';


    image.alt =
        project.title;


    positionProjectPanel(
        sphere
    );


    projectPanel.classList.add(
        'visible'
    );

}


function hideProjectPanel() {

    if (projectPanel) {

        projectPanel.classList.remove(
            'visible'
        );

    }

}


// ============================================================
// SPHERE SCREEN POSITION
// ============================================================

function getSphereScreenPosition(
    sphere
) {

    const position =
        new THREE.Vector3();


    sphere.getWorldPosition(
        position
    );


    position.project(
        camera
    );


    return {

        x:
            (position.x * 0.5 + 0.5) *
            window.innerWidth,

        y:
            (-position.y * 0.5 + 0.5) *
            window.innerHeight

    };

}


// ============================================================
// PANEL POSITION
// ============================================================

function positionProjectPanel(
    sphere
) {

    if (
        !projectPanel ||
        !sphere
    )
        return;


    const p =
        getSphereScreenPosition(
            sphere
        );


    const width =
        320;

    const height =
        320;

    const gap =
        30;


    let left =
        p.x + gap;


    let top =
        p.y - height / 2;


    if (
        left + width >
        window.innerWidth - 12
    ) {

        left =
            p.x -
            width -
            gap;

    }


    top =
        Math.max(
            12,
            Math.min(
                top,
                window.innerHeight -
                height -
                12
            )
        );


    projectPanel.style.left =
        `${left}px`;

    projectPanel.style.top =
        `${top}px`;

}


function updateProjectPanel() {

    if (
        projectPanel &&
        hoveredSphere
    ) {

        positionProjectPanel(
            hoveredSphere
        );

    }

}


// ============================================================
// PROJECT LABEL
// ============================================================

function createProjectLabel(
    sphere
) {

    if (
        !sphere?.userData?.project
    )
        return;


    if (
        projectLabels.has(
            sphere
        )
    )
        return;


    const label =
        document.createElement(
            'div'
        );


    label.className =
        'project-label';


    label.textContent =
        sphere.userData.project.title;


    label.style.textAlign =
        'center';


    label.style.transform =
        'translate3d(-50%, 0, 0)';


    document.body.appendChild(
        label
    );


    projectLabels.set(
        sphere,
        label
    );

}


// ============================================================
// UPDATE LABEL POSITIONS
// ============================================================

function updateProjectLabels() {

    projectLabels.forEach(
        (
            label,
            sphere
        ) => {

            if (
                !scene2 ||
                !scene2.visible ||
                !sphere ||
                !sphere.visible ||
                !sphere.userData.project ||
                window.mapStoryProgress < 0.35
            ) {

                label.style.opacity =
                    '0';

                return;

            }


            const p =
                getSphereScreenPosition(
                    sphere
                );


            label.style.left =
                `${p.x}px`;


            label.style.top =
                `${p.y + 35}px`;


            if (
                p.x < -100 ||
                p.x > window.innerWidth + 100 ||
                p.y < -100 ||
                p.y > window.innerHeight + 100
            ) {

                label.style.opacity =
                    '0';

            } else {

                label.style.opacity =
                    '1';

            }

        }
    );

}


// ============================================================
// SPHERE PREPARATION
// ============================================================

function prepareProjectSphere(
    sphere
) {

    if (!sphere)
        return;


    sphere.userData.isProjectSphere =
        true;

    sphere.userData.hovered =
        false;

}


// ============================================================
// GLOW SPRITE
// ============================================================

function addSphereGlowSprite(
    sphere
) {

    if (
        sphere.userData.hasGlowSprite
    )
        return;


    sphere.userData.hasGlowSprite =
        true;


    const size =
        256;


    const glowCanvas =
        document.createElement(
            'canvas'
        );


    glowCanvas.width =
        size;

    glowCanvas.height =
        size;


    const ctx =
        glowCanvas.getContext(
            '2d'
        );


    if (!ctx)
        return;


    const gradient =
        ctx.createRadialGradient(
            size / 2,
            size / 2,
            0,
            size / 2,
            size / 2,
            size / 2
        );


    gradient.addColorStop(
        0,
        'rgba(255,30,30,.42)'
    );

    gradient.addColorStop(
        0.25,
        'rgba(255,20,20,.22)'
    );

    gradient.addColorStop(
        0.6,
        'rgba(255,0,0,.08)'
    );

    gradient.addColorStop(
        1,
        'rgba(255,0,0,0)'
    );


    ctx.fillStyle =
        gradient;


    ctx.fillRect(
        0,
        0,
        size,
        size
    );


    const texture =
        new THREE.CanvasTexture(
            glowCanvas
        );


    texture.colorSpace =
        THREE.SRGBColorSpace;


    const material =
        new THREE.SpriteMaterial({

            map:
                texture,

            color:
                0xff2020,

            transparent:
                true,

            opacity:
                0.75,

            depthWrite:
                false,

            blending:
                THREE.AdditiveBlending

        });


    const sprite =
        new THREE.Sprite(
            material
        );


    sprite.scale.set(
        1.15,
        1.15,
        1.15
    );


    sphere.add(
        sprite
    );

}


// ============================================================
// SPHERE LIGHT
// ============================================================

function addSphereLight(
    sphere
) {

    const glowLight =
        new THREE.PointLight(
            0xff2020,
            3.35,
            1.9
        );


    glowLight.position.set(
        0,
        -10,
        0
    );


    sphere.add(
        glowLight
    );


    addSphereGlowSprite(
        sphere
    );

}


// ============================================================
// LOAD GLB
// ============================================================

loader.load(

    './Scene2.glb',

    function (gltf) {

        console.log(
            'Scene2.glb loaded successfully.'
        );


        scene2 =
            gltf.scene;
        scene2.traverse((object) => {

            if (!object.isMesh) return;

            console.log(
                'MESH:',
                object.name,
                'MATERIAL:',
                object.material?.name,
                'MAP:',
                object.material?.map
            );

        });


        scene2.visible =
            false;


        scene2.traverse(
            object => {

                if (!object.isMesh)
                    return;


                object.castShadow =
                    true;

                object.receiveShadow =
                    true;

            }
        );


        world.add(
            scene2
        );


        sourceTile1 =
            buildSourceTile(

                scene2,

                'Tile_1_MESH',

                [
                    'Sphere_11_MESH',
                    'Sphere_12_MESH',
                    'Sphere_13_MESH'
                ],

                'Source_Tile_1'

            );


        sourceTile2 =
            buildSourceTile(

                scene2,

                'Tile_2_MESH',

                [
                    'Sphere_21_MESH',
                    'Sphere_22_MESH',
                    'Sphere_23_MESH'
                ],

                'Source_Tile_2'

            );


        if (
            !sourceTile1 ||
            !sourceTile2
        ) {

            console.error(
                'FAILED TO BUILD SOURCE TILES.'
            );

            return;

        }


        scene2Map =
            new THREE.Group();


        scene2.add(
            scene2Map
        );


        buildScene2Map();


        assignProjects();


        createProjectPanel();


        scene2Ready =
            true;


        startScene2();

    },

    function (progress) {

        if (progress.total) {

            console.log(
                `Scene2.glb loading: ${Math.round(
                    progress.loaded /
                    progress.total *
                    100
                )}%`
            );

        }

    },

    function (error) {

        console.error(
            'Scene2.glb ERROR:',
            error
        );

    }

);


// ============================================================
// BUILD SOURCE TILE
// ============================================================

function buildSourceTile(
    root,
    tileName,
    sphereNames,
    groupName
) {

    const tile =
        root.getObjectByName(
            tileName
        );


    if (!tile) {

        console.error(
            'Missing tile:',
            tileName
        );

        return null;

    }


    const spheres =
        sphereNames.map(
            name =>
                root.getObjectByName(
                    name
                )
        );


    if (
        spheres.some(
            sphere =>
                !sphere
        )
    ) {

        console.error(
            'Missing sphere in',
            groupName
        );

        return null;

    }


    const group =
        new THREE.Group();


    group.name =
        groupName;


    root.add(
        group
    );


    group.attach(
        tile
    );


    spheres.forEach(
        sphere => {

            group.attach(
                sphere
            );

        }
    );


    group.updateMatrixWorld(
        true
    );


    const box =
        new THREE.Box3()
            .setFromObject(
                tile
            );


    const center =
        new THREE.Vector3();


    box.getCenter(
        center
    );


    center.applyMatrix4(

        new THREE.Matrix4()
            .copy(
                group.matrixWorld
            )
            .invert()

    );


    group.position.sub(
        center
    );


    group.updateMatrixWorld(
        true
    );


    spheres.forEach(
        sphere => {

            sphere.userData.isProjectSphere =
                true;


            sphere.userData.baseY =
                sphere.position.y;


            prepareProjectSphere(
                sphere
            );


            addSphereLight(
                sphere
            );

        }
    );


    group.visible =
        false;


    return group;

}


// ============================================================
// BUILD MAP
// ============================================================

function buildScene2Map() {

    scene2Map.clear();


    for (
        let row = 0;
        row < GRID_SIZE;
        row++
    ) {

        for (
            let column = 0;
            column < GRID_SIZE;
            column++
        ) {

            const tileType =
                tilePattern[row][column];


            const source =
                tileType === 'tile1'
                    ? sourceTile1
                    : sourceTile2;


            const tile =
                source.clone(true);


            tile.visible =
                true;


            tile.position.set(

                (column - 1) *
                TILE_SIZE,

                0,

                (1 - row) *
                TILE_SIZE

            );


            markClonedTile(
                tile,
                tileType,
                row,
                column
            );


            scene2Map.add(
                tile
            );

        }

    }

}


// ============================================================
// MARK CLONED TILE
// ============================================================

function markClonedTile(
    tile,
    tileType,
    row,
    column
) {

    tile.traverse(
        object => {

            if (
                object.userData &&
                object.name.includes(
                    'Sphere_'
                )
            ) {

                object.userData.isProjectSphere =
                    true;


                object.userData.project =
                    null;


                object.userData.projectIndex =
                    -1;


                object.userData.tileType =
                    tileType;


                object.userData.mapRow =
                    row;


                object.userData.mapColumn =
                    column;


                object.userData.baseY =
                    object.position.y;

            }

        }
    );

}


// ============================================================
// GET PROJECT SPHERES
// ============================================================

function getProjectSpheres() {

    const spheres =
        [];


    if (!scene2Map)
        return spheres;


    scene2Map.traverse(
        object => {

            if (
                object.userData
                    ?.isProjectSphere
            ) {

                spheres.push(
                    object
                );

            }

        }
    );


    return spheres;

}


// ============================================================
// ASSIGN PROJECTS
// ============================================================

function assignProjects() {

    const spheres =
        getProjectSpheres();


    spheres.forEach(
        sphere => {

            sphere.visible =
                false;


            sphere.userData.project =
                null;


            sphere.userData.projectIndex =
                -1;

        }
    );


    spheres.sort(
        (a, b) => {

            const distance =
                sphere => {

                    const row =
                        sphere.userData.mapRow;

                    const column =
                        sphere.userData.mapColumn;


                    return Math.hypot(
                        row - 1,
                        column - 1
                    );

                };


            return (
                distance(a) -
                distance(b)
            );

        }
    );


    const count =
        Math.min(
            projects.length,
            spheres.length
        );


    for (
        let i = 0;
        i < count;
        i++
    ) {

        const sphere =
            spheres[i];


        sphere.visible =
            true;


        sphere.userData.project =
            projects[i];


        sphere.userData.projectIndex =
            i;


        createProjectLabel(
            sphere
        );

    }

}


// ============================================================
// START SCENE
// ============================================================

function startScene2() {

    if (
        !scene2Ready ||
        !scene2
    )
        return;


    scene2.visible =
        true;


    scene2.scale.setScalar(
        1
    );


    scene2Navigation.x =
        0;

    scene2Navigation.y =
        0;


    camera.position.set(
        0,
        4.5,
        0
    );


    camera.lookAt(
        0,
        0,
        0
    );


    assignProjects();

}


// ============================================================
// MOUSE NAVIGATION
// ============================================================

renderer.domElement.addEventListener(
    'mousemove',
    function (event) {

        if (
            !scene2?.visible
        )
            return;


        const rect =
            renderer.domElement
                .getBoundingClientRect();


        scene2Mouse.x =
            (
                event.clientX -
                rect.left
            ) /
            rect.width;


        scene2Mouse.y =
            (
                event.clientY -
                rect.top
            ) /
            rect.height;


        scene2Mouse.active =
            true;

    }
);


renderer.domElement.addEventListener(
    'mouseleave',
    function () {

        scene2Mouse.active =
            false;


        if (hoveredSphere) {

            setSphereHover(
                hoveredSphere,
                false
            );


            hoveredSphere =
                null;

        }

    }
);


// ============================================================
// MAP EDGE NAVIGATION
// ============================================================

function updateScene2Navigation(
    delta
) {

    if (
        !scene2?.visible ||
        !scene2Mouse.active
    )
        return;


    let moveX =
        0;

    let moveZ =
        0;


    const horizontalEdge =
        scene2Navigation.edgeSize;

    const verticalEdge =
        scene2Navigation.verticalEdgeSize;


    if (
        scene2Mouse.x <
        horizontalEdge
    ) {

        moveX =
            -(
                horizontalEdge -
                scene2Mouse.x
            ) /
            horizontalEdge;

    }


    if (
        scene2Mouse.x >
        1 - horizontalEdge
    ) {

        moveX =
            (
                scene2Mouse.x -
                (1 - horizontalEdge)
            ) /
            horizontalEdge;

    }


    if (
        scene2Mouse.y <
        verticalEdge
    ) {

        moveZ =
            -(
                verticalEdge -
                scene2Mouse.y
            ) /
            verticalEdge;

    }


    if (
        scene2Mouse.y >
        1 - verticalEdge
    ) {

        moveZ =
            (
                scene2Mouse.y -
                (1 - verticalEdge)
            ) /
            verticalEdge;

    }


    const amount =
        scene2Navigation.speed *
        delta;


    scene2Navigation.x +=
        moveX *
        amount;


    scene2Navigation.y +=
        moveZ *
        amount;


    scene2Navigation.x =
        THREE.MathUtils.clamp(
            scene2Navigation.x,
            -scene2Navigation.maxX,
            scene2Navigation.maxX
        );


    scene2Navigation.y =
        THREE.MathUtils.clamp(
            scene2Navigation.y,
            -scene2Navigation.maxY,
            scene2Navigation.maxY
        );


    camera.position.set(
        scene2Navigation.x,
        4.5,
        scene2Navigation.y
    );


    camera.lookAt(
        scene2Navigation.x,
        0,
        scene2Navigation.y
    );

}


// ============================================================
// FIND PROJECT SPHERE
// ============================================================

function findProjectSphere(
    object
) {

    while (
        object &&
        object !== scene2Map
    ) {

        if (

            object.userData
                ?.isProjectSphere &&

            object.userData
                ?.project

        ) {

            return object;

        }


        object =
            object.parent;

    }


    return null;

}


// ============================================================
// HOVER
// ============================================================

function setSphereHover(
    sphere,
    hovered
) {

    if (!sphere)
        return;


    sphere.userData.hovered =
        hovered;


    sphere.position.y =
        sphere.userData.baseY +
        (
            hovered
                ? 0.18
                : 0
        );


    if (hovered) {

        showProjectPanel(
            sphere
        );

    } else {

        hideProjectPanel();

    }

}


// ============================================================
// RAYCAST HOVER
// ============================================================

renderer.domElement.addEventListener(
    'mousemove',
    function (event) {

        if (
            !scene2?.visible ||
            !scene2Map
        )
            return;


        const rect =
            renderer.domElement
                .getBoundingClientRect();


        mouse.x =
            (
                (
                    event.clientX -
                    rect.left
                ) /
                rect.width
            ) *
            2 -
            1;


        mouse.y =
            -(
                (
                    event.clientY -
                    rect.top
                ) /
                rect.height
            ) *
            2 +
            1;


        raycaster.setFromCamera(
            mouse,
            camera
        );


        const hits =
            raycaster.intersectObject(
                scene2Map,
                true
            );


        let found =
            null;


        for (
            const hit of hits
        ) {

            const sphere =
                findProjectSphere(
                    hit.object
                );


            if (
                sphere?.visible
            ) {

                found =
                    sphere;

                break;

            }

        }


        if (
            hoveredSphere &&
            hoveredSphere !== found
        ) {

            setSphereHover(
                hoveredSphere,
                false
            );

        }


        hoveredSphere =
            found;


        if (hoveredSphere) {

            setSphereHover(
                hoveredSphere,
                true
            );


            renderer.domElement.style.cursor =
                'pointer';

        } else {

            renderer.domElement.style.cursor =
                'default';


            hideProjectPanel();

        }

    }
);


// ============================================================
// CLICK
// ============================================================

renderer.domElement.addEventListener(
    'click',
    function () {

        const project =
            hoveredSphere
                ?.userData
                ?.project;


        if (
            project?.url
        ) {

            window.location.href =
                project.url;

        }

    }
);


// ============================================================
// ANIMATION
// ============================================================

let previousTime =
    performance.now();


function animate(
    time
) {

    requestAnimationFrame(
        animate
    );


    const delta =
        Math.min(
            (
                time -
                previousTime
            ) /
            1000,
            0.05
        );


    previousTime =
        time;


    updateScene2Navigation(
        delta
    );


    updateProjectLabels();


    updateProjectPanel();


    renderer.render(
        scene,
        camera
    );

}


animate(
    performance.now()
);


// ============================================================
// RESIZE
// ============================================================

window.addEventListener(
    'resize',
    function () {

        const width =
            window.innerWidth;

        const height =
            window.innerHeight;


        camera.aspect =
            width /
            height;


        camera.updateProjectionMatrix();


        renderer.setSize(
            width,
            height,
            false
        );


        updateProjectPanel();

        updateProjectLabels();

    }
);