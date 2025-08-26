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
      } else {
        // Focus model - move to center of scene
        el.setAttribute('data-focused', 'true');
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
    });
  }

  // Screenshot and share functionality
  const screenshotBtn = document.getElementById('screenshot-btn');
  if (screenshotBtn) {
    screenshotBtn.addEventListener('click', function () {
      takeScreenshotAndShare();
    });
  }

  function takeScreenshotAndShare() {
    const scene = document.querySelector('a-scene');
    html2canvas(scene, {
      width: scene.clientWidth,
      height: scene.clientHeight
    }).then(canvas => {
      canvas.toBlob(function(blob) {
        if (navigator.share) {
          navigator.share({
            title: document.getElementById('model-title').innerText,
            text: 'Check out this model!',
            files: [blob]
          })
          .then(() => console.log('Share successful'))
          .catch((error) => console.error('Share failed:', error));
        } else {
          const a = document.createElement('a');
          a(href=URL.createObjectURL(blob));
          a.download = 'model-screenshot.png';
          document.body.appendChild(a);
          a.click();
          a.remove();
        }
      }, 'image/png');
    });
  }
});
