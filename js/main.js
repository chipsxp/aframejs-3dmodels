// Global state to track the currently focused model
let focusedModel = null;

// Register the interactive component for 3D models
AFRAME.registerComponent('interactive-model', {
  init: function () {
    const el = this.el;
    
    // Add click handler
    el.addEventListener('click', function () {
      console.log('Model clicked:', el.getAttribute('src'));
      if (el.hasAttribute('data-focused')) {
        // Unfocus model - move back to original position
        el.removeAttribute('data-focused');
        focusedModel = null;
        if (el.components.animation) {
          el.components.animation.play();
        }
        var originalPos = el.getAttribute('data-original-position');
        
        // Validate original position before setting it
        if (originalPos) {
          // Parse the position to ensure it's valid
          var posObj;
          if (typeof originalPos === 'string') {
            // Handle string format "x y z"
            var coords = originalPos.split(' ');
            if (coords.length === 3) {
              posObj = {
                x: parseFloat(coords[0]),
                y: parseFloat(coords[1]),
                z: parseFloat(coords[2])
              };
            }
          } else {
            posObj = originalPos;
          }
          
          // Validate position values
          if (posObj && 
              !isNaN(posObj.x) && !isNaN(posObj.y) && !isNaN(posObj.z) &&
              isFinite(posObj.x) && isFinite(posObj.y) && isFinite(posObj.z)) {
            el.setAttribute('position', posObj);
          } else {
            console.warn('Invalid original position for model, using default position');
            // Fallback to a safe default position
            el.setAttribute('position', {x: 0, y: 2, z: -5});
          }
        } else {
          console.warn('No original position found for model, using default position');
          // Fallback to a safe default position
          el.setAttribute('position', {x: 0, y: 2, z: -5});
        }
        
        el.setAttribute('scale', '0.7 0.7 0.7');
        
        // Reset camera rig position
        var cameraRig = document.getElementById('camera-rig');
        if (cameraRig) {
          cameraRig.setAttribute('position', '0 2 0');
        }
        
        // Hide the card
        var card = document.getElementById('model-card');
        if (card) {
          card.style.display = 'none';
        }
        
        // Disable control buttons
        updateButtonStates(false);
      } else {
        // Focus model - move to center of scene
        el.setAttribute('data-focused', 'true');
        focusedModel = el;
        if (el.components.animation) {
          el.components.animation.pause();
        }
        var currentPos = el.getAttribute('position');
        el.setAttribute('data-original-position', currentPos);
        
        // Move model to center of scene (in front of camera)
        el.setAttribute('position', {x: 0, y: 2, z: -6});
        el.setAttribute('scale', '0.8 0.8 0.8');
        
        // Move camera closer to focus on model
        var cameraRig = document.getElementById('camera-rig');
        if (cameraRig) {
          cameraRig.setAttribute('position', '0 2 0');
        }
        
        // Show card and set title
        var title = el.getAttribute('data-title') || 'Model';
        var card = document.getElementById('model-card');
        if (card) {
          card.style.display = 'block';
          var titleEl = document.getElementById('model-title');
          titleEl.innerText = title;
        }
        
        // Enable control buttons
        updateButtonStates(true);
      }
    });

    // Add hover handlers for animation control
    el.addEventListener('mouseenter', function () {
      console.log('Mouse entered model:', el.getAttribute('src'));
      if (!el.hasAttribute('data-focused') && el.components.animation) {
        el.components.animation.pause();
      }
    });

    el.addEventListener('mouseleave', function () {
      console.log('Mouse left model:', el.getAttribute('src'));
      if (!el.hasAttribute('data-focused') && el.components.animation) {
        el.components.animation.play();
      }
    });
  }
});

// Handle asset loading events
document.addEventListener('DOMContentLoaded', function () {
  const scene = document.querySelector('a-scene');
  
  scene.addEventListener('model-error', function (event) {
    console.error('Model loading error:', event.detail);
  });
  
  scene.addEventListener('model-loaded', function (event) {
    console.log('Model loaded successfully:', event.target.getAttribute('src'));
  });

  // Close card handler
  const closeBtn = document.getElementById('close-card');
  if (closeBtn) {
    closeBtn.addEventListener('click', function () {
      const models = document.querySelectorAll('.interactive');
      models.forEach(model => {
        if (model.hasAttribute('data-focused')) {
          model.removeAttribute('data-focused');
          focusedModel = null;
          if (model.components.animation) {
            model.components.animation.play();
          }
          
          // Get original position with validation
          var originalPos = model.getAttribute('data-original-position');
          if (originalPos) {
            // Parse the position to ensure it's valid
            var posObj;
            if (typeof originalPos === 'string') {
              // Handle string format "x y z"
              var coords = originalPos.split(' ');
              if (coords.length === 3) {
                posObj = {
                  x: parseFloat(coords[0]),
                  y: parseFloat(coords[1]),
                  z: parseFloat(coords[2])
                };
              }
            } else {
              posObj = originalPos;
            }
            
            // Validate position values
            if (posObj && 
                !isNaN(posObj.x) && !isNaN(posObj.y) && !isNaN(posObj.z) &&
                isFinite(posObj.x) && isFinite(posObj.y) && isFinite(posObj.z)) {
              model.setAttribute('position', posObj);
            } else {
              console.warn('Invalid original position for model, using default position');
              // Fallback to a safe default position
              model.setAttribute('position', {x: 0, y: 2, z: -5});
            }
          } else {
            console.warn('No original position found for model, using default position');
            // Fallback to a safe default position
            model.setAttribute('position', {x: 0, y: 2, z: -5});
          }
          
          model.setAttribute('scale', '0.7 0.7 0.7');
          
          // Reset camera position
          var cameraRig = document.getElementById('camera-rig');
          if (cameraRig) {
            cameraRig.setAttribute('position', '0 2 0');
          }
        }
      });
      
      // Hide the card
      const card = document.getElementById('model-card');
      if (card) {
        card.style.display = 'none';
      }
      
      // Disable control buttons
      updateButtonStates(false);
    });
  }

  // Button event listeners
  setupButtonListeners();
});

// Setup button event listeners
function setupButtonListeners() {
  // Zoom in button
  const zoomInBtn = document.getElementById('zoom-in-btn');
  if (zoomInBtn) {
    zoomInBtn.addEventListener('click', zoomIn);
  }

  // Zoom out button
  const zoomOutBtn = document.getElementById('zoom-out-btn');
  if (zoomOutBtn) {
    zoomOutBtn.addEventListener('click', zoomOut);
  }

  // Rotate left button
  const rotateLeftBtn = document.getElementById('rotate-left-btn');
  if (rotateLeftBtn) {
    rotateLeftBtn.addEventListener('click', rotateLeft);
  }

  // Rotate right button
  const rotateRightBtn = document.getElementById('rotate-right-btn');
  if (rotateRightBtn) {
    rotateRightBtn.addEventListener('click', rotateRight);
  }

  // Screenshot button
  const screenshotBtn = document.getElementById('screenshot-btn');
  if (screenshotBtn) {
    screenshotBtn.addEventListener('click', takeScreenshotAndShare);
  }

  // Share button
  const shareBtn = document.getElementById('share-btn');
  if (shareBtn) {
    shareBtn.addEventListener('click', shareModel);
  }

  // Initially disable buttons
  updateButtonStates(false);
}

// Update button states based on model focus
function updateButtonStates(enabled) {
  const buttons = [
    'zoom-in-btn',
    'zoom-out-btn',
    'rotate-left-btn',
    'rotate-right-btn',
    'screenshot-btn',
    'share-btn'
  ];
  
  buttons.forEach(buttonId => {
    const button = document.getElementById(buttonId);
    if (button) {
      button.disabled = !enabled;
      button.style.opacity = enabled ? '1' : '0.5';
      button.style.cursor = enabled ? 'pointer' : 'not-allowed';
    }
  });
}

// Zoom functions
function zoomIn() {
  if (!focusedModel) return;
  
  // Get current scale
  const currentScale = focusedModel.getAttribute('scale');
  const newScale = {
    x: currentScale.x * 1.2,
    y: currentScale.y * 1.2,
    z: currentScale.z * 1.2
  };
  focusedModel.setAttribute('scale', newScale);
}

function zoomOut() {
  if (!focusedModel) return;
  
  // Get current scale
  const currentScale = focusedModel.getAttribute('scale');
  const newScale = {
    x: currentScale.x * 0.8,
    y: currentScale.y * 0.8,
    z: currentScale.z * 0.8
  };
  focusedModel.setAttribute('scale', newScale);
}

// Rotate functions
function rotateLeft() {
  if (!focusedModel) return;
  
  // Get current rotation
  const currentRotation = focusedModel.getAttribute('rotation');
  const newRotation = {
    x: currentRotation.x,
    y: currentRotation.y + 15,
    z: currentRotation.z
  };
  focusedModel.setAttribute('rotation', newRotation);
}

function rotateRight() {
  if (!focusedModel) return;
  
  // Get current rotation
  const currentRotation = focusedModel.getAttribute('rotation');
  const newRotation = {
    x: currentRotation.x,
    y: currentRotation.y - 15,
    z: currentRotation.z
  };
  focusedModel.setAttribute('rotation', newRotation);
}

// Screenshot and share functions
function takeScreenshotAndShare() {
  const scene = document.querySelector('a-scene');
  if (!scene) return;
  
  // Use A-Frame's built-in screenshot functionality for WebGL content
  try {
    // Capture the scene using A-Frame's screenshot component
    const screenshotBlob = scene.components.screenshot.getCanvas().toBlob(function(blob) {
      if (navigator.share && blob) {
        navigator.share({
          title: document.getElementById('model-title').innerText,
          text: 'Check out this model!',
          files: [new File([blob], 'model-screenshot.png', { type: 'image/png' })]
        })
        .then(() => console.log('Share successful'))
        .catch((error) => console.error('Share failed:', error));
      } else {
        // Fallback for browsers that don't support Web Share API
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = 'model-screenshot.png';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(a.href);
      }
    }, 'image/png');
  } catch (error) {
    console.error('Screenshot failed:', error);
    // Fallback to html2canvas if A-Frame screenshot fails
    if (typeof html2canvas !== 'undefined') {
      html2canvas(scene, {
        width: scene.clientWidth,
        height: scene.clientHeight
      }).then(canvas => {
        canvas.toBlob(function(blob) {
          if (navigator.share && blob) {
            navigator.share({
              title: document.getElementById('model-title').innerText,
              text: 'Check out this model!',
              files: [new File([blob], 'model-screenshot.png', { type: 'image/png' })]
            })
            .then(() => console.log('Share successful'))
            .catch((error) => console.error('Share failed:', error));
          } else {
            const a = document.createElement('a');
            a.href = URL.createObjectURL(blob);
            a.download = 'model-screenshot.png';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(a.href);
          }
        }, 'image/png');
      });
    }
  }
}

function shareModel() {
  const title = document.getElementById('model-title').innerText;
  const url = window.location.href;
  
  if (navigator.share) {
    navigator.share({
      title: title,
      text: 'Check out this 3D model!',
      url: url
    })
    .then(() => console.log('Share successful'))
    .catch((error) => console.error('Share failed:', error));
  } else {
    // Fallback for browsers that don't support Web Share API
    navigator.clipboard.writeText(url).then(() => {
      alert('Model URL copied to clipboard!');
    }).catch((error) => {
      console.error('Copy failed:', error);
      // Fallback to prompt
      prompt('Copy this URL:', url);
    });
  }
}
