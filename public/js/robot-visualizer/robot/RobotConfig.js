/**
 * RobotConfig - 6DOF ?? ?? ????
 * ?? ??, ??, ?????, UI ??? ???? ????.
 */

export const ROBOT_SCALE = 1.0;
export const BASE_RADIUS = 40;
export const RADIUS_REDUCTION_FACTORS = [0.625, 0.8, 0.75, 0.67, 0.8, 0.75];

export const BASE_HEIGHT = 20;
export const STANDARD_JOINT_HEIGHT = 30;
export const MAIN_ARM_LENGTH = 150;
export const CONNECTOR_HEIGHT = 20;

export const JOINT_RANGES = {
    BASE_ROTATION: [-180, 180],
    ARM_PITCH: [-90, 90],
    WRIST_ROTATION: [-180, 180]
};

export const JOINT_AXES = {
    j1: 'z',
    j2: 'y',
    j3: 'y',
    j4: 'z',
    j5: 'y',
    j6: 'z'
};

export const LINK_LENGTHS = {
    BASE_TO_J1: 35,
    J1_ARM_LENGTH: 50,
    J1_TO_J2: 50,
    J2_MAIN_ARM: 150,
    J2_TO_J3: 40,
    J3_TO_J4: 45,
    J4_TO_J5: 30,
    J5_TO_J6: 25,
    GRIPPER_LENGTH: 15
};

export const ROBOT_PHYSICAL_PARAMS = {
    scale: ROBOT_SCALE,
    dhParameters: {
        j1: { a: 0, alpha: 0, d: LINK_LENGTHS.BASE_TO_J1, theta: 0 },
        j2: { a: LINK_LENGTHS.J1_TO_J2, alpha: -90, d: 0, theta: 0 },
        j3: { a: LINK_LENGTHS.J2_MAIN_ARM, alpha: 0, d: 0, theta: 0 },
        j4: { a: LINK_LENGTHS.J2_TO_J3 + LINK_LENGTHS.J3_TO_J4, alpha: -90, d: 0, theta: 0 },
        j5: { a: 0, alpha: 90, d: LINK_LENGTHS.J4_TO_J5, theta: 0 },
        j6: { a: 0, alpha: 0, d: LINK_LENGTHS.J5_TO_J6, theta: 0 }
    }
};

export const VISUAL_PARAMS = {
    baseRadius: {
        top: 25,
        bottom: BASE_RADIUS
    },
    jointRadii: {
        j1: 25,
        j2: 20,
        j3: 15,
        j4: 10,
        j5: 8,
        j6: 6
    },
    heights: {
        base: BASE_HEIGHT,
        joint: STANDARD_JOINT_HEIGHT,
        j2Body: 40,
        j4Body: 20,
        j5Body: 15,
        j6Body: 5,
        j1Vertical: LINK_LENGTHS.J1_ARM_LENGTH,
        j1Horizontal: CONNECTOR_HEIGHT,
        j2Main: MAIN_ARM_LENGTH,
        j2End: 20,
        j3Link: 30,
        j4Link: 15,
        j5Link: 25,
        gripperBase: 4,
        finger: { width: 2, height: 10, depth: 1 },
        markerRadius: 1.5
    },
    cylinderSegments: 16,
    sphereSegments: { width: 8, height: 6 }
};

export const MOTION_LIMITS = {
    jointRanges: {
        j1: JOINT_RANGES.BASE_ROTATION,
        j2: JOINT_RANGES.ARM_PITCH,
        j3: JOINT_RANGES.ARM_PITCH,
        j4: JOINT_RANGES.WRIST_ROTATION,
        j5: JOINT_RANGES.WRIST_ROTATION,
        j6: JOINT_RANGES.WRIST_ROTATION
    },
    velocityLimits: {
        j1: 1.5,
        j2: 1.5,
        j3: 1.5,
        j4: 2.0,
        j5: 2.0,
        j6: 2.0
    },
    accelerationLimits: {
        j1: 2.0,
        j2: 2.0,
        j3: 2.0,
        j4: 3.0,
        j5: 3.0,
        j6: 3.0
    }
};

export const COORDINATE_SYSTEM = {
    base: {
        position: { x: 0, y: 0, z: 0 },
        orientation: { x: 0, y: 0, z: 0 }
    },
    jointAxes: JOINT_AXES,
    rotationDirection: {
        positive: 'counterclockwise',
        negative: 'clockwise'
    }
};

export const JOINT_LAYOUT = {
    base: {
        position: { x: 0, y: 0, z: VISUAL_PARAMS.heights.base / 2 }
    },
    j1: {
        position: { x: 0, y: 0, z: LINK_LENGTHS.BASE_TO_J1 },
        children: {
            vertical: { position: { x: 0, y: 0, z: 75 } },
            horizontal: { position: { x: 0, y: LINK_LENGTHS.J1_TO_J2 / 2, z: 80 } }
        }
    },
    j2: {
        parentOffset: { x: 0, y: LINK_LENGTHS.J1_TO_J2, z: 80 },
        position: { x: 0, y: 0, z: 0 },
        children: {
            main: { position: { x: 0, y: 0, z: 80 } },
            end: { position: { x: 0, y: -15, z: 140 } }
        }
    },
    j3: {
        parentOffset: { x: 0, y: -LINK_LENGTHS.J2_TO_J3, z: 140 },
        position: { x: 0, y: 0, z: 0 },
        children: {
            link: { position: { x: 0, y: 0, z: 20 } }
        }
    },
    j4: {
        parentOffset: { x: 0, y: 0, z: LINK_LENGTHS.J3_TO_J4 },
        position: { x: 0, y: 0, z: 0 },
        children: {
            link: { position: { x: 0, y: 15, z: 0 } }
        }
    },
    j5: {
        parentOffset: { x: 0, y: LINK_LENGTHS.J4_TO_J5, z: 0 },
        position: { x: 0, y: 0, z: 0 },
        children: {
            link: { position: { x: 0, y: 0, z: 10 } }
        }
    },
    j6: {
        parentOffset: { x: 0, y: 0, z: LINK_LENGTHS.J5_TO_J6 },
        position: { x: 0, y: 0, z: 0 },
        children: {
            gripperBase: { position: { x: 0, y: 0, z: 5 } },
            leftFinger: { position: { x: -3, y: 0, z: 10 } },
            rightFinger: { position: { x: 3, y: 0, z: 10 } },
            marker: { position: { x: 0, y: 0, z: LINK_LENGTHS.GRIPPER_LENGTH } }
        }
    }
};

export const MATERIALS = {
    base: { color: 0x666666, name: '???' },
    joint: { color: 0x4444ff, name: '???(??)' },
    link: { color: 0xff4444, name: '??(??)' },
    gripper: { color: 0x888888, name: '???(??)' },
    finger: { color: 0xffffff, name: '??(??)' },
    marker: { color: 0xffff00, name: '??(??)' },
    endEffector: { color: 0x00ff00, name: '?? ???(??)' }
};

const applyScale = (value) => value * ROBOT_PHYSICAL_PARAMS.scale;

const scaleVector3 = ({ x = 0, y = 0, z = 0 }) => ({
    x: applyScale(x),
    y: applyScale(y),
    z: applyScale(z)
});

const createCylinderGeometry = ({ radiusTop, radiusBottom = radiusTop, height }) => ({
    type: 'cylinder',
    radiusTop: applyScale(radiusTop),
    radiusBottom: applyScale(radiusBottom),
    height: applyScale(height),
    segments: VISUAL_PARAMS.cylinderSegments
});

const createBoxGeometry = ({ width, height, depth }) => ({
    type: 'box',
    width: applyScale(width),
    height: applyScale(height),
    depth: applyScale(depth)
});

const createSphereGeometry = ({ radius, widthSegments, heightSegments }) => ({
    type: 'sphere',
    radius: applyScale(radius),
    widthSegments,
    heightSegments
});

export const ROBOT_6DOF_CONFIG = {
    name: '6DOF ??',
    basePosition: scaleVector3(JOINT_LAYOUT.base.position),
    joints: {
        base: {
            type: 'fixed',
            geometry: createCylinderGeometry({
                radiusTop: VISUAL_PARAMS.baseRadius.top,
                radiusBottom: VISUAL_PARAMS.baseRadius.bottom,
                height: VISUAL_PARAMS.heights.base
            }),
            position: scaleVector3(JOINT_LAYOUT.base.position),
            rotation: { x: Math.PI / 2, y: 0, z: 0 },
            material: 'base',
            castShadow: true
        },

        j1: {
            type: 'revolute',
            axis: JOINT_AXES.j1,
            range: MOTION_LIMITS.jointRanges.j1,
            geometry: createCylinderGeometry({
                radiusTop: VISUAL_PARAMS.jointRadii.j1,
                height: VISUAL_PARAMS.heights.joint
            }),
            position: scaleVector3(JOINT_LAYOUT.j1.position),
            rotation: { x: Math.PI / 2, y: 0, z: 0 },
            material: 'joint',
            children: [
                {
                    name: 'j1_vertical',
                    geometry: createCylinderGeometry({
                        radiusTop: VISUAL_PARAMS.jointRadii.j1,
                        height: VISUAL_PARAMS.heights.j1Vertical
                    }),
                    position: scaleVector3(JOINT_LAYOUT.j1.children.vertical.position),
                    rotation: { x: -Math.PI / 2, y: 0, z: 0 },
                    material: 'link'
                },
                {
                    name: 'j1_horizontal',
                    geometry: createCylinderGeometry({
                        radiusTop: VISUAL_PARAMS.jointRadii.j2,
                        height: VISUAL_PARAMS.heights.j1Horizontal
                    }),
                    position: scaleVector3(JOINT_LAYOUT.j1.children.horizontal.position),
                    material: 'link'
                }
            ]
        },

        j2: {
            type: 'revolute',
            axis: JOINT_AXES.j2,
            range: MOTION_LIMITS.jointRanges.j2,
            parent: 'j1',
            parentOffset: scaleVector3(JOINT_LAYOUT.j2.parentOffset),
            geometry: createCylinderGeometry({
                radiusTop: VISUAL_PARAMS.jointRadii.j2,
                height: VISUAL_PARAMS.heights.j2Body
            }),
            position: scaleVector3(JOINT_LAYOUT.j2.position),
            material: 'joint',
            children: [
                {
                    name: 'j2_main_link',
                    geometry: createCylinderGeometry({
                        radiusTop: VISUAL_PARAMS.jointRadii.j3,
                        height: VISUAL_PARAMS.heights.j2Main
                    }),
                    position: scaleVector3(JOINT_LAYOUT.j2.children.main.position),
                    rotation: { x: Math.PI / 2, y: 0, z: 0 },
                    material: 'link'
                },
                {
                    name: 'j2_end_link',
                    geometry: createCylinderGeometry({
                        radiusTop: VISUAL_PARAMS.jointRadii.j3,
                        height: VISUAL_PARAMS.heights.j2End
                    }),
                    position: scaleVector3(JOINT_LAYOUT.j2.children.end.position),
                    material: 'link'
                }
            ]
        },

        j3: {
            type: 'revolute',
            axis: JOINT_AXES.j3,
            range: MOTION_LIMITS.jointRanges.j3,
            parent: 'j2',
            parentOffset: scaleVector3(JOINT_LAYOUT.j3.parentOffset),
            geometry: createCylinderGeometry({
                radiusTop: VISUAL_PARAMS.jointRadii.j3,
                height: VISUAL_PARAMS.heights.joint
            }),
            position: scaleVector3(JOINT_LAYOUT.j3.position),
            material: 'joint',
            children: [
                {
                    name: 'j3_link',
                    geometry: createCylinderGeometry({
                        radiusTop: VISUAL_PARAMS.jointRadii.j4,
                        height: VISUAL_PARAMS.heights.j3Link
                    }),
                    position: scaleVector3(JOINT_LAYOUT.j3.children.link.position),
                    rotation: { x: Math.PI / 2, y: 0, z: 0 },
                    material: 'link'
                }
            ]
        },

        j4: {
            type: 'revolute',
            axis: JOINT_AXES.j4,
            range: MOTION_LIMITS.jointRanges.j4,
            parent: 'j3',
            parentOffset: scaleVector3(JOINT_LAYOUT.j4.parentOffset),
            geometry: createCylinderGeometry({
                radiusTop: VISUAL_PARAMS.jointRadii.j4,
                height: VISUAL_PARAMS.heights.j4Body
            }),
            position: scaleVector3(JOINT_LAYOUT.j4.position),
            rotation: { x: Math.PI / 2, y: 0, z: 0 },
            material: 'joint',
            children: [
                {
                    name: 'j4_link',
                    geometry: createCylinderGeometry({
                        radiusTop: VISUAL_PARAMS.jointRadii.j5,
                        height: VISUAL_PARAMS.heights.j4Link
                    }),
                    position: scaleVector3(JOINT_LAYOUT.j4.children.link.position),
                    material: 'link'
                }
            ]
        },

        j5: {
            type: 'revolute',
            axis: JOINT_AXES.j5,
            range: MOTION_LIMITS.jointRanges.j5,
            parent: 'j4',
            parentOffset: scaleVector3(JOINT_LAYOUT.j5.parentOffset),
            geometry: createCylinderGeometry({
                radiusTop: VISUAL_PARAMS.jointRadii.j5,
                height: VISUAL_PARAMS.heights.j5Body
            }),
            position: scaleVector3(JOINT_LAYOUT.j5.position),
            material: 'joint',
            children: [
                {
                    name: 'j5_link',
                    geometry: createCylinderGeometry({
                        radiusTop: VISUAL_PARAMS.jointRadii.j6,
                        height: VISUAL_PARAMS.heights.j5Link
                    }),
                    position: scaleVector3(JOINT_LAYOUT.j5.children.link.position),
                    rotation: { x: Math.PI / 2, y: 0, z: 0 },
                    material: 'link'
                }
            ]
        },

        j6: {
            type: 'revolute',
            axis: JOINT_AXES.j6,
            range: MOTION_LIMITS.jointRanges.j6,
            parent: 'j5',
            parentOffset: scaleVector3(JOINT_LAYOUT.j6.parentOffset),
            geometry: createCylinderGeometry({
                radiusTop: VISUAL_PARAMS.jointRadii.j6,
                height: VISUAL_PARAMS.heights.j6Body
            }),
            position: scaleVector3(JOINT_LAYOUT.j6.position),
            rotation: { x: Math.PI / 2, y: 0, z: 0 },
            material: 'joint',
            children: [
                {
                    name: 'gripper_base',
                    geometry: createCylinderGeometry({
                        radiusTop: VISUAL_PARAMS.jointRadii.j6,
                        height: VISUAL_PARAMS.heights.gripperBase
                    }),
                    position: scaleVector3(JOINT_LAYOUT.j6.children.gripperBase.position),
                    rotation: { x: Math.PI / 2, y: 0, z: 0 },
                    material: 'gripper'
                },
                {
                    name: 'left_finger',
                    geometry: createBoxGeometry(VISUAL_PARAMS.heights.finger),
                    position: scaleVector3(JOINT_LAYOUT.j6.children.leftFinger.position),
                    rotation: { x: Math.PI / 2, y: 0, z: 0 },
                    material: 'finger'
                },
                {
                    name: 'right_finger',
                    geometry: createBoxGeometry(VISUAL_PARAMS.heights.finger),
                    position: scaleVector3(JOINT_LAYOUT.j6.children.rightFinger.position),
                    rotation: { x: Math.PI / 2, y: 0, z: 0 },
                    material: 'finger'
                },
                {
                    name: 'end_effector_marker',
                    geometry: createSphereGeometry({
                        radius: VISUAL_PARAMS.heights.markerRadius,
                        widthSegments: VISUAL_PARAMS.sphereSegments.width,
                        heightSegments: VISUAL_PARAMS.sphereSegments.height
                    }),
                    position: scaleVector3(JOINT_LAYOUT.j6.children.marker.position),
                    material: 'endEffector'
                }
            ]
        }
    }
};

export const ANIMATION_CONFIG = {
    defaultDuration: 1000,
    easing: {
        easeInOut: (t) => (t < 0.5 ? 2 * t * t : 1 - 2 * (1 - t) * (1 - t))
    }
};

export const UI_CONFIG = {
    positionDisplay: {
        style: {
            position: 'absolute',
            top: '10px',
            left: '10px',
            background: 'rgba(0,0,0,0.8)',
            color: 'white',
            padding: '10px',
            borderRadius: '5px',
            fontFamily: 'monospace',
            fontSize: '14px',
            zIndex: '1000'
        }
    }
};
