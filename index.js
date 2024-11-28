// Create the Scene and Engine
const canvas = document.getElementById("renderCanvas");
const engine = new BABYLON.Engine(canvas, true);
const scene = new BABYLON.Scene(engine);

// Set up VR
var vrHelper = scene.createDefaultVRExperience({createDeviceOrientationCamera:false}); 

// Create camera
const camera = new BABYLON.UniversalCamera(
    "camera",
    BABYLON.Vector3.Zero(),
    scene
);
camera.attachControl(canvas, true);

// Render loop
engine.runRenderLoop(() => {
    scene.render();
});
window.addEventListener("resize", () => {
    engine.resize();
});

// Asset paths - update these to your actual asset locations
const assetPaths = {
    artAndTech: "./assets/art_and_tech_space_small.jpg",
    losAngeles: "./assets/forFacebook-8K-LA.jpg",
    athens: "./assets/Athens-8K.jpg",
    lakeTahao: "./assets/LakeTahao-10K.jpg",
    lakeTahaoVideo: "./assets/LakeTahao-8K-short-360.mp4"
};

// Create the PhotoDome
let dome = new BABYLON.PhotoDome(
    "sphere",
    // assetPaths.losAngeles,
    assetPaths.artAndTech,
    {
        resolution: 64,
        size: 1000,
        useDirectMapping: false
    },
    scene
);
dome.imageMode = BABYLON.PhotoDome.MODE_MONOSCOPIC;

vrHelper.enableInteractions();

// Create GUI
const advancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");

// Create stack panel
const stackPanel = new BABYLON.GUI.StackPanel();
stackPanel.width = "300px";
stackPanel.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
stackPanel.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_CENTER;
advancedTexture.addControl(stackPanel);

// Button creation helper
const createButton = (name, text) => {
    const button = BABYLON.GUI.Button.CreateSimpleButton(name, text);
    button.width = "200px";
    button.height = "100px";
    button.paddingBottom = "30px";
    button.cornerRadius = 10;
    button.shadowColor = "black";
    button.shadowOffsetX = 2;
    button.shadowOffsetY = 2;
    button.shadowBlur = 30;
    button.color = "white";
    button.thickness = 0;
    button.background = "gray";
    button.alpha = 0.5;
    return button;
};

// Create buttons
// const button1 = createButton("button1", "Los Angeles");
const button1 = createButton("button1", "EPO A&T space");

// Button click handlers
button1.onPointerUpObservable.add(() => {
    updateButtonThickness(button1);
//    transition(assetPaths.losAngeles);
    transition(assetPaths.artAndTech);
});


// Add buttons to panel
// [button1, button2, button3, button4].forEach(button => stackPanel.addControl(button));
[button1].forEach(button => stackPanel.addControl(button));

// Helper function to update button thickness
function updateButtonThickness(activeButton) {
    // [button1, button2, button3, button4].forEach(button => {
    [button1].forEach(button => {
        button.thickness = button === activeButton ? 2 : 0;
    });
}

// Create animations
const createAnimation = (name, targetProperty, frameRate, type, loopMode) => {
    return new BABYLON.Animation(
        name,
        targetProperty,
        frameRate,
        type,
        loopMode
    );
};

const fadeOutAnimation = createAnimation(
    "fadeOut",
    "material.alpha",
    40,
    BABYLON.Animation.ANIMATIONTYPE_FLOAT,
    BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT
);

fadeOutAnimation.setKeys([
    { frame: 0, value: 1 },
    { frame: 120, value: 0 }
]);

const fadeInAnimation = createAnimation(
    "fadeIn",
    "material.alpha",
    40,
    BABYLON.Animation.ANIMATIONTYPE_FLOAT,
    BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT
);

fadeInAnimation.setKeys([
    { frame: 0, value: 0 },
    { frame: 120, value: 1 }
]);

// Transition functions
const transition = (image) => {
    let anim = scene.beginDirectAnimation(
        dome.mesh,
        [fadeOutAnimation],
        0,
        120,
        false
    );
    anim.onAnimationEnd = () => loadNewTexture(image);
};

const transitionVideo = (video) => {
    let anim = scene.beginDirectAnimation(
        dome.mesh,
        [fadeOutAnimation],
        0,
        120,
        false
    );
    anim.onAnimationEnd = () => loadNewVideoTexture(video);
};

const loadNewTexture = (image) => {
    const newTexture = new BABYLON.Texture(image, scene);
    newTexture.onLoadObservable.add(() => {
        dome.dispose();
        dome = new BABYLON.PhotoDome(
            "sphere",
            image,
            {
                resolution: 128,
                size: 1000,
                useDirectMapping: false
            },
            scene
        );
        dome.mesh.material.alpha = 0;
        dome.imageMode = BABYLON.PhotoDome.MODE_TOPBOTTOM;
        scene.beginDirectAnimation(
            dome.mesh,
            [fadeInAnimation],
            0,
            120,
            false
        );
    });
};

const loadNewVideoTexture = (video) => {
    const newTexture = new BABYLON.Texture(video, scene);
    newTexture.onLoadObservable.add(() => {
        dome.dispose();
        dome = new BABYLON.VideoDome(
            "videoSphere",
            video,
            {
                resolution: 64,
                size: 1000,
                clickToPlay: true,
                useDirectMapping: false
            },
            scene
        );
        dome.mesh.material.alpha = 0;
        dome.imageMode = BABYLON.PhotoDome.MODE_TOPBOTTOM;
        scene.beginDirectAnimation(
            dome.mesh,
            [fadeInAnimation],
            0,
            120,
            false
        );
    });
};