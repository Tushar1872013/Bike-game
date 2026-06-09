// Mobile Controls Handler for Bike Game
// Handles touch input for joystick, brake, and nitro buttons

export class MobileControls {
  constructor() {
    // Input state tracking
    this.keys = {
      'w': false,  // accelerate/forward
      'a': false,  // steer left
      's': false,  // brake
      'd': false,  // steer right
      ' ': false,  // brake (space)
      'shift': false,  // nitro
      'c': false   // camera switch
    };

    // Touch tracking
    this.touches = new Map();
    this.joystickActive = false;
    this.joystickStartX = 0;
    this.joystickStartY = 0;

    // DOM elements
    this.joystickElement = document.getElementById('joystick');
    this.joystickStick = document.getElementById('joystick-stick');
    this.brakeBtnElement = document.getElementById('brake-btn');
    this.nitroBtnElement = document.getElementById('nitro-btn');
    this.cameraBtn = document.getElementById('camera-btn');

    this.setupTouchListeners();
  }

  setupTouchListeners() {
    // Joystick touch handlers
    if (this.joystickElement) {
      this.joystickElement.addEventListener('touchstart', (e) => this.handleJoystickStart(e));
      this.joystickElement.addEventListener('touchmove', (e) => this.handleJoystickMove(e));
      this.joystickElement.addEventListener('touchend', (e) => this.handleJoystickEnd(e));
      this.joystickElement.addEventListener('mousedown', (e) => this.handleJoystickStart(e));
      this.joystickElement.addEventListener('mousemove', (e) => this.handleJoystickMove(e));
      this.joystickElement.addEventListener('mouseup', (e) => this.handleJoystickEnd(e));
      this.joystickElement.addEventListener('mouseleave', (e) => this.handleJoystickEnd(e));
    }

    // Brake button handlers
    if (this.brakeBtnElement) {
      this.brakeBtnElement.addEventListener('touchstart', (e) => this.handleBrakeStart(e));
      this.brakeBtnElement.addEventListener('touchend', (e) => this.handleBrakeEnd(e));
      this.brakeBtnElement.addEventListener('mousedown', (e) => this.handleBrakeStart(e));
      this.brakeBtnElement.addEventListener('mouseup', (e) => this.handleBrakeEnd(e));
      this.brakeBtnElement.addEventListener('mouseleave', (e) => this.handleBrakeEnd(e));
    }

    // Nitro button handlers
    if (this.nitroBtnElement) {
      this.nitroBtnElement.addEventListener('touchstart', (e) => this.handleNitroStart(e));
      this.nitroBtnElement.addEventListener('touchend', (e) => this.handleNitroEnd(e));
      this.nitroBtnElement.addEventListener('mousedown', (e) => this.handleNitroStart(e));
      this.nitroBtnElement.addEventListener('mouseup', (e) => this.handleNitroEnd(e));
      this.nitroBtnElement.addEventListener('mouseleave', (e) => this.handleNitroEnd(e));
    }

    // Camera button handlers
    if (this.cameraBtn) {
      this.cameraBtn.addEventListener('touchstart', (e) => this.handleCameraClick(e));
      this.cameraBtn.addEventListener('click', (e) => this.handleCameraClick(e));
    }

    // Prevent default touch behaviors
    document.addEventListener('touchmove', (e) => {
      if (e.target.closest('.mobile-controls')) {
        e.preventDefault();
      }
    }, { passive: false });
  }

  handleJoystickStart(e) {
    e.preventDefault();
    this.joystickActive = true;

    // Get the starting position
    const rect = this.joystickElement.getBoundingClientRect();
    if (e.touches) {
      this.joystickStartX = e.touches[0].clientX - rect.left;
      this.joystickStartY = e.touches[0].clientY - rect.top;
    } else {
      this.joystickStartX = e.clientX - rect.left;
      this.joystickStartY = e.clientY - rect.top;
    }
  }

  handleJoystickMove(e) {
    if (!this.joystickActive) return;
    e.preventDefault();

    const rect = this.joystickElement.getBoundingClientRect();
    const maxRadius = rect.width / 2 - 20;

    let currentX, currentY;
    if (e.touches) {
      currentX = e.touches[0].clientX - rect.left;
      currentY = e.touches[0].clientY - rect.top;
    } else {
      currentX = e.clientX - rect.left;
      currentY = e.clientY - rect.top;
    }

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const deltaX = currentX - centerX;
    const deltaY = currentY - centerY;

    // Calculate distance from center
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    const angle = Math.atan2(deltaY, deltaX);

    // Apply max radius limit
    let stickX = deltaX;
    let stickY = deltaY;
    if (distance > maxRadius) {
      stickX = Math.cos(angle) * maxRadius;
      stickY = Math.sin(angle) * maxRadius;
    }

    // Update stick position
    if (this.joystickStick) {
      this.joystickStick.style.transform = `translate(${stickX}px, ${stickY}px)`;
    }

    // Update keys based on joystick position (threshold-based)
    const threshold = maxRadius * 0.3;

    this.keys['a'] = deltaX < -threshold;  // left
    this.keys['d'] = deltaX > threshold;   // right
    this.keys['w'] = deltaY < -threshold;  // up (accelerate)
    this.keys['s'] = deltaY > threshold;   // down (brake)
  }

  handleJoystickEnd(e) {
    e.preventDefault();
    this.joystickActive = false;

    // Reset stick position
    if (this.joystickStick) {
      this.joystickStick.style.transform = 'translate(0, 0)';
    }

    // Reset movement keys
    this.keys['a'] = false;
    this.keys['d'] = false;
    this.keys['w'] = false;
    this.keys['s'] = false;
  }

  handleBrakeStart(e) {
    e.preventDefault();
    this.keys['s'] = true;  // brake
    if (this.brakeBtnElement) {
      this.brakeBtnElement.classList.add('active');
    }
  }

  handleBrakeEnd(e) {
    e.preventDefault();
    this.keys['s'] = false;
    if (this.brakeBtnElement) {
      this.brakeBtnElement.classList.remove('active');
    }
  }

  handleNitroStart(e) {
    e.preventDefault();
    this.keys['shift'] = true;  // nitro
    if (this.nitroBtnElement) {
      this.nitroBtnElement.classList.add('active');
    }
  }

  handleNitroEnd(e) {
    e.preventDefault();
    this.keys['shift'] = false;
    if (this.nitroBtnElement) {
      this.nitroBtnElement.classList.remove('active');
    }
  }

  handleCameraClick(e) {
    e.preventDefault();
    this.keys['c'] = true;
    setTimeout(() => {
      this.keys['c'] = false;
    }, 100);
  }

  // Get key state (integrate with your input system)
  isKeyPressed(key) {
    return this.keys[key] || false;
  }

  // Get all active keys
  getActiveKeys() {
    return Object.keys(this.keys).filter(key => this.keys[key]);
  }

  // Set key state programmatically
  setKey(key, state) {
    if (this.keys.hasOwnProperty(key)) {
      this.keys[key] = state;
    }
  }
}

export default MobileControls;
