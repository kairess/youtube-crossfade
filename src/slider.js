// Find output DOM associated to the DOM element passed as parameter
function findOutputForSlider(element) {
  const idVal = element.id;
  outputs = document.getElementsByTagName('output');
  for (let i = 0; i < outputs.length; i++) {
    if (outputs[i].htmlFor == idVal) { return outputs[i]; }
  }
}

function getSliderOutputPosition(slider) {
  // Update output position
  let newPlace;
  let minValue;

  const style = window.getComputedStyle(slider, null);
  // Measure width of range input
  sliderWidth = parseInt(style.getPropertyValue('width'), 10);

  // Figure out placement percentage between left and right of input
  if (!slider.getAttribute('min')) {
    minValue = 0;
  } else {
    minValue = slider.getAttribute('min');
  }
  const newPoint = (slider.value - minValue) / (slider.getAttribute('max') - minValue);

  // Prevent bubble from going beyond left or right (unsupported browsers)
  if (newPoint < 0) {
    newPlace = 0;
  } else if (newPoint > 1) {
    newPlace = sliderWidth;
  } else {
    newPlace = sliderWidth * newPoint;
  }

  return {
    position: `${newPlace}px`,
  };
}

document.addEventListener('DOMContentLoaded', () => {
  // Get all document sliders
  const sliders = document.querySelectorAll('input[type="range"].slider');
  [].forEach.call(sliders, (slider) => {
    const output = findOutputForSlider(slider);
    if (output) {
      if (slider.classList.contains('has-output-tooltip')) {
        // Get new output position
        const newPosition = getSliderOutputPosition(slider);

        // Set output position
        output.style.left = newPosition.position;
      }

      // Add event listener to update output when slider value change
      slider.addEventListener('input', (event) => {
        if (event.target.classList.contains('has-output-tooltip')) {
          // Get new output position
          const newPosition = getSliderOutputPosition(event.target);

          // Set output position
          output.style.left = newPosition.position;
        }

        // Update output with slider value
        output.value = event.target.value;
      });
    }
  });
});
