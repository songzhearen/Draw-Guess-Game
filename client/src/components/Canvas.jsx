import React, { useRef, useEffect, useState } from 'react';

const Canvas = ({ socket, roomId, isDrawer, width = 800, height = 600 }) => {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState('#2f2f2f');
  const [lineWidth, setLineWidth] = useState(5);
  const lastPos = useRef({ x: 0, y: 0 });

  const colors = ['#2f2f2f', '#ff6b6b', '#4ecdc4', '#ffe66d', '#95a5a6', '#8e44ad', '#d35400', '#27ae60'];
  const sizes = [5, 10, 15, 20];
  const ERASER_COLOR = '#fdfbf7'; // Background color

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Set initial canvas properties
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    const handleResize = () => {
       // Get parent container dimensions
       const parent = canvas.parentElement;
       if (parent) {
         // Save current content
         const tempCanvas = document.createElement('canvas');
         tempCanvas.width = canvas.width;
         tempCanvas.height = canvas.height;
         tempCanvas.getContext('2d').drawImage(canvas, 0, 0);

         canvas.width = parent.clientWidth;
         canvas.height = parent.clientHeight;
         
         // Restore content
         ctx.drawImage(tempCanvas, 0, 0);

         // Re-apply context settings after resize
         ctx.lineCap = 'round';
         ctx.lineJoin = 'round';
       }
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Initial resize

    // Socket listeners for drawing
    socket.on('draw_data', (data) => {
      drawOnCanvas(ctx, data.x0, data.y0, data.x1, data.y1, data.color, data.width);
    });

    socket.on('clear_canvas', () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    });

    return () => {
      window.removeEventListener('resize', handleResize);
      socket.off('draw_data');
      socket.off('clear_canvas');
    };
  }, [socket]);

  const drawOnCanvas = (ctx, x0, y0, x1, y1, color, width) => {
    ctx.beginPath();
    ctx.moveTo(x0, y0);
    ctx.lineTo(x1, y1);
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    
    if (color === ERASER_COLOR) {
        ctx.shadowBlur = 0;
        ctx.stroke();
        return;
    }

    // Crayon effect: rough edges
    ctx.shadowBlur = 2;
    ctx.shadowColor = color;
    
    ctx.stroke();
    
    // Add some noise for crayon texture
    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth = 1;
    const length = Math.sqrt(Math.pow(x1-x0, 2) + Math.pow(y1-y0, 2));
    const steps = Math.ceil(length / 2);
    
    for(let i=0; i<steps; i++) {
        const t = i / steps;
        const x = x0 + (x1 - x0) * t;
        const y = y0 + (y1 - y0) * t;
        if (Math.random() > 0.8) {
            ctx.beginPath();
            ctx.arc(x + (Math.random()-0.5)*width, y + (Math.random()-0.5)*width, 1, 0, Math.PI*2);
            ctx.fillStyle = color;
            ctx.fill();
        }
    }
    ctx.restore();

    ctx.shadowBlur = 0; // Reset
  };

  const getPos = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY
    };
  };

  const startDrawing = (e) => {
    if (!isDrawer) {
        return;
    }
    setIsDrawing(true);
    const pos = getPos(e);
    lastPos.current = pos;
  };

  const draw = (e) => {
    if (!isDrawing || !isDrawer) return;
    const pos = getPos(e);
    
    const ctx = canvasRef.current.getContext('2d');
    drawOnCanvas(ctx, lastPos.current.x, lastPos.current.y, pos.x, pos.y, color, lineWidth);
    
    // Emit to server
    socket.emit('draw_data', {
      roomId,
      data: {
        x0: lastPos.current.x,
        y0: lastPos.current.y,
        x1: pos.x,
        y1: pos.y,
        color,
        width: lineWidth
      }
    });

    lastPos.current = pos;
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    if (!isDrawer) return;
    const ctx = canvasRef.current.getContext('2d');
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    socket.emit('clear_canvas', { roomId });
  };

  return (
    <div className="canvas-wrapper">
      <div className="canvas-container">
        <canvas
          ref={canvasRef}
          width={width}
          height={height}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseOut={stopDrawing}
          style={{ cursor: isDrawer ? (color === ERASER_COLOR ? 'cell' : 'crosshair') : 'default' }}
        />
      </div>
      
      {isDrawer && (
        <div className="tools">
          {colors.map(c => (
            <div 
              key={c} 
              className={`color-picker ${color === c ? 'active' : ''}`}
              style={{ backgroundColor: c }}
              onClick={() => setColor(c)}
              title="选择颜色"
            />
          ))}
          <div style={{ width: '20px' }}></div>
          {sizes.map(s => (
            <div
              key={s}
              className={`color-picker ${lineWidth === s ? 'active' : ''}`}
              style={{ 
                backgroundColor: '#ccc', 
                width: s + 10 + 'px', 
                height: s + 10 + 'px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              onClick={() => setLineWidth(s)}
              title="选择粗细"
            >
              <div style={{ width: s, height: s, borderRadius: '50%', background: 'black' }}></div>
            </div>
          ))}
          <div style={{ width: '20px' }}></div>
          <button 
            className={`btn-crayon ${color === ERASER_COLOR ? 'btn-primary' : ''}`} 
            style={{ padding: '5px 15px', fontSize: '1rem' }} 
            onClick={() => { setColor(ERASER_COLOR); setLineWidth(20); }}
          >
            橡皮擦
          </button>
          <button className="btn-crayon" style={{ padding: '5px 15px', fontSize: '1rem' }} onClick={clearCanvas}>清空</button>
        </div>
      )}
    </div>
  );
};

export default Canvas;
