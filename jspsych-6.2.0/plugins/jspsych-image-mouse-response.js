/**
 * jspsych-image-mouse-response
 * modified by Thomas Marwitz
 *
 * plugin for displaying a stimulus (image) and getting a mouse response
 *
 * documentation: docs.jspsych.org
 *
 **/

var MOUSE_KEYS = {
  0: "left_click",
  1: "middle_click",
  2: "right_click",
}

var MOUSE_CODE_LOOKUP = {
  "left_click": 0,
  "middle_click": 1,
  "right_click": 2,
}


jsPsych.plugins["image-mouse-response"] = (function() {

  var plugin = {};

  jsPsych.pluginAPI.registerPreload('image-mouse-response', 'stimulus', 'image'); // can we change this?

  plugin.info = {
    name: 'image-mouse-response',
    description: '',
    parameters: {
      stimulus: {
        type: jsPsych.plugins.parameterType.IMAGE,
        pretty_name: 'Stimulus',
        default: undefined,
        description: 'The image to be displayed'
      },
      stimulus_height: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Image height',
        default: null,
        description: 'Set the image height in pixels'
      },
      stimulus_width: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Image width',
        default: null,
        description: 'Set the image width in pixels'
      },
      maintain_aspect_ratio: {
        type: jsPsych.plugins.parameterType.BOOL,
        pretty_name: 'Maintain aspect ratio',
        default: true,
        description: 'Maintain the aspect ratio after setting width or height'
      },
      choices: {
        type: jsPsych.plugins.parameterType.KEYCODE,
        array: true,
        pretty_name: 'Choices',
        default: jsPsych.ALL_KEYS,
        description: 'The keys the subject is allowed to press to respond to the stimulus.'
      },
      prompt: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'Prompt',
        default: null,
        description: 'Any content here will be displayed below the stimulus.'
      },
      stimulus_duration: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Stimulus duration',
        default: null,
        description: 'How long to hide the stimulus.'
      },
      trial_duration: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Trial duration',
        default: null,
        description: 'How long to show trial before it ends.'
      },
      response_ends_trial: {
        type: jsPsych.plugins.parameterType.BOOL,
        pretty_name: 'Response ends trial',
        default: true,
        description: 'If true, trial will end when subject makes a response.'
      },
      render_on_canvas: {
        type: jsPsych.plugins.parameterType.BOOL,
        pretty_name: 'Render on canvas',
        default: true,
        description: 'If true, the image will be drawn onto a canvas element (prevents blank screen between consecutive images in some browsers).'+
          'If false, the image will be shown via an img element.'
      }
    }
  }

  plugin.trial = function(display_element, trial) {

    console.log(trial.stimulus);
    var height, width;
    if (trial.render_on_canvas) {
      // first clear the display element (because the render_on_canvas method appends to display_element instead of overwriting it with .innerHTML)
      if (display_element.hasChildNodes()) {
        // can't loop through child list because the list will be modified by .removeChild()
        while (display_element.firstChild) {
          display_element.removeChild(display_element.firstChild);
        }
      }
      // create canvas element and image
      var canvas = document.createElement("canvas");
      canvas.id = "jspsych-image-mouse-response-stimulus";
      canvas.style.margin = 0;
      canvas.style.padding = 0;
      var img = new Image();   
      img.src = trial.stimulus;
      // determine image height and width
      if (trial.stimulus_height !== null) {
        height = trial.stimulus_height;
        if (trial.stimulus_width == null && trial.maintain_aspect_ratio) {
          width = img.naturalWidth * (trial.stimulus_height/img.naturalHeight);
        }
      } else {
        height = img.naturalHeight;
      }
      if (trial.stimulus_width !== null) {
        width = trial.stimulus_width;
        if (trial.stimulus_height == null && trial.maintain_aspect_ratio) {
          height = img.naturalHeight * (trial.stimulus_width/img.naturalWidth);
        }
      } else if (!(trial.stimulus_height !== null & trial.maintain_aspect_ratio)) {
        // if stimulus width is null, only use the image's natural width if the width value wasn't set 
        // in the if statement above, based on a specified height and maintain_aspect_ratio = true
        width = img.naturalWidth;
      }
      canvas.height = height;
      canvas.width = width;
      console.log(height, width);
      // add canvas and draw image
      display_element.insertBefore(canvas, null);
      var ctx = canvas.getContext("2d");
      img.onload = function() { // added this (wasn't present in jsPsych plugin, weird...)
        ctx.drawImage(img,0,0,width,height);
      }
      
      // add prompt if there is one
      if (trial.prompt !== null) {
        display_element.insertAdjacentHTML('beforeend', trial.prompt);
      }

    } else {

      // display stimulus as an image element
      var html = '<img src="'+trial.stimulus+'" id="jspsych-image-mouse-response-stimulus">';
      // add prompt
      if (trial.prompt !== null){
        html += trial.prompt;
      }
      // update the page content
      display_element.innerHTML = html;

      // set image dimensions after image has loaded (so that we have access to naturalHeight/naturalWidth)
      var img = display_element.querySelector('#jspsych-image-mouse-response-stimulus');
      if (trial.stimulus_height !== null) {
        height = trial.stimulus_height;
        if (trial.stimulus_width == null && trial.maintain_aspect_ratio) {
          width = img.naturalWidth * (trial.stimulus_height/img.naturalHeight);
        }
      } else {
        height = img.naturalHeight;
      }
      if (trial.stimulus_width !== null) {
        width = trial.stimulus_width;
        if (trial.stimulus_height == null && trial.maintain_aspect_ratio) {
          height = img.naturalHeight * (trial.stimulus_width/img.naturalWidth);
        }
      } else if (!(trial.stimulus_height !== null & trial.maintain_aspect_ratio)) {
        // if stimulus width is null, only use the image's natural width if the width value wasn't set 
        // in the if statement above, based on a specified height and maintain_aspect_ratio = true
        width = img.naturalWidth;
      }
      img.style.height = height.toString() + "px";
      img.style.width = width.toString() + "px";
    }

    // store response
    var response = {
      rt: null,
      key: null
    };

    // function to end trial when it is time
    var end_trial = function() {

      // kill any remaining setTimeout handlers
      jsPsych.pluginAPI.clearAllTimeouts();

      // kill mouse listeners
      document.removeEventListener("click", listener_func);
      document.removeEventListener("contextmenu", listener_func);


      // gather the data to store for the trial
      var trial_data = {
        "rt": response.rt,
        "stimulus": trial.stimulus,
        "mouse_press": response.key // return data
      };

      // clear the display
      display_element.innerHTML = '';

      // move on to the next trial
      jsPsych.finishTrial(trial_data);
    };

    // function to handle responses by the subject
    var after_response = function(info) {

      // after a valid response, the stimulus will have the CSS class 'responded'
      // which can be used to provide visual feedback that a response was recorded
      display_element.querySelector('#jspsych-image-mouse-response-stimulus').className += ' responded';

      // only record the first response
      if (response.key == null) {
        response = info;
      }

      if (trial.response_ends_trial) {
        end_trial();
      }
    };

    // start the response listener
    if (trial.choices != jsPsych.NO_KEYS) {
      
      // generate a Listener Func
      var listener_func = getMouseListener({
        callback_function: after_response,
        valid_responses: trial.choices,
      });

      // add listeners to whole document so it doesn't matter where cursor is located when a click is executed
      // middle button of mouse is currently not supported
      document.addEventListener("click", listener_func);
      document.addEventListener("contextmenu", listener_func);
    }

    // hide stimulus if stimulus_duration is set
    if (trial.stimulus_duration !== null) {
      jsPsych.pluginAPI.setTimeout(function() {
        display_element.querySelector('#jspsych-image-mouse-response-stimulus').style.visibility = 'hidden';
      }, trial.stimulus_duration);
    }

    // end trial if trial_duration is set
    if (trial.trial_duration !== null) {
      jsPsych.pluginAPI.setTimeout(function() {
        end_trial();
      }, trial.trial_duration);
    } else if (trial.response_ends_trial === false) {
      console.warn("The experiment may be deadlocked. Try setting a trial duration or set response_ends_trial to true.");
    }
  };

  return plugin;
})();

// inspired by getKeyboardResponse
var getMouseListener = function(parameters) {
  //parameters are: callback_function, valid_responses

  var start_time = performance.now();

  var listener_function = function(e) {

    e.preventDefault();

    console.log("mouse_pressed: " + e.button) // TODO: debug, remove

    var key_time = performance.now();
    var rt = key_time - start_time;

    // overiding via parameters for testing purposes.
    var minimum_valid_rt = parameters.minimum_valid_rt;
    if(!minimum_valid_rt){
      minimum_valid_rt = jsPsych.initSettings().minimum_valid_rt || 0;
    }

    if(rt < minimum_valid_rt){
      return;
    }

    var valid_response = false;
    if (typeof parameters.valid_responses === 'undefined' || parameters.valid_responses == jsPsych.ALL_KEYS) {
      valid_response = true;
    } else {
      if(parameters.valid_responses != jsPsych.NO_KEYS){

        for (var i = 0; i < parameters.valid_responses.length; i++) {
          var response_option = parameters.valid_responses[i];
          // accept choices like ["left_click", "right_click"]
          if (typeof response_option == 'string') {
            if (response_option in MOUSE_CODE_LOOKUP) {
              if (e.button == MOUSE_CODE_LOOKUP[response_option]) {
                valid_response = true;
              } 
            } else {
              console.log('Warning, "' + response_option + '" is not a valid mouse event');
            }
          } else { // also accept direct keycodes : [0, 2] (left and right click)
            if (e.button == response_option) {
              valid_response = true;
            }
          }
          // check for non int?
        } 
      }
    }

    // check if key was already held down
    // if (((typeof parameters.allow_held_key === 'undefined') || !parameters.allow_held_key) && valid_response) {
    //  if (typeof held_keys[e.keyCode] !== 'undefined' && held_keys[e.keyCode] == true) {
    //    valid_response = false;


    if (valid_response) {
      // if this is a valid response, then we don't want the key event to trigger other actions
      // like scrolling via the spacebar.
      console.log("prev def");
      e.preventDefault();

      parameters.callback_function({
        key: MOUSE_KEYS[e.button],
        rt: rt,
      });
    }
  };
  return listener_function;
};