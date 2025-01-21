// Creating class for new_design.js
// Getting all variables and functions from new_design.js and putting them in this class
import makeRequest from "../utils/requestWrapper.js";

class Game {
    constructor(username, displayName, game_mode, ai_lvl, sceneRouterCallback, screenRouterCallback) {
        this.initScene();
        this.initCamera();
        this.initRenderer();
        this.initObjects();
        this.initEventListeners();
        this.snowfallActive = false;
        this.snowfallFunctions = null;
        this.paused = false;
        this.sceneRouterCallback = sceneRouterCallback;
        this.screenRouterCallback = screenRouterCallback;

        this.ballSpeedX = 0;
        this.ballSpeedY = 0;
        this.scoreLeft = 4;
        this.scoreRight = 2;

        this.username = username;
        this.displayName = displayName;

        this.ws_url = null
        
        if (game_mode == 'vanilla')
            this.ws_url = `ws://localhost:8000/ws/game/pong?gameMode=vanilla&username=${this.username}&displayName=${this.displayName}`;
        else if (game_mode == 'solo') {
            this.ws_url = `ws://localhost:8000/ws/game/pong?gameMode=solo&username=${this.username}&displayName=${this.displayName}`;
        }
        else if (game_mode == 'tourney') {
            this.ws_url = `ws://localhost:8000/ws/game/tourney?username=${this.username}`;
        }
        // else if (game_mode == 'demo') {
        //     this.ws_url = 'ws://localhost:8000/ws/game/pong?gameMode=demo&username=${username}';
        // }
        
        this.DOMloaded = true; // Set to true if DOMContentLoaded event is fired before starting

        this.keys = {
            w: false,
            s: false,
            ArrowUp: false,
            ArrowDown: false,
            AI_L: false,
            AI_R: false,
            Ball_Predict_Point: false,
            Collision_Particles: false,
            Snowfall: false,
            ai_lvl: ai_lvl,
        };

        this.key_rotate = {
            i: false,
            k: false,
            j: false,
            l: false,
            u: false,
            o: false,
            '=': false,
            '-': false,
            r: false
        }
        
        this.intervalID = setInterval(this.updateElement.bind(this), 250);
        this.connectWebSocket();
        this.animate();
    }

    async getDisplayName() {
        console.log(this.username);
        const userData = await makeRequest('POST', 'api/account/getProfileData/', { username: this.username });
        return userData.displayName;
    }
    
    cleanup() {
        this.disconnectWebSocket();
        console.log('Cleaning up game');
        // Remove the renderer's DOM element
        document.body.removeChild(this.renderer.domElement);
    
        // Dispose of geometries, materials, and textures
        const disposeObject = (obj) => {
            if (obj.geometry) obj.geometry.dispose();
            if (obj.material) {
                if (Array.isArray(obj.material)) {
                    obj.material.forEach((material) => material.dispose());
                } else {
                    obj.material.dispose();
                }
            }
            if (obj.texture) obj.texture.dispose();
        };
    
        // Traverse the scene to dispose of all objects
        // recursively visits every child object in the scene graph
        this.scene.traverse((obj) => {
            if (obj.isMesh || obj.isLine || obj.isSprite) {
                disposeObject(obj);
            }
        });

        // Remove event listeners
        window.removeEventListener('resize', this.boundOnWindowResize, false);
        document.removeEventListener('DOMContentLoaded', () => (this.DOMloaded = true));
        document.removeEventListener('keydown', this.boundHandleKeydown);
        document.removeEventListener('keyup', this.boundHandleKeyup);
        document.removeEventListener('click', this.boundHandleClick);

        /*
        document.removeEventListener('keydown', (event) => {
            this.boundHandleKeydown(event);
            if (event.key === 'Escape') {
                this.paused = !this.paused;
                console.log('Game paused:', this.paused);
            }
        });
        */

        // Clear interval
        clearInterval(this.intervalID);

        // Cancel the animation frame
        cancelAnimationFrame(this.animationFrameId);

        // Dispose of the scene and renderer
        this.scene = null;
        // this.renderer.dispose();
    
        // Release references to objects
        this.group = null;
        this.camera = null;
        this.renderer = null;
        this.cuboid = null;
        this.leftPaddle = null;
        this.rightPaddle = null;
        this.ball = null;
        this.ballTarget = null;

        console.log('Game cleaned up');
    }
        
    initScene() {
        this.scene = new THREE.Scene();
        this.group = new THREE.Group();
        this.scene.add(this.group);
    }

    initCamera() {
        // Camera
        this.cameraZ = 10;
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.z = this.cameraZ;
    }

    initRenderer() {
        // Renderer
        this.renderer = new THREE.WebGLRenderer();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        document.body.appendChild(this.renderer.domElement);
    }

    initObjects() {
        // Dimensions and colors
        this.cuboidWidth = 15;
        this.cuboidHeight = 10;
        this.cuboidDepth = 0.25;
        this.paddleWidth = 0.2;
        this.paddleHeight = 1.5;
        this.paddleDepth = 0.25;
        this.ballRadius = 0.125;
        this.cuboidColor = 0x00ff00;
        this.paddleColor = 0xffff00;

        // Create cuboid
        const cuboidColor = this.cuboidColor;
        const geometry = new THREE.BoxGeometry(this.cuboidWidth, this.cuboidHeight, this.cuboidDepth);
        const edges = new THREE.EdgesGeometry(geometry);
        const lineMaterial = new THREE.LineBasicMaterial({ color: cuboidColor });
        this.cuboid = new THREE.LineSegments(edges, lineMaterial);
        this.group.add(this.cuboid);

        // Create paddles
        const paddleColor = this.paddleColor;
        const paddleGeometry = new THREE.BoxGeometry(this.paddleWidth, this.paddleHeight, this.paddleDepth);
        const paddleMaterial = new THREE.MeshBasicMaterial({ color: paddleColor });
        this.leftPaddle = new THREE.Mesh(paddleGeometry, paddleMaterial);
        this.rightPaddle = new THREE.Mesh(paddleGeometry, paddleMaterial);
        this.leftPaddle.position.set(-this.cuboidWidth / 2, 0, 0);
        this.rightPaddle.position.set(this.cuboidWidth / 2, 0, 0);
        this.group.add(this.leftPaddle);
        this.group.add(this.rightPaddle);

        // Create ball
        const ballMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
        const ballGeometry = new THREE.SphereGeometry(this.ballRadius, 32, 32);
        this.ball = new THREE.Mesh(ballGeometry, ballMaterial);
        this.ball.position.set(0, 0, 0);
        this.group.add(this.ball);

        // Create ball target
        var ballTargetMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
        this.ballTarget = new THREE.Mesh(ballGeometry, ballTargetMaterial);
        this.group.add(this.ballTarget);
    }


    initEventListeners() {
        
        this.boundOnWindowResize = this.onWindowResize.bind(this);
        this.boundHandleKeydown = this.handleKeydown.bind(this);
        this.boundHandleKeyup = this.handleKeyup.bind(this);
        this.boundHandleClick = this.handleClick.bind(this);
        
        window.addEventListener('resize', this.boundOnWindowResize, false);
        document.addEventListener('DOMContentLoaded', () => this.DOMloaded = true);
        document.addEventListener('keydown', this.boundHandleKeydown);
        document.addEventListener('keyup', this.boundHandleKeyup);
        document.addEventListener('click', this.boundHandleClick);
        // document.addEventListener('keydown', (event) => { this.boundHandleKeydown(event); if (event.key === 'Escape') { this.paused = !this.paused; console.log('Game paused:', this.paused); } });
    }
    

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    handleKeydown(event) {
        if (event.key in this.keys) {
            this.keys[event.key] = true;
            console.log(event.key);
        }
        else if (event.key in this.key_rotate) {
            this.key_rotate[event.key] = true;
            console.log(event.key);
        }
    }

    handleKeyup(event) {
        if (event.key in this.keys) {
            this.keys[event.key] = false;
            console.log(event.key);
        }
        else if (event.key in this.key_rotate) {
            this.key_rotate[event.key] = false;
            console.log(event.key);
        }
    }

    handleClick(event) {
        this.toggle(event.target, 'AI_Left', 'AI_L', 'Enable AI L', 'Disable AI L');
        this.toggle(event.target, 'AI_Right', 'AI_R', 'Enable AI R', 'Disable AI R');
        this.toggle(event.target, 'Ball_Predict_Point', 'Ball_Predict_Point', 'Show Ball Prediction', 'Hide Ball Prediction');
        this.toggle(event.target, 'Collision_Particles', 'Collision_Particles', 'Enable Collision Particles', 'Disable Collision Particles');
        this.toggle(event.target, 'Snowfall', 'Snowfall', 'Enable Snowfall', 'Disable Snowfall');
        // this.toggle(event.target, 'AI_Prediction', 'AI_Mode', 'Enable Pro AI', 'Disable Pro AI');
    }
    
    toggle(target, buttonId, key, enableText, disableText) {
        const button = document.getElementById(buttonId);
        if (target === button) {
            button.classList.toggle('active');
            if (button.classList.contains('active')) {
                this.keys[key] = true;
                button.textContent = disableText;
            } else {
                this.keys[key] = false;
                button.textContent = enableText;
            }
    
            if (key == 'Snowfall') {
                this.toggleSnowfall();
            }
        }
    }

    connectWebSocket() {
        this.socket = new WebSocket(this.ws_url);
        this.socket.onopen = function () {
            console.log('WebSocket connection established');
        
            this.socket.onmessage = function (event) {
                const gameState = JSON.parse(event.data);
                this.updateGameObjects(gameState);
            }.bind(this);
        
            this.socket.onclose = function (event) {
                console.error('WebSocket closed:', event);
            }.bind(this);
        }.bind(this);
        
        this.socket.onerror = function (error) {
            console.error('WebSocket error:', error);
        }.bind(this);
        
    }

    disconnectWebSocket() {
        this.socket.close();
    }

    updateGameObjects(gameState) {
        // console.log("Game state received:", gameState);
        const gameStateString = JSON.stringify(gameState);
        console.log(gameStateString);
        // console.log(gameState.running);
        // tournament mode, not the winner, return to menu
        if (gameState.game_mode === "Tourney" && gameState.winner != this.username && !gameState.running) {
            console.log("Tournament mode, not the winner, return to menu");
            this.sceneRouterCallback("menuScene");
            return;
        }
        else if (gameState.game_mode != "Tourney" && !gameState.running) {
            console.log("Game not running, return to menu");
            this.sceneRouterCallback("menuScene");
            return;
        }
    
        [this.cuboidWidth, this.cuboidHeight, this.cuboidDepth] = gameState.cuboid.split(',').map(Number);
        [this.ballRadius, this.ball.position.x, this.ball.position.y, this.ball.position.z] = gameState.ball.split(',').map(Number);
    
        [this.paddleWidth, this.paddleHeight, this.paddleDepth] = gameState.paddle_dimensions.split(',').map(Number);
        [this.leftPaddle.position.x, this.leftPaddle.position.y, this.leftPaddle.position.z] = gameState.leftPaddle.split(',').map(Number);
        [this.rightPaddle.position.x, this.rightPaddle.position.y, this.rightPaddle.position.z] = gameState.rightPaddle.split(',').map(Number);
        [this.scoreLeft, this.scoreRight] = gameState.score.split(',').map(Number);
        [this.ballSpeedX, this.ballSpeedY] = gameState.ballSpeed.split(',').map(Number);
        [this.ballTarget.position.x, this.ballTarget.position.y, this.ballTarget.position.z] = gameState.ballTarget.split(',').map(Number);
    }

    sendMessage() {
        if (this.socket.readyState == this.socket.OPEN)
            this.socket.send(JSON.stringify({ 'keys': this.keys, 'paused': this.paused }));
    }

    rotateBoard() {
        let rotateSpeed = 0.025;
        const actions = {
            'i': () => this.group.rotation.x -= rotateSpeed, // rotate around x-axis
            'k': () => this.group.rotation.x += rotateSpeed,
            'j': () => this.group.rotation.y -= rotateSpeed, // rotate around y-axis
            'l': () => this.group.rotation.y += rotateSpeed,
            'u': () => this.group.rotation.z += rotateSpeed, // rotate around z-axis
            'o': () => this.group.rotation.z -= rotateSpeed,
            '=': () => this.camera.position.z -= rotateSpeed * 5, // zoom in/out
            '-': () => this.camera.position.z += rotateSpeed * 5,
            'r': () => {
                this.group.rotation.x = this.group.rotation.y = this.group.rotation.z = 0;
                this.camera.position.z = this.cameraZ;
            }
        };
        for (const key in this.key_rotate) {
            if (this.key_rotate[key] && key in actions) {
                actions[key]();
            }
        }
    }
    
    createExplosion(x, y, z, direction) {
        const particleCount = 75; // Number of particles
        const particles = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3); // 3 values per particle (x, y, z)
        let explosion_color;
        
        if (direction == 'left' || direction == 'right')
            explosion_color = this.paddleColor;
        if (direction == 'top' || direction == 'bottom')
            explosion_color = this.cuboidColor;
    
        const particleMaterial = new THREE.PointsMaterial({ color: explosion_color, size: 0.05, transparent: true, opacity: 0.8 });
        
        // Create the particles
        for (let i = 0; i < particleCount; i++) {
            if (direction == 'left')
                positions[i * 3] = x + Math.random() * 0.2; // Shift x to spread left
            else if (direction == 'right')
                positions[i * 3] = x - Math.random() * 0.2; // Shift x to spread right
            else
                positions[i * 3] = x + (Math.random() - 0.5) * 2;
    
            if (direction == 'top')
                positions[i * 3 + 1] = y - Math.random() * 0.2; // Shift y to spread up
            else if (direction == 'bottom')
                positions[i * 3 + 1] = y + Math.random() * 0.2; // Shift y to spread down
            else
                positions[i * 3 + 1] = y + (Math.random() - 0.5) * 2;
    
    
            positions[i * 3 + 2] = z + (Math.random() - 0.5) * 2; // Keep z spread as before
        }
    
        particles.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    
        const particleSystem = new THREE.Points(particles, particleMaterial);
    
        // Add particle system to the scene
        this.group.add(particleSystem);
    
    
        // Animate opacity
        let elapsed = 0;
        const duration = 1000; // 1 second
    
        const fadeAnimation = () => {
            elapsed += 16; // Approximately 16ms per frame
            const t = elapsed / duration;
            
            if (t <= 0.5) {
                // Fade in
                particleMaterial.opacity = t * 2; // Linearly interpolate from 0 to 1 over the first half of the duration
            } else if (t <= 1) {
                // Fade out
                particleMaterial.opacity = 2 - t * 2; // Linearly interpolate from 1 to 0 over the second half
            } else {
                // Remove particle system
                this.group.remove(particleSystem);
                return; // Stop animation
            }
    
            requestAnimationFrame(fadeAnimation);
        };
        
        fadeAnimation(); // Start the animation
    }

    checkBallPaddleCollision() {
        if (this.ball.position.x - this.ballRadius <= this.leftPaddle.position.x + this.paddleWidth/2 &&
            this.ball.position.y - this.ballRadius <= this.leftPaddle.position.y + this.paddleHeight/2 &&
            this.ball.position.y + this.ballRadius >= this.leftPaddle.position.y - this.paddleHeight/2) {
            return 'left';
        }
        else if (this.ball.position.x + this.ballRadius >= this.rightPaddle.position.x - this.paddleWidth/2 &&
            this.ball.position.y - this.ballRadius <= this.rightPaddle.position.y + this.paddleHeight/2 &&
            this.ball.position.y + this.ballRadius >= this.rightPaddle.position.y - this.paddleHeight/2) {
            return 'right';
        }
        else if (this.ball.position.y + this.ballRadius >= this.cuboidHeight/2)
            return 'top';
        else if (this.ball.position.y - this.ballRadius <= -this.cuboidHeight/2)
            return 'bottom';
        else {
            return 'none';
        }
    }

    createSnowfall(cuboidWidth, cuboidHeight, cuboidDepth, snowfallCount, scene) {

        // Create snowflake geometry
    
        const snowflakes = new THREE.BufferGeometry();
        // BufferGeometry is used to store the positions of the snowflakes
        // as it is more efficient than Geometry for large numbers of particles
    
        const snowflakePositions = new Float32Array(snowfallCount * 3);
        // Float32Array is used to store the positions of the snowflakes, it holds x, y, z for each snowflake
    
        // Initialize snowflake positions randomly within the cuboid dimensions
        for (let i = 0; i < snowfallCount; i++) {
            snowflakePositions[i * 3] = (Math.random() - 0.5) * cuboidWidth; // Random x
            snowflakePositions[i * 3 + 1] = (Math.random() - 0.5) * cuboidHeight;   // Random y (top to bottom)
            snowflakePositions[i * 3 + 2] = (Math.random() - 0.5) * cuboidDepth; // Random z
        }
    
        snowflakes.setAttribute('position', new THREE.BufferAttribute(snowflakePositions, 3));
    
        // Material for snowflakes
        const snowflakeMaterial = new THREE.PointsMaterial({
            color: 0xffffff,
            size: 0.05,
            transparent: true,
            opacity: 0.8
        });
    
        // Create the particle system
        const snowfallSystem = new THREE.Points(snowflakes, snowflakeMaterial);
        scene.add(snowfallSystem); // Add to the scene
        
    
        // Function to animate snowfall
        function animateSnowfall() {
            for (let i = 0; i < snowfallCount; i++) {
                snowflakePositions[i * 3 + 1] -= 0.02; // Snowflake falling down
                if (snowflakePositions[i * 3 + 1] < -cuboidHeight / 2) { 
                    // Reset snowflake to top when it goes below the cuboid
                    snowflakePositions[i * 3 + 1] = cuboidHeight / 2;
                }
            }
            snowfallSystem.geometry.attributes.position.needsUpdate = true; // Notify Three.js to update positions
        }
        // Update the snowflake positions to stimulate falling snow, if a snowflake goes below the cuboid, reset it to the top
    
        function removeSnowfall() {
            scene.remove(snowfallSystem); // Remove the particle system from the scene
            snowfallSystem.geometry.dispose(); // Dispose of the geometry
            snowfallSystem.material.dispose(); // Dispose of the material
        }
    
        return { animateSnowfall, removeSnowfall } ; // Return the animation function
    }

    toggleSnowfall() {
        if (this.snowfallActive) {
            // If snowfall is active, remove and stop it
            if (this.snowfallFunctions) {
                this.snowfallFunctions.removeSnowfall(); // Remove snowfall from the scene
            }
            this.snowfallActive = false;  // Set flag to false
        } else {
            // If snowfall is not active, create and animate it
            this.snowfallFunctions = this.createSnowfall(this.cuboidWidth, this.cuboidHeight, this.cuboidDepth * 8, 500, this.group); // Create snowfall
            this.snowfallActive = true;  // Set flag to true
        }
    }

    updateElement() {
        // console.log('DOM loaded:', this.DOMloaded);
        if (!this.DOMloaded)
            return;
        document.getElementById('score').textContent = `${this.scoreLeft} : ${this.scoreRight}`;
        document.getElementById('position').textContent = `Rotation: (x: ${this.group.rotation.x.toFixed(2)}, y: ${this.group.rotation.y.toFixed(2)}, z: ${this.group.rotation.z.toFixed(2)})`;
        document.getElementById('scale').textContent = `Camera: (z: ${this.camera.position.z.toFixed(2)})`;
        document.getElementById('leftPaddlePosition').textContent = `Left Paddle (y: ${this.leftPaddle.position.y.toFixed(2)})`;
        document.getElementById('rightPaddlePosition').textContent = `Right Paddle (y: ${this.rightPaddle.position.y.toFixed(2)})`;
        // document.getElementById('ballPosition').textContent = `Ball (x: ${this.ball.position.x.toFixed(2)}, y: ${this.ball.position.y.toFixed(2)})`;
        document.getElementById('ballSpeed').textContent = `Ball Speed (x: ${this.ballSpeedX.toFixed(4)}, y: ${this.ballSpeedY.toFixed(4)})`;
        
    }


    visualToogle() {
        let ballCollision = this.checkBallPaddleCollision();
        if (ballCollision != 'none' && this.keys['Collision_Particles'])
            this.createExplosion(this.ball.position.x, this.ball.position.y, this.ball.position.z, ballCollision);
    
        if (this.keys['Ball_Predict_Point'])
            this.ballTarget.visible = true;
        else
            this.ballTarget.visible = false;
    
        if (this.snowfallActive && this.snowfallFunctions) {
            this.snowfallFunctions.animateSnowfall(); // Animate snowfall if active
        }
    }

    animate() {
        this.sendMessage();
        this.rotateBoard();
        this.visualToogle();

        this.animationFrameId = requestAnimationFrame(this.animate.bind(this));
        this.renderer.render(this.scene, this.camera);
    }

}

export default Game;