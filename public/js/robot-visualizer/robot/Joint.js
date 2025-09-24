/**
 * Joint - 로봇 조인트 추상화 클래스들
 * 다양한 조인트 타입을 위한 기본 클래스와 구현체
 */
import { ANIMATION_CONFIG } from './RobotConfig.js';

/**
 * 추상 Joint 클래스
 */
export class Joint {
    constructor(name, config, meshGroup) {
        if (this.constructor === Joint) {
            throw new Error("Abstract class 'Joint' cannot be instantiated directly.");
        }

        this.name = name;
        this.config = config;
        this.meshGroup = meshGroup;
        this.currentAngle = 0;
        this.range = config.range || [-180, 180];
    }

    /**
     * 조인트 회전 (추상 메서드)
     * @param {number} angle - 각도 (도)
     */
    rotate(angle) {
        throw new Error("Method 'rotate()' must be implemented.");
    }

    /**
     * 애니메이션으로 회전 (추상 메서드)
     * @param {number} targetAngle - 목표 각도 (도)
     * @param {number} duration - 애니메이션 시간 (ms)
     */
    animateTo(targetAngle, duration = ANIMATION_CONFIG.defaultDuration) {
        throw new Error("Method 'animateTo()' must be implemented.");
    }

    /**
     * 현재 각도 반환
     * @returns {number} 각도 (도)
     */
    getAngle() {
        return this.currentAngle;
    }

    /**
     * 조인트 이름 반환
     * @returns {string}
     */
    getName() {
        return this.name;
    }

    /**
     * 각도 범위 체크
     * @param {number} angle - 체크할 각도
     * @returns {number} 클램핑된 각도
     */
    clampAngle(angle) {
        return Math.max(this.range[0], Math.min(this.range[1], angle));
    }
}

/**
 * 회전 조인트 (Revolute Joint)
 * 한 축을 중심으로 회전하는 조인트
 */
export class RevoluteJoint extends Joint {
    constructor(name, config, meshGroup) {
        super(name, config, meshGroup);
        this.axis = config.axis || 'z'; // 회전축 ('x', 'y', 'z')
    }

    /**
     * 조인트 회전
     * @param {number} angle - 각도 (도)
     */
    rotate(angle) {
        // 범위 체크
        const clampedAngle = this.clampAngle(angle);
        this.currentAngle = clampedAngle;

        // 라디안으로 변환
        const radians = clampedAngle * Math.PI / 180;

        // 축에 따라 회전 적용
        switch (this.axis) {
            case 'x':
                this.meshGroup.rotation.x = radians;
                break;
            case 'y':
                this.meshGroup.rotation.y = radians;
                break;
            case 'z':
                this.meshGroup.rotation.z = radians;
                break;
            default:
                console.warn(`Unknown rotation axis: ${this.axis}`);
        }
    }

    /**
     * 애니메이션으로 회전
     * @param {number} targetAngle - 목표 각도 (도)
     * @param {number} duration - 애니메이션 시간 (ms)
     */
    animateTo(targetAngle, duration = ANIMATION_CONFIG.defaultDuration) {
        const startAngle = this.currentAngle;
        const clampedTargetAngle = this.clampAngle(targetAngle);
        const startTime = Date.now();
        const easing = ANIMATION_CONFIG.easing.easeInOut;

        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const easeProgress = easing(progress);

            const currentAngle = startAngle + (clampedTargetAngle - startAngle) * easeProgress;
            this.rotate(currentAngle);

            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };

        animate();
    }

    /**
     * 회전축 반환
     * @returns {string}
     */
    getAxis() {
        return this.axis;
    }
}

/**
 * 고정 조인트 (Fixed Joint)
 * 움직이지 않는 조인트 (베이스 등)
 */
export class FixedJoint extends Joint {
    constructor(name, config, meshGroup) {
        super(name, config, meshGroup);
        this.currentAngle = 0; // 항상 0도
    }

    /**
     * 고정 조인트는 회전하지 않음
     * @param {number} angle - 무시됨
     */
    rotate(angle) {
        console.warn(`Fixed joint '${this.name}' cannot be rotated.`);
    }

    /**
     * 고정 조인트는 애니메이션하지 않음
     * @param {number} targetAngle - 무시됨
     * @param {number} duration - 무시됨
     */
    animateTo(targetAngle, duration) {
        console.warn(`Fixed joint '${this.name}' cannot be animated.`);
    }
}

/**
 * 직선 조인트 (Prismatic Joint)
 * 직선 운동하는 조인트 (추후 확장용)
 */
export class PrismaticJoint extends Joint {
    constructor(name, config, meshGroup) {
        super(name, config, meshGroup);
        this.axis = config.axis || 'z'; // 이동축 ('x', 'y', 'z')
        this.currentPosition = 0; // 위치 (mm)
        this.range = config.range || [-100, 100]; // 이동 범위 (mm)
    }

    /**
     * 조인트 이동
     * @param {number} position - 위치 (mm)
     */
    move(position) {
        const clampedPosition = Math.max(this.range[0], Math.min(this.range[1], position));
        this.currentPosition = clampedPosition;

        // 축에 따라 이동 적용
        switch (this.axis) {
            case 'x':
                this.meshGroup.position.x = clampedPosition;
                break;
            case 'y':
                this.meshGroup.position.y = clampedPosition;
                break;
            case 'z':
                this.meshGroup.position.z = clampedPosition;
                break;
            default:
                console.warn(`Unknown movement axis: ${this.axis}`);
        }
    }

    /**
     * 회전이 아닌 이동
     * @param {number} position - 위치 (각도 대신 위치)
     */
    rotate(position) {
        this.move(position);
    }

    /**
     * 애니메이션으로 이동
     * @param {number} targetPosition - 목표 위치 (mm)
     * @param {number} duration - 애니메이션 시간 (ms)
     */
    animateTo(targetPosition, duration = ANIMATION_CONFIG.defaultDuration) {
        const startPosition = this.currentPosition;
        const clampedTargetPosition = Math.max(this.range[0], Math.min(this.range[1], targetPosition));
        const startTime = Date.now();
        const easing = ANIMATION_CONFIG.easing.easeInOut;

        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const easeProgress = easing(progress);

            const currentPosition = startPosition + (clampedTargetPosition - startPosition) * easeProgress;
            this.move(currentPosition);

            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };

        animate();
    }

    /**
     * 현재 위치 반환 (각도 대신)
     * @returns {number} 위치 (mm)
     */
    getAngle() {
        return this.currentPosition;
    }

    /**
     * 현재 위치 반환
     * @returns {number} 위치 (mm)
     */
    getPosition() {
        return this.currentPosition;
    }
}

/**
 * 조인트 팩토리
 * 설정에 따라 적절한 조인트 인스턴스를 생성
 */
export class JointFactory {
    /**
     * 조인트 생성
     * @param {string} name - 조인트 이름
     * @param {Object} config - 조인트 설정
     * @param {THREE.Group} meshGroup - Three.js 그룹
     * @returns {Joint} 조인트 인스턴스
     */
    static createJoint(name, config, meshGroup) {
        switch (config.type) {
            case 'revolute':
                return new RevoluteJoint(name, config, meshGroup);

            case 'fixed':
                return new FixedJoint(name, config, meshGroup);

            case 'prismatic':
                return new PrismaticJoint(name, config, meshGroup);

            default:
                console.warn(`Unknown joint type: ${config.type}, defaulting to revolute`);
                return new RevoluteJoint(name, config, meshGroup);
        }
    }
}