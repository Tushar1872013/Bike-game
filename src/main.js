import './styles/style.css';
import MobileControls from './mobile-controls.js';
import { Game } from './core/game.js';

// Initialize mobile controls
const mobileControls = new MobileControls();

// Export mobile controls so other modules can use it
window.mobileControls = mobileControls;

const game = new Game(document.querySelector('#game'));
game.start();
