/**
 * RobotConfig - 6DOF 로봇 설정 및 상수 정의
 * 로봇 구조, 크기, 색상, 위치 등 모든 파라미터 중앙 관리
 */

// 재료 정의
export const MATERIALS = {
    base: { color: 0x666666, name: '베이스' },
    joint: { color: 0x4444ff, name: '조인트 (파란색)' },
    link: { color: 0xff4444, name: '링크 (빨간색)' },
    gripper: { color: 0x888888, name: '그리퍼 (회색)' },
    finger: { color: 0xffffff, name: '핑거 (흰색)' },
    marker: { color: 0xffff00, name: '마커 (노란색)' },
    endEffector: { color: 0x00ff00, name: '엔드 이펙터 (초록색)' }
};

// 6DOF 로봇 구조 정의
export const ROBOT_6DOF_CONFIG = {
    name: "6DOF 로봇 팔",

    // 기본 위치 및 크기
    basePosition: { x: 0, y: 0, z: 10 },

    // 조인트 정의 (순차적 계층 구조)
    joints: {
        base: {
            type: 'fixed',
            geometry: {
                type: 'cylinder',
                radiusTop: 25,
                radiusBottom: 40,
                height: 20,
                segments: 16
            },
            position: { x: 0, y: 0, z: 10 },
            rotation: { x: Math.PI / 2, y: 0, z: 0 }, // XY 평면에 눕히기
            material: 'base',
            castShadow: true
        },

        j1: {
            type: 'revolute',
            axis: 'y', // Y축 중심 회전 (XY 평면에서)
            range: [-180, 180], // 회전 범위 (도)

            // J1 메인 조인트
            geometry: {
                type: 'cylinder',
                radiusTop: 25,
                radiusBottom: 25,
                height: 30,
                segments: 16
            },
            position: { x: 0, y: 0, z: 35 }, // 베이스 위
            rotation: { x: Math.PI / 2, y: 0, z: 0 },
            material: 'joint',

            // J1에 연결된 구조물들
            children: [
                {
                    name: 'j1_vertical',
                    geometry: {
                        type: 'cylinder',
                        radiusTop: 25,
                        radiusBottom: 25,
                        height: 50,
                        segments: 16
                    },
                    position: { x: 0, y: 40, z: 0 },
                    material: 'link'
                },
                {
                    name: 'j1_horizontal',
                    geometry: {
                        type: 'cylinder',
                        radiusTop: 20,
                        radiusBottom: 20,
                        height: 40,
                        segments: 16
                    },
                    position: { x: 0, y: 40, z: 10 },
                    rotation: { x: Math.PI / 2, y: 0, z: 0 },
                    material: 'link'
                }
            ]
        },

        j2: {
            type: 'revolute',
            axis: 'z', // Z축 중심 회전
            range: [-90, 90],
            parent: 'j1',
            parentOffset: { x: 0, y: 40, z: 30 }, // J1 ㄱ자 끝

            geometry: {
                type: 'cylinder',
                radiusTop: 20,
                radiusBottom: 20,
                height: 40,
                segments: 16
            },
            position: { x: 0, y: 0, z: 20 },
            rotation: { x: Math.PI / 2, y: 0, z: 0 },
            material: 'joint',

            children: [
                {
                    name: 'j2_main_link',
                    geometry: {
                        type: 'cylinder',
                        radiusTop: 15,
                        radiusBottom: 15,
                        height: 150,
                        segments: 16
                    },
                    position: { x: 0, y: 80, z: 0 },
                    material: 'link'
                },
                {
                    name: 'j2_end_link',
                    geometry: {
                        type: 'cylinder',
                        radiusTop: 15,
                        radiusBottom: 15,
                        height: 20,
                        segments: 16
                    },
                    position: { x: 0, y: 140, z: -15 },
                    rotation: { x: Math.PI / 2, y: 0, z: 0 },
                    material: 'link'
                }
            ]
        },

        j3: {
            type: 'revolute',
            axis: 'z', // Z축 중심 회전
            range: [-90, 90],
            parent: 'j2',
            parentOffset: { x: 0, y: 140, z: -40 },

            geometry: {
                type: 'cylinder',
                radiusTop: 15,
                radiusBottom: 15,
                height: 30,
                segments: 16
            },
            position: { x: 0, y: 0, z: 0 },
            rotation: { x: Math.PI / 2, y: 0, z: 0 },
            material: 'joint',

            children: [
                {
                    name: 'j3_link',
                    geometry: {
                        type: 'cylinder',
                        radiusTop: 10,
                        radiusBottom: 10,
                        height: 30,
                        segments: 16
                    },
                    position: { x: 0, y: 20, z: 0 },
                    material: 'link'
                }
            ]
        },

        j4: {
            type: 'revolute',
            axis: 'y', // Y축 중심 회전
            range: [-180, 180],
            parent: 'j3',
            parentOffset: { x: 0, y: 45, z: 0 },

            geometry: {
                type: 'cylinder',
                radiusTop: 10,
                radiusBottom: 10,
                height: 20,
                segments: 16
            },
            position: { x: 0, y: 0, z: 0 },
            material: 'joint',

            children: [
                {
                    name: 'j4_link',
                    geometry: {
                        type: 'cylinder',
                        radiusTop: 8,
                        radiusBottom: 8,
                        height: 15,
                        segments: 16
                    },
                    position: { x: 0, y: 0, z: 10 },
                    rotation: { x: Math.PI / 2, y: 0, z: 0 },
                    material: 'link'
                }
            ]
        },

        j5: {
            type: 'revolute',
            axis: 'z', // Z축 중심 회전
            range: [-180, 180],
            parent: 'j4',
            parentOffset: { x: 0, y: 0, z: 25 },

            geometry: {
                type: 'cylinder',
                radiusTop: 8,
                radiusBottom: 8,
                height: 15,
                segments: 16
            },
            position: { x: 0, y: 0, z: 0 },
            rotation: { x: Math.PI / 2, y: 0, z: 0 },
            material: 'joint',

            children: [
                {
                    name: 'j5_link',
                    geometry: {
                        type: 'cylinder',
                        radiusTop: 6,
                        radiusBottom: 6,
                        height: 25,
                        segments: 16
                    },
                    position: { x: 0, y: 15, z: 0 },
                    material: 'link'
                },
                {
                    name: 'j5_marker',
                    geometry: {
                        type: 'sphere',
                        radius: 2,
                        widthSegments: 8,
                        heightSegments: 6
                    },
                    position: { x: 0, y: 30, z: 0 },
                    material: 'marker'
                }
            ]
        },

        j6: {
            type: 'revolute',
            axis: 'y', // Y축 중심 회전
            range: [-180, 180],
            parent: 'j5',
            parentOffset: { x: 0, y: 30, z: 0 },

            geometry: {
                type: 'cylinder',
                radiusTop: 6,
                radiusBottom: 6,
                height: 10,
                segments: 16
            },
            position: { x: 0, y: 0, z: 0 },
            material: 'joint',

            children: [
                {
                    name: 'gripper_base',
                    geometry: {
                        type: 'cylinder',
                        radiusTop: 4,
                        radiusBottom: 4,
                        height: 8,
                        segments: 16
                    },
                    position: { x: 0, y: 6, z: 0 },
                    material: 'gripper'
                },
                {
                    name: 'left_finger',
                    geometry: {
                        type: 'box',
                        width: 2,
                        height: 8,
                        depth: 1
                    },
                    position: { x: -3, y: 10, z: 0 },
                    material: 'finger'
                },
                {
                    name: 'right_finger',
                    geometry: {
                        type: 'box',
                        width: 2,
                        height: 8,
                        depth: 1
                    },
                    position: { x: 3, y: 10, z: 0 },
                    material: 'finger'
                },
                {
                    name: 'end_effector_marker',
                    geometry: {
                        type: 'sphere',
                        radius: 1.5,
                        widthSegments: 8,
                        heightSegments: 6
                    },
                    position: { x: 0, y: 15, z: 0 },
                    material: 'endEffector'
                }
            ]
        }
    }
};

// 애니메이션 설정
export const ANIMATION_CONFIG = {
    defaultDuration: 1000, // 기본 애니메이션 시간 (ms)
    easing: {
        // 이징 함수 정의
        easeInOut: (t) => t < 0.5 ? 2 * t * t : 1 - 2 * (1 - t) * (1 - t)
    }
};

// UI 설정
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