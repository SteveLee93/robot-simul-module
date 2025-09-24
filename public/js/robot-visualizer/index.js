/**
 * Robot Visualizer Index - 메인 진입점
 * 모든 모듈을 통합하여 외부에서 쉽게 사용할 수 있도록 함
 */

// Core modules
export { SceneManager } from './core/SceneManager.js';
export { RobotVisualizer } from './core/RobotVisualizer.js';

// Robot modules
export { JointManager } from './robot/JointManager.js';
export { Joint, RevoluteJoint, FixedJoint, PrismaticJoint, JointFactory } from './robot/Joint.js';
export {
    ROBOT_6DOF_CONFIG,
    MATERIALS,
    ANIMATION_CONFIG,
    UI_CONFIG
} from './robot/RobotConfig.js';

// UI modules
export { UIManager } from './ui/UIManager.js';

// Utility modules
export { Kinematics } from './utils/Kinematics.js';

// 기본 export (가장 많이 사용될 클래스)
import { RobotVisualizer as RV } from './core/RobotVisualizer.js';
export default RV;