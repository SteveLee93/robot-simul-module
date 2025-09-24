/**
 * Kinematics - 로봇 운동학 계산
 * 순기구학, 역기구학, 궤적 계획 등의 수학적 계산을 담당
 */

export class Kinematics {
    constructor(robotConfig) {
        this.config = robotConfig;
        this.joints = robotConfig.joints;

        // DH 파라미터 (Denavit-Hartenberg Parameters)
        // 실제 로봇의 정확한 DH 파라미터는 측정이 필요
        this.dhParams = this.extractDHParameters();
    }

    /**
     * 로봇 설정에서 DH 파라미터 추출
     * @returns {Array} DH 파라미터 배열
     */
    extractDHParameters() {
        // 6DOF 로봇의 DH 파라미터 (예시값, 실제 측정 필요)
        return [
            { a: 0,   alpha: Math.PI/2,  d: 35,   theta: 0 },  // J1
            { a: 80,  alpha: 0,         d: 0,    theta: 0 },  // J2
            { a: 80,  alpha: 0,         d: 0,    theta: 0 },  // J3
            { a: 0,   alpha: Math.PI/2, d: 50,   theta: 0 },  // J4
            { a: 0,   alpha: -Math.PI/2,d: 30,   theta: 0 },  // J5
            { a: 0,   alpha: 0,         d: 15,   theta: 0 }   // J6
        ];
    }

    /**
     * 순기구학 계산 (Forward Kinematics)
     * 조인트 각도에서 엔드 이펙터 위치/자세 계산
     * @param {Array} jointAngles - 조인트 각도 배열 (라디안)
     * @returns {Object} 위치와 회전 행렬
     */
    forwardKinematics(jointAngles) {
        if (jointAngles.length !== 6) {
            throw new Error('6개의 조인트 각도가 필요합니다.');
        }

        let T = this.createIdentityMatrix(); // 최종 변환 행렬

        // 각 조인트별 변환 행렬 계산 및 누적
        for (let i = 0; i < 6; i++) {
            const dh = { ...this.dhParams[i] };
            dh.theta += jointAngles[i]; // 조인트 각도 추가

            const Ti = this.createDHTransformMatrix(dh);
            T = this.multiplyMatrices(T, Ti);
        }

        return {
            position: {
                x: T[0][3],
                y: T[1][3],
                z: T[2][3]
            },
            rotation: this.extractRotationMatrix(T),
            transformMatrix: T
        };
    }

    /**
     * 역기구학 계산 (Inverse Kinematics) - 기본 구현
     * 목표 위치/자세에서 필요한 조인트 각도 계산
     * @param {Object} target - 목표 위치 {x, y, z}
     * @param {Array} initialGuess - 초기 추정 각도 (라디안)
     * @returns {Array} 계산된 조인트 각도 (라디안)
     */
    inverseKinematics(target, initialGuess = null) {
        if (!initialGuess) {
            initialGuess = [0, 0, 0, 0, 0, 0];
        }

        // 뉴턴-랩슨 방법을 사용한 수치해석적 접근
        let jointAngles = [...initialGuess];
        const maxIterations = 100;
        const tolerance = 0.001;

        for (let iteration = 0; iteration < maxIterations; iteration++) {
            const current = this.forwardKinematics(jointAngles);

            // 오차 계산
            const error = [
                target.x - current.position.x,
                target.y - current.position.y,
                target.z - current.position.z
            ];

            // 수렴 조건 확인
            const errorMagnitude = Math.sqrt(
                error[0] * error[0] +
                error[1] * error[1] +
                error[2] * error[2]
            );

            if (errorMagnitude < tolerance) {
                console.log(`IK converged in ${iteration} iterations`);
                return jointAngles;
            }

            // 야코비안 계산 (수치적 미분)
            const jacobian = this.calculateJacobian(jointAngles);

            // 의사역행렬 계산 및 각도 업데이트
            try {
                const deltaAngles = this.solveLinearSystem(jacobian, error);

                // 각도 업데이트 (적응적 스텝 크기)
                const stepSize = 0.1;
                for (let i = 0; i < 6; i++) {
                    jointAngles[i] += deltaAngles[i] * stepSize;

                    // 조인트 제한 적용
                    const joint = Object.keys(this.joints)[i + 1]; // j1, j2, ...
                    if (this.joints[joint] && this.joints[joint].range) {
                        const range = this.joints[joint].range;
                        const minRad = range[0] * Math.PI / 180;
                        const maxRad = range[1] * Math.PI / 180;
                        jointAngles[i] = Math.max(minRad, Math.min(maxRad, jointAngles[i]));
                    }
                }
            } catch (error) {
                console.warn('IK failed to converge:', error.message);
                break;
            }
        }

        console.warn('IK did not converge within maximum iterations');
        return jointAngles;
    }

    /**
     * 야코비안 행렬 계산 (수치적 미분)
     * @param {Array} jointAngles - 현재 조인트 각도
     * @returns {Array} 야코비안 행렬 (3x6)
     */
    calculateJacobian(jointAngles) {
        const epsilon = 0.001; // 미분을 위한 작은 값
        const jacobian = [];

        const currentPos = this.forwardKinematics(jointAngles).position;

        for (let i = 0; i < 6; i++) {
            const perturbedAngles = [...jointAngles];
            perturbedAngles[i] += epsilon;

            const perturbedPos = this.forwardKinematics(perturbedAngles).position;

            // 수치적 편미분
            const column = [
                (perturbedPos.x - currentPos.x) / epsilon,
                (perturbedPos.y - currentPos.y) / epsilon,
                (perturbedPos.z - currentPos.z) / epsilon
            ];

            jacobian.push(column);
        }

        // 전치 (3x6 형태로 변환)
        const transposed = [];
        for (let i = 0; i < 3; i++) {
            transposed.push([]);
            for (let j = 0; j < 6; j++) {
                transposed[i].push(jacobian[j][i]);
            }
        }

        return transposed;
    }

    /**
     * 선형 시스템 해결 (최소제곱법)
     * @param {Array} A - 계수 행렬
     * @param {Array} b - 상수 벡터
     * @returns {Array} 해 벡터
     */
    solveLinearSystem(A, b) {
        // 간단한 의사역행렬 해법 (실제로는 더 정교한 방법 필요)
        // A^T * A * x = A^T * b

        const AT = this.transposeMatrix(A);
        const ATA = this.multiplyMatrices(AT, A);
        const ATb = this.multiplyMatrixVector(AT, b);

        // 가우스 소거법으로 해결 (간단한 구현)
        return this.gaussianElimination(ATA, ATb);
    }

    /**
     * DH 파라미터에서 변환 행렬 생성
     * @param {Object} dh - DH 파라미터 {a, alpha, d, theta}
     * @returns {Array} 4x4 변환 행렬
     */
    createDHTransformMatrix(dh) {
        const { a, alpha, d, theta } = dh;
        const ct = Math.cos(theta);
        const st = Math.sin(theta);
        const ca = Math.cos(alpha);
        const sa = Math.sin(alpha);

        return [
            [ct,    -st * ca,   st * sa,    a * ct],
            [st,     ct * ca,  -ct * sa,    a * st],
            [0,      sa,        ca,         d],
            [0,      0,         0,          1]
        ];
    }

    /**
     * 단위 행렬 생성
     * @returns {Array} 4x4 단위 행렬
     */
    createIdentityMatrix() {
        return [
            [1, 0, 0, 0],
            [0, 1, 0, 0],
            [0, 0, 1, 0],
            [0, 0, 0, 1]
        ];
    }

    /**
     * 행렬 곱셈
     * @param {Array} A - 첫 번째 행렬
     * @param {Array} B - 두 번째 행렬
     * @returns {Array} 곱셈 결과 행렬
     */
    multiplyMatrices(A, B) {
        const rowsA = A.length;
        const colsA = A[0].length;
        const colsB = B[0].length;
        const result = [];

        for (let i = 0; i < rowsA; i++) {
            result[i] = [];
            for (let j = 0; j < colsB; j++) {
                let sum = 0;
                for (let k = 0; k < colsA; k++) {
                    sum += A[i][k] * B[k][j];
                }
                result[i][j] = sum;
            }
        }

        return result;
    }

    /**
     * 행렬-벡터 곱셈
     * @param {Array} matrix - 행렬
     * @param {Array} vector - 벡터
     * @returns {Array} 결과 벡터
     */
    multiplyMatrixVector(matrix, vector) {
        const result = [];
        for (let i = 0; i < matrix.length; i++) {
            let sum = 0;
            for (let j = 0; j < vector.length; j++) {
                sum += matrix[i][j] * vector[j];
            }
            result.push(sum);
        }
        return result;
    }

    /**
     * 행렬 전치
     * @param {Array} matrix - 원본 행렬
     * @returns {Array} 전치 행렬
     */
    transposeMatrix(matrix) {
        const transposed = [];
        for (let j = 0; j < matrix[0].length; j++) {
            transposed[j] = [];
            for (let i = 0; i < matrix.length; i++) {
                transposed[j][i] = matrix[i][j];
            }
        }
        return transposed;
    }

    /**
     * 회전 행렬 추출
     * @param {Array} transformMatrix - 4x4 변환 행렬
     * @returns {Array} 3x3 회전 행렬
     */
    extractRotationMatrix(transformMatrix) {
        return [
            [transformMatrix[0][0], transformMatrix[0][1], transformMatrix[0][2]],
            [transformMatrix[1][0], transformMatrix[1][1], transformMatrix[1][2]],
            [transformMatrix[2][0], transformMatrix[2][1], transformMatrix[2][2]]
        ];
    }

    /**
     * 가우스 소거법 (간단한 구현)
     * @param {Array} A - 계수 행렬
     * @param {Array} b - 상수 벡터
     * @returns {Array} 해 벡터
     */
    gaussianElimination(A, b) {
        const n = A.length;
        const augmented = A.map((row, i) => [...row, b[i]]);

        // 전진 소거
        for (let i = 0; i < n; i++) {
            // 피벗 선택
            let maxRow = i;
            for (let k = i + 1; k < n; k++) {
                if (Math.abs(augmented[k][i]) > Math.abs(augmented[maxRow][i])) {
                    maxRow = k;
                }
            }
            [augmented[i], augmented[maxRow]] = [augmented[maxRow], augmented[i]];

            // 소거
            for (let k = i + 1; k < n; k++) {
                const factor = augmented[k][i] / augmented[i][i];
                for (let j = i; j <= n; j++) {
                    augmented[k][j] -= factor * augmented[i][j];
                }
            }
        }

        // 후진 대입
        const x = new Array(n);
        for (let i = n - 1; i >= 0; i--) {
            x[i] = augmented[i][n];
            for (let j = i + 1; j < n; j++) {
                x[i] -= augmented[i][j] * x[j];
            }
            x[i] /= augmented[i][i];
        }

        return x;
    }

    /**
     * 각도를 라디안으로 변환
     * @param {number} degrees - 각도 (도)
     * @returns {number} 라디안
     */
    degreesToRadians(degrees) {
        return degrees * Math.PI / 180;
    }

    /**
     * 라디안을 각도로 변환
     * @param {number} radians - 라디안
     * @returns {number} 각도 (도)
     */
    radiansToDegrees(radians) {
        return radians * 180 / Math.PI;
    }
}