/**
 * jspsych-survey-text-pro
 * a jspsych plugin for free response survey questions
 *
 * Josh de Leeuw
 * modified by Thomas Marwitz
 *
 * documentation: docs.jspsych.org
 *
 */


 jsPsych.plugins['survey-text-pro'] = (function() {

    var plugin = {};
  
    plugin.info = {
      name: 'survey-text-pro',
      description: '',
      parameters: {
        questions: {
          type: jsPsych.plugins.parameterType.COMPLEX,
          array: true,
          pretty_name: 'Questions',
          default: undefined,
          nested: {
            prompt: {
              type: jsPsych.plugins.parameterType.STRING,
              pretty_name: 'Prompt',
              default: undefined,
              description: 'Prompt for the subject to response'
            },
            placeholder: {
              type: jsPsych.plugins.parameterType.STRING,
              pretty_name: 'Value',
              default: "",
              description: 'Placeholder text in the textfield.'
            },
            rows: {
              type: jsPsych.plugins.parameterType.INT,
              pretty_name: 'Rows',
              default: 1,
              description: 'The number of rows for the response text box.'
            },
            columns: {
              type: jsPsych.plugins.parameterType.INT,
              pretty_name: 'Columns',
              default: 40,
              description: 'The number of columns for the response text box.'
            },
            required: {
              type: jsPsych.plugins.parameterType.BOOL,
              pretty_name: 'Required',
              default: false,
              description: 'Require a response'
            },
            name: {
              type: jsPsych.plugins.parameterType.STRING,
              pretty_name: 'Question Name',
              default: '',
              description: 'Controls the name of data values associated with this question'
            },
            accepted: {
              type: jsPsych.plugins.parameterType.COMPLEX,
              pretty_name: "Accepted answers",
              default: "",
              description: "Controls, what answers should be allowed",
            }
          }
        },
        preamble: {
          type: jsPsych.plugins.parameterType.STRING,
          pretty_name: 'Preamble',
          default: null,
          description: 'HTML formatted string to display at the top of the page above all the questions.'
        },
        button_label: {
          type: jsPsych.plugins.parameterType.STRING,
          pretty_name: 'Button label',
          default:  'Continue',
          description: 'The text that appears on the button to finish the trial.'
        },
        autocomplete: {
          type: jsPsych.plugins.parameterType.BOOL,
          pretty_name: 'Allow autocomplete',
          default: false,
          description: "Setting this to true will enable browser auto-complete or auto-fill for the form."
        }
      }
    }
  
    plugin.trial = function(display_element, trial) {
      if (typeof trial.trial_duration == "undefined") {
        trial.trial_duration = null;
      }
  
      for (var i = 0; i < trial.questions.length; i++) {
        if (typeof trial.questions[i].rows == 'undefined') {
          trial.questions[i].rows = 1;
        }
      }
      for (var i = 0; i < trial.questions.length; i++) {
        if (typeof trial.questions[i].columns == 'undefined') {
          trial.questions[i].columns = 40;
        }
      }
      for (var i = 0; i < trial.questions.length; i++) {
        if (typeof trial.questions[i].value == 'undefined') {
          trial.questions[i].value = "";
        }
      }
  
      var html = '';
      // show preamble text
      if(trial.preamble !== null){
        html += '<div id="jspsych-survey-text-pro-preamble" class="jspsych-survey-text-pro-preamble">'+trial.preamble+'</div>';
      }
      // start form encapsulate inside div
      if (trial.autocomplete) {
        html += '<form id="jspsych-survey-text-pro-form">';
      } else {
        html += '<form id="jspsych-survey-text-pro-form" autocomplete="off">';
      }
      // generate question order
      var question_order = [];
      for(var i=0; i<trial.questions.length; i++){
        question_order.push(i);
      }
      if(trial.randomize_question_order){
        question_order = jsPsych.randomization.shuffle(question_order);
      }
  
      html += "<div style='display:grid;align-content:center'><table>"
      // add questions
      for (var i = 0; i < trial.questions.length; i++) {
        var question = trial.questions[question_order[i]];
        var question_index = question_order[i];
        //html += '<div id="jspsych-survey-text-pro-'+question_index+'" class="jspsych-survey-text-question" style="margin: 1em 0em;">';
        html += `<tr id="jspsych-survey-text-pro-${question_index}" style="font-size:28px">`
        html += "<td>" + question.prompt + '</td>';
        var autofocus = i == 0 ? "autofocus" : "";
        var req = question.required ? "required" : "";
        html += "<td>"
        if(question.rows == 1){
          html += '<input type="text" id="input-'+question_index+'"  name="#jspsych-survey-text-response-' + question_index + '" data-name="'+question.name+'" size="'+question.columns+'" '+autofocus+' '+req+' placeholder="'+question.placeholder+'"></input>';
        } else {
          html += '<textarea id="input-'+question_index+'" name="#jspsych-survey-text-pro-response-' + question_index + '" data-name="'+question.name+'" cols="' + question.columns + '" rows="' + question.rows + '" '+autofocus+' '+req+' placeholder="'+question.placeholder+'"></textarea>';
        }
        html += "</td></tr>"//'</div>';
      }
  
      html += "</table></div>"
  
      // error msg
      html += "<p style='margin:0 0 5 0px;' id='error-msg'></p>"
  
      // add submit button
      html += '<input type="submit" id="jspsych-survey-text-pro-next" class="jspsych-btn jspsych-survey-text-pro" value="'+trial.button_label+'"></input> ';
      
      // add skip button
      if (trial.use_skip_button) {
        html += '<button type="skip" id="jspsych-survey-text-pro-skip" class="jspsych-btn jspsych-survey-text-pro">' + trial.skip_button_label +'</button>';
      }
  
      html += '</form>'
      display_element.innerHTML = html;
  
      // backup in case autofocus doesn't work
      display_element.querySelector('#input-'+question_order[0]).focus();
  
      display_element.querySelector('#jspsych-survey-text-pro-next').addEventListener("click", progressClick);
  
      // ##### evaluate answers #######
      function progressClick(e) {
        e.preventDefault();
        
        // measure response time
        var endTime = performance.now();
        var response_time = endTime - startTime;
  
        // create object to hold responses
        var question_data = {};
        
        for(var index=0; index < trial.questions.length; index++){
          var id = "Q" + index;
          var q_element = document.querySelector('#jspsych-survey-text-pro-'+index).querySelector('textarea, input'); 
          var val = q_element.value.trim(); // to lower, strip whitespaces
          var name = q_element.attributes['data-name'].value;
          if(name == ''){
            name = id;
          }        
          
          if (typeof trial.questions[index].accepted === "string") {
            // regex
            const re = new RegExp(trial.questions[index].accepted, "i") // i flag: ignore case
        
            if (re.exec(val) === null) { // regex didn't match. Display error message
              q_element.value = ""
              q_element.placeholder = trial.not_accepted_text
  
              //display_element.querySelector('#error-msg').innerHTML = `<span style='color: red;font-size:15px'>${trial.not_accepted_text}</span>`
              // TODO: This could be generalized for more than one question!
              return;
            }
  
          } else {
            if (!trial.questions[index].accepted.includes(val)) {
              q_element.value = ""
              display_element.querySelector('#error-msg').innerHTML = `<span style='color: red;'>${trial.not_accepted_text}${val}</span>`
              // TODO: This could be generalized for more than one question!
              return;
            }
          }
  
          var obje = {};
          obje[name] = val.toUpperCase(); // subject id to upperCase
          Object.assign(question_data, obje);
  
  
          
        }
        // save data
        var trialdata = {
          "rt": response_time,
          "responses": question_data,
        };
  
        display_element.innerHTML = '';
  
        // next trial
        jsPsych.finishTrial(trialdata);
      }
  
      var startTime = performance.now();
  
      // end trial if trial_duration is set
      if (trial.trial_duration !== null) {
        jsPsych.pluginAPI.setTimeout(function() {
          
        jsPsych.pluginAPI.clearAllTimeouts();
    
        var trial_data = {
          "rt": null,
          "responses": "too_slow",
        }    
        // clear the display
        display_element.innerHTML = ''
  
        // move on to the next trial
        jsPsych.finishTrial(trial_data);
      
        }, trial.trial_duration);
      }
    };
  
    return plugin;
  })();
  