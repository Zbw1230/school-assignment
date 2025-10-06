'use client';

import { useEffect, useRef, useState } from 'react';

const Canvas = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [dimensions, setDimensions] = useState({ 
    width: typeof window !== 'undefined' ? window.innerWidth : 800, 
    height: typeof window !== 'undefined' ? window.innerHeight : 600 
  });
  const [isDrawing, setIsDrawing] = useState(false);

  // Update canvas dimensions when window resizes
  useEffect(() => {
    const updateDimensions = () => {
      if (canvasRef.current) {
        // Calculate available space (accounting for any UI elements)
        const availableWidth = window.innerWidth > 768 
          ? window.innerWidth - 256 // Subtract sidebar width on desktop
          : window.innerWidth; // Full width on mobile
          
        const availableHeight = window.innerHeight - (window.innerWidth <= 768 ? 60 : 0); // Subtract mobile header height if needed
        
        setDimensions({
          width: availableWidth,
          height: availableHeight
        });
      }
    };

    // Set initial dimensions
    updateDimensions();
    
    // Add event listener
    window.addEventListener('resize', updateDimensions);

    // Clean up event listener
    return () => {
      window.removeEventListener('resize', updateDimensions);
    };
  }, []);

  // Set canvas dimensions when dimensions change
  useEffect(() => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      canvas.width = dimensions.width;
      canvas.height = dimensions.height;
      
      // Get 2D context and draw something as a placeholder
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Set background
        ctx.fillStyle = '#f9f9f9';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Draw border
        ctx.strokeStyle = '#ddd';
        ctx.lineWidth = 1;
        ctx.strokeRect(0, 0, canvas.width, canvas.height);
        
        // Draw placeholder text
        ctx.fillStyle = '#999';
        ctx.font = '20px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Canvas Area - Draw something!', canvas.width / 2, canvas.height / 2);
      }
    }
  }, [dimensions]);

  // Drawing functions
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#000000';
    
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.closePath();
    setIsDrawing(false);
  };

  // Export functions
  const exportCanvas = (format: 'png' | 'jpeg' | 'webp') => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const link = document.createElement('a');
    link.download = `canvas.${format}`;
    
    // Different export formats
    if (format === 'png') {
      link.href = canvas.toDataURL('image/png');
    } else if (format === 'jpeg') {
      link.href = canvas.toDataURL('image/jpeg', 0.9);
    } else if (format === 'webp') {
      link.href = canvas.toDataURL('image/webp', 0.9);
    }
    
    link.click();
  };

  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex space-x-2 p-2 bg-gray-100">
        <button 
          onClick={() => exportCanvas('png')} 
          className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Export PNG
        </button>
        <button 
          onClick={() => exportCanvas('jpeg')} 
          className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Export JPEG
        </button>
        <button 
          onClick={() => exportCanvas('webp')} 
          className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Export WebP
        </button>
      </div>
      <div className="flex-1 flex items-center justify-center overflow-auto">
        <canvas
          ref={canvasRef}
          width={dimensions.width}
          height={dimensions.height}
          className="border border-gray-300 bg-white cursor-crosshair"
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
        />
      </div>
    </div>
  );
};

export default Canvas;