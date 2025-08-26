// Register the interactive component for 3D models
AFRAME.registerComponent('interactive-model', {
  init: function () {
    const el = this.el;
    
    // Add click handler
    el.addEventListener('click', function () {
      console.log('Model clicked:', el.getAttribute('src'));
    });

    // Add hover handlers for animation control
    el.addEventListener('mouseenter', function () {
      console.log('Mouse entered model:', el.getAttribute('src'));
      if (el.components.animation) {
        el.components.animation.pause();
      }
    });

    el.addEventListener('mouseleave', function () {
      console.log('Mouse left model:', el.getAttribute('src'));
      if (el.components.animation) {
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
});
