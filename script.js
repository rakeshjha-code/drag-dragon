const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const themeToggle = document.getElementById('theme-toggle');
const moonIcon = document.getElementById('moon-icon');
const sunIcon = document.getElementById('sun-icon');
const html = document.documentElement;

// --- Theme Management ---
let isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
updateTheme();

themeToggle.addEventListener('click', () => {
    isDark = !isDark;
    updateTheme();
});

function updateTheme() {
    html.setAttribute('data-theme', isDark ? 'dark' : 'light');
    moonIcon.style.display = isDark ? 'none' : 'block';
    sunIcon.style.display = isDark ? 'block' : 'none';
}

function getStyleVariable(name) {
    return getComputedStyle(html).getPropertyValue(name).trim();
}

// --- Canvas Sizing ---
let width, height;
function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
}
window.addEventListener('resize', resize);
resize();

// --- Mouse Tracking ---
let mouseX = width / 2;
let mouseY = height / 2;
let targetX = mouseX;
let targetY = mouseY;

window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
});
window.addEventListener('touchmove', (e) => {
    if (e.touches.length > 0) {
        mouseX = e.touches[0].clientX;
        mouseY = e.touches[0].clientY;
    }
}, { passive: true });

// --- Smooth Dragon Physics Setup ---
const numPoints = 60; // Extra long for elegance
const baseSpacing = 6; // Tighter spacing for smoother curves
let points = [];
for (let i = 0; i < numPoints; i++) {
    points.push({ x: width / 2, y: height / 2 });
}

function update() {
    const dragonColor = getStyleVariable('--dragon-color');
    const bgColor = getStyleVariable('--bg-color');
    
    ctx.clearRect(0, 0, width, height);
    
    // --- Smooth Movement Physics ---
    // Target follows mouse smoothly
    targetX += (mouseX - targetX) * 0.08; 
    targetY += (mouseY - targetY) * 0.08;
    
    // Head follows target
    points[0].x += (targetX - points[0].x) * 0.3;
    points[0].y += (targetY - points[0].y) * 0.3;
    
    // Inverse Kinematics for a flawless, non-wobbling spine
    for (let i = 1; i < numPoints; i++) {
        let prev = points[i - 1];
        let curr = points[i];
        
        let dx = prev.x - curr.x;
        let dy = prev.y - curr.y;
        let angle = Math.atan2(dy, dx);
        
        let tx = prev.x - Math.cos(angle) * baseSpacing;
        let ty = prev.y - Math.sin(angle) * baseSpacing;
        
        // High stiffness factor for fluid, graceful motion
        curr.x += (tx - curr.x) * 0.6;
        curr.y += (ty - curr.y) * 0.6;
    }

    // --- Geometry & Tattoo Aesthetics ---
    let leftPoints = [];
    let rightPoints = [];

    // Tapering profile
    function getThickness(i) {
        let t = i / (numPoints - 1);
        let profile = Math.sin(t * Math.PI) * 0.5 + (1 - t) * 0.8;
        return Math.max(1.5, profile * 12); // Sleek and narrow
    }

    // Calculate boundary points
    for (let i = 0; i < numPoints; i++) {
        let p = points[i];
        let angle;
        if (i === 0) {
            angle = Math.atan2(points[i+1].y - p.y, points[i+1].x - p.x);
        } else if (i === numPoints - 1) {
            angle = Math.atan2(p.y - points[i-1].y, p.x - points[i-1].x);
        } else {
            let dx = points[i+1].x - points[i-1].x;
            let dy = points[i+1].y - points[i-1].y;
            angle = Math.atan2(dy, dx);
        }
        
        let normal = angle + Math.PI / 2;
        let r = getThickness(i);
        
        leftPoints.push({ x: p.x + Math.cos(normal) * r, y: p.y + Math.sin(normal) * r });
        rightPoints.push({ x: p.x + Math.cos(normal + Math.PI) * r, y: p.y + Math.sin(normal + Math.PI) * r });
    }
    
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';

    // 1. Draw Sweeping Fin Blades (Line Art)
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = dragonColor;
    for (let i = 4; i < numPoints - 10; i += 6) {
        let p = points[i];
        let dx = leftPoints[i].x - p.x;
        let dy = leftPoints[i].y - p.y;
        
        // Backward directional vector
        let bx = points[i+1].x - p.x;
        let by = points[i+1].y - p.y;
        let blen = Math.hypot(bx, by) || 1;
        bx /= blen; 
        by /= blen;

        // Left blade
        ctx.beginPath();
        ctx.moveTo(leftPoints[i].x, leftPoints[i].y);
        let lCpX = leftPoints[i].x + dx * 1.5;
        let lCpY = leftPoints[i].y + dy * 1.5;
        let lTipX = p.x + dx * 4 + bx * 35;
        let lTipY = p.y + dy * 4 + by * 35;
        ctx.quadraticCurveTo(lCpX, lCpY, lTipX, lTipY);
        ctx.stroke();

        // Right blade
        let rx = rightPoints[i].x - p.x;
        let ry = rightPoints[i].y - p.y;
        ctx.beginPath();
        ctx.moveTo(rightPoints[i].x, rightPoints[i].y);
        let rCpX = rightPoints[i].x + rx * 1.5;
        let rCpY = rightPoints[i].y + ry * 1.5;
        let rTipX = p.x + rx * 4 + bx * 35;
        let rTipY = p.y + ry * 4 + by * 35;
        ctx.quadraticCurveTo(rCpX, rCpY, rTipX, rTipY);
        ctx.stroke();
    }

    // 2. Draw Main Body Outline (Negative Space Tattoo)
    ctx.lineWidth = 2.5;
    ctx.fillStyle = bgColor; // Fill with background to obscure underlying strokes
    ctx.strokeStyle = dragonColor;
    
    ctx.beginPath();
    ctx.moveTo(leftPoints[0].x, leftPoints[0].y);
    for(let i = 1; i < numPoints; i++) {
        ctx.lineTo(leftPoints[i].x, leftPoints[i].y);
    }
    
    // Sharp sweeping tail tip
    let tailAngle = Math.atan2(points[numPoints-1].y - points[numPoints-2].y, points[numPoints-1].x - points[numPoints-2].x);
    let tailTipX = points[numPoints-1].x + Math.cos(tailAngle) * 50; 
    let tailTipY = points[numPoints-1].y + Math.sin(tailAngle) * 50;
    
    ctx.quadraticCurveTo(tailTipX, tailTipY, rightPoints[numPoints-1].x, rightPoints[numPoints-1].y);
    
    for(let i = numPoints - 2; i >= 0; i--) {
        ctx.lineTo(rightPoints[i].x, rightPoints[i].y);
    }
    ctx.closePath();
    ctx.fill(); 
    ctx.stroke();

    // 3. Draw Inner Spinal Ridge
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for(let i = 1; i < numPoints; i++) {
        ctx.lineTo(points[i].x, points[i].y);
    }
    ctx.stroke();

    // 4. Draw Intricate V-Scales
    ctx.lineWidth = 1.0;
    for (let i = 2; i < numPoints - 3; i += 2) {
        let p = points[i];
        let bx = points[i+1].x - p.x;
        let by = points[i+1].y - p.y;
        let blen = Math.hypot(bx, by) || 1;
        bx = (bx / blen) * 8; 
        by = (by / blen) * 8;
        
        ctx.beginPath();
        ctx.moveTo(leftPoints[i].x, leftPoints[i].y);
        ctx.quadraticCurveTo(p.x + bx, p.y + by, rightPoints[i].x, rightPoints[i].y);
        ctx.stroke();
    }

    // 5. Draw Fierce Head
    let headAngle = Math.atan2(points[0].y - points[1].y, points[0].x - points[1].x);
    drawHead(points[0], headAngle, dragonColor, bgColor);

    requestAnimationFrame(update);
}

function drawHead(p, angle, dragonColor, bgColor) {
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(angle);
    
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = dragonColor;
    ctx.fillStyle = bgColor;
    
    // Snout and Jaw Outline
    ctx.beginPath();
    ctx.moveTo(35, 0); 
    ctx.lineTo(25, -8); 
    ctx.lineTo(10, -14); 
    ctx.lineTo(-5, -16); 
    ctx.lineTo(-15, -10); 
    ctx.lineTo(-15, 10);
    ctx.lineTo(-5, 16);
    ctx.lineTo(10, 14);
    ctx.lineTo(25, 8);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Jaw line separation
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(35, 0);
    ctx.lineTo(12, 0); 
    ctx.stroke();

    // Aggressive Triangle Eyes
    ctx.fillStyle = dragonColor;
    ctx.beginPath();
    ctx.moveTo(15, -5);
    ctx.lineTo(8, -9);
    ctx.lineTo(10, -3);
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(15, 5);
    ctx.lineTo(8, 9);
    ctx.lineTo(10, 3);
    ctx.fill();

    // Large Sweeping Horns
    ctx.lineWidth = 2;
    ctx.fillStyle = bgColor;
    ctx.beginPath();
    ctx.moveTo(0, -14); 
    ctx.quadraticCurveTo(-15, -45, -50, -35); 
    ctx.quadraticCurveTo(-20, -20, -10, -10); 
    ctx.fill();
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0, 14); 
    ctx.quadraticCurveTo(-15, 45, -50, 35); 
    ctx.quadraticCurveTo(-20, 20, -10, 10); 
    ctx.fill();
    ctx.stroke();

    // Extremely Long Elegant Whiskers
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(30, -5);
    ctx.bezierCurveTo(20, -50, -30, -50, -70, -35);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(30, 5);
    ctx.bezierCurveTo(20, 50, -30, 50, -70, 35);
    ctx.stroke();
    
    // Additional mane/crest lines
    ctx.beginPath();
    ctx.moveTo(-10, -5);
    ctx.quadraticCurveTo(-30, -20, -45, -15);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(-10, 5);
    ctx.quadraticCurveTo(-30, 20, -45, 15);
    ctx.stroke();

    ctx.restore();
}

// Start Animation
update();
