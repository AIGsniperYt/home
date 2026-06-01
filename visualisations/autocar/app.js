
/* ---------- app.js ---------- */

// app.js - external JS file (place next to index.html and car.png)
(function(){
  const canvas = document.getElementById('gridCanvas');
  const ctx = canvas.getContext('2d');
  const stageIndicator = document.getElementById('stageIndicator');

  // Grid settings
  const defaultCellSize = 48; // fallback px
  const cols = 18;
  const rows = 12;

  // Internal grid state (walls/elevated blocks). Do NOT overwrite this with arrow or car data.
  const grid = Array.from({length:rows},()=>Array.from({length:cols},()=>false));

  // External dynamic data
  let arrowData = null; // { start:{x,y}, targetTile:{tx,ty} }
  let carData = null;   // { tx, ty, x, y, angle }
  let rightClickStage = 0; // 0 = waiting for target, 1 = waiting for start

  // runtime cell size (kept in JS; HTML doesn't need to change)
  let cellSize = defaultCellSize;

  // last mouse pos (canvas coords)
  const lastMouse = {x:0,y:0};

  // load car image (must be in same folder)
  const carImg = new Image();
  carImg.src = 'car.png';
  carImg.onload = ()=> draw();
  carImg.onerror = ()=> console.warn('car.png failed to load - place car.png in same folder');

  // Resize canvas to keep tiles square and fit within window
  function resize(){
    const maxWidth = Math.floor(window.innerWidth * 0.95);
    const maxHeight = Math.floor(window.innerHeight * 0.95);

    const scaleX = Math.floor(maxWidth / cols) || defaultCellSize;
    const scaleY = Math.floor(maxHeight / rows) || defaultCellSize;
    const newCellSize = Math.max(8, Math.min(scaleX, scaleY));

    cellSize = newCellSize;
    canvas.width = cols * cellSize;
    canvas.height = rows * cellSize;
    canvas.style.width = canvas.width + 'px';
    canvas.style.height = canvas.height + 'px';
    draw();
  }
  window.addEventListener('resize', resize);
  resize();

  // Helpers
  function getMousePos(evt){
    const rect = canvas.getBoundingClientRect();
    return { x: (evt.clientX - rect.left) * (canvas.width / rect.width),
             y: (evt.clientY - rect.top)  * (canvas.height / rect.height) };
  }
  function toTile(pos){
    return {tx: Math.floor(pos.x / cellSize), ty: Math.floor(pos.y / cellSize)};
  }
  function tileCenter(tx,ty){
    return { x: tx*cellSize + cellSize/2, y: ty*cellSize + cellSize/2 };
  }

  // Drawing
  function draw(){
    // background
    ctx.clearRect(0,0,canvas.width,canvas.height);
    ctx.fillStyle = '#07101a';
    ctx.fillRect(0,0,canvas.width,canvas.height);

    // grid lines
    ctx.strokeStyle = 'rgba(255,255,255,0.03)';
    ctx.lineWidth = 1;
    for(let x=0;x<=cols;x++){
      ctx.beginPath(); ctx.moveTo(x*cellSize,0); ctx.lineTo(x*cellSize,canvas.height); ctx.stroke();
    }
    for(let y=0;y<=rows;y++){
      ctx.beginPath(); ctx.moveTo(0,y*cellSize); ctx.lineTo(canvas.width,y*cellSize); ctx.stroke();
    }

    // walls (elevated blocks)
    for(let y=0;y<rows;y++){
      for(let x=0;x<cols;x++){
        if(grid[y][x]){
          ctx.fillStyle = '#9aa8b8';
          ctx.fillRect(x*cellSize+2, y*cellSize+2, cellSize-4, cellSize-4);
          // little shadow to show elevation
          ctx.fillStyle = 'rgba(0,0,0,0.12)';
          ctx.fillRect(x*cellSize+2, y*cellSize+cellSize-10, cellSize-4, 6);
        }
      }
    }

    // If target tile selected (part of arrowData)
    if(arrowData && arrowData.targetTile){
      const {tx,ty} = arrowData.targetTile;
      const c = tileCenter(tx,ty);
      ctx.beginPath(); ctx.arc(c.x, c.y, Math.min(cellSize*0.22,10), 0, Math.PI*2); ctx.fillStyle='#7ee0a8'; ctx.fill();
      ctx.strokeStyle='rgba(126,224,168,0.6)'; ctx.lineWidth=2; ctx.stroke();
    }

    // Draw arrow if both start and target exist
    if(arrowData && arrowData.start && arrowData.targetTile){
      const start = arrowData.start; // {x,y} continuous
      const targetC = tileCenter(arrowData.targetTile.tx, arrowData.targetTile.ty);
      const dx = targetC.x - start.x;
      const dy = targetC.y - start.y;
      const dist = Math.hypot(dx,dy);
      if(dist > 2){
        // draw main line
        ctx.beginPath(); ctx.moveTo(start.x, start.y); ctx.lineTo(targetC.x, targetC.y);
        ctx.strokeStyle = 'rgba(126,224,168,0.95)'; ctx.lineWidth = 4; ctx.lineCap='round'; ctx.stroke();

        // arrow head (triangle)
        const headLen = Math.min(18, Math.max(8, dist*0.08));
        const angle = Math.atan2(dy,dx);
        ctx.beginPath();
        ctx.moveTo(targetC.x, targetC.y);
        ctx.lineTo(targetC.x - headLen*Math.cos(angle - Math.PI/6), targetC.y - headLen*Math.sin(angle - Math.PI/6));
        ctx.lineTo(targetC.x - headLen*Math.cos(angle + Math.PI/6), targetC.y - headLen*Math.sin(angle + Math.PI/6));
        ctx.closePath();
        ctx.fillStyle = 'rgba(126,224,168,0.98)'; ctx.fill();

        // magnitude indicator - small circle at start scaled by distance
        const scaleR = Math.min(14, 6 + dist*0.03);
        ctx.beginPath(); ctx.arc(start.x, start.y, scaleR, 0, Math.PI*2); ctx.fillStyle='rgba(126,224,168,0.18)'; ctx.fill();
        ctx.strokeStyle='rgba(126,224,168,0.4)'; ctx.lineWidth=1; ctx.stroke();
      }
    }

    // Draw car on top if exists
    if(carData){
      const cx = carData.x;
      const cy = carData.y;
      const angle = carData.angle || 0; // radians

      // size: fit inside tile with padding
      const drawW = Math.max(8, cellSize * 0.78);
      const drawH = Math.max(8, cellSize * 0.5);

      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(angle);
      // car.png faces RIGHT in image; angle 0 = facing right
      if(carImg.complete && carImg.naturalWidth){
        ctx.drawImage(carImg, -drawW/2, -drawH/2, drawW, drawH);
      } else {
        // fallback rectangle
        ctx.fillStyle = '#ffd66b';
        ctx.fillRect(-drawW/2, -drawH/2, drawW, drawH);
      }
      ctx.restore();

      // optional small direction indicator
      ctx.beginPath(); ctx.moveTo(cx, cy);
      ctx.lineTo(cx + Math.cos(angle) * (cellSize*0.45), cy + Math.sin(angle) * (cellSize*0.45));
      ctx.strokeStyle = 'rgba(255,255,255,0.12)'; ctx.lineWidth = 2; ctx.stroke();
    }
  }

  // Input handling
  canvas.addEventListener('contextmenu', e=>e.preventDefault());

  canvas.addEventListener('mousemove', (evt)=>{
    const pos = getMousePos(evt);
    lastMouse.x = pos.x; lastMouse.y = pos.y;
  });

  // Use mousedown for left/middle/right interactions. Prevent default for middle clicks.
  canvas.addEventListener('mousedown', (evt)=>{
    evt.preventDefault();
    const pos = getMousePos(evt);
    const {tx,ty} = toTile(pos);
    if(tx<0||ty<0||tx>=cols||ty>=rows) return;

    if(evt.button === 0){ // left click -> toggle wall
      grid[ty][tx] = !grid[ty][tx];
      draw();
      return;
    }

    if(evt.button === 1){ // middle click -> place car
      const center = tileCenter(tx,ty);
      const angle = (arrowData && arrowData.targetTile)
        ? Math.atan2( tileCenter(arrowData.targetTile.tx, arrowData.targetTile.ty).y - center.y,
                      tileCenter(arrowData.targetTile.tx, arrowData.targetTile.ty).x - center.x )
        : 0; // default face right

      carData = { tx, ty, x: center.x, y: center.y, angle };
      draw();
      return;
    }

    if(evt.button === 2){ // right click -> target / start sequence
      if(rightClickStage === 0){
        // set target tile (where arrow should point to). Only store tile coords.
        arrowData = arrowData || {};
        arrowData.targetTile = {tx,ty};
        // keep start untouched until second click
        rightClickStage = 1;
        stageIndicator.textContent = 'Stage: target set — now right-click to set START (arrow origin)';
        draw();
        return;
      } else {
        // set start position (continuous) - do not overwrite grid
        const center = tileCenter(tx,ty);
        arrowData = arrowData || {};
        arrowData.start = { x: center.x, y: center.y };
        // after placing both, reset stage to 0 so next right-click begins a new arrow target selection
        rightClickStage = 0;
        stageIndicator.textContent = 'Stage: waiting for target (right-click)';
        draw();
        return;
      }
    }
  });

  // simple keyboard helper: press C to clear arrow, R to reset grid, X to remove car, K to place car at mouse tile
  window.addEventListener('keydown', (e)=>{
    if(e.key === 'c'){
      arrowData = null; draw();
    }
    if(e.key === 'r'){
      for(let y=0;y<rows;y++) for(let x=0;x<cols;x++) grid[y][x] = false;
      arrowData = null; carData = null; draw();
    }
    if(e.key === 'x'){
      carData = null; draw();
    }
    if(e.key === 'k'){
      // place car at current mouse tile
      const {tx,ty} = toTile(lastMouse);
      if(tx<0||ty<0||tx>=cols||ty>=rows) return;
      const center = tileCenter(tx,ty);
      const angle = (arrowData && arrowData.targetTile)
        ? Math.atan2( tileCenter(arrowData.targetTile.tx, arrowData.targetTile.ty).y - center.y,
                      tileCenter(arrowData.targetTile.tx, arrowData.targetTile.ty).x - center.x )
        : 0;
      carData = { tx, ty, x: center.x, y: center.y, angle };
      draw();
    }
  });

  // initial draw
  draw();

})();
