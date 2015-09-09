/// DO NOT TOUCH!!! ELSE KANCHAN WILL HURT YOU
class ParamUtil 
{       
  // Summary:
  // LoadParameter is used to add possible values to a string response parameter.
  //
  // Parameter inputs:
  //   * report - The Reportal scripting report object
  //   * parameter - The parameter the possible values will be added to 
  //   * parameter_values - An array of objects with a property Code and a property Label.
  //        Example: [{Code: "1", Label: "Answer 1"}, {Code: "2", Label: "Answer 2"}]
  // Returns:
  //   * Nothing returned
  //
  static function LoadParameter (report, parameter, parameter_values) 
  {
    for (var i=0; i<parameter_values.length; ++i) 
    {   
      var a : ParameterValueResponse = new ParameterValueResponse(); 
      a.StringKeyValue = parameter_values[i].Code;
      
      var labels : LanguageTextCollection = new LanguageTextCollection(); 
      labels.Add(new LanguageText(report.CurrentLanguage, parameter_values[i].Label)); 
      
      a.LocalizedLabel = new Label(labels);
      a.StringValue = parameter_values[i].Label;
      
      parameter.Items.Add(a);
    }
  }
  
  static function ClearParameters(state, clear_parameters) {
    for (var i=0; i<clear_parameters.length; ++i)
      state.Parameters[ clear_parameters[i] ] = null;    
  }
      
      
  static function GetParamExpression(param_name, state, report) {
   	var mask = null;
    var mask_type = null;
    
    var question_id = ParamUtil.GetParamCode(state, param_name);
    if (question_id != null) {
      // check masking
      var masking_code = ParamUtil.GetParamCode(state, param_name + '_options');
      switch (masking_code) {
        case '1':
          // do nothing 
          break;
        case '2':
          mask_type = 'MASK';
          var codes=[];
          var selected_codes = ParamUtil.GetParamCodes(state, param_name + '_mask');
          for (var i=0; i<selected_codes.length; ++i)
            	codes.push (selected_codes[i].split('.')[1]);
          mask = codes.join(',');
          break;
          
        case '3':
          mask_type = 'XMASK';
          var codes=[];
          var selected_codes = ParamUtil.GetParamCodes(state, param_name + '_mask');
          for (var i=0; i<selected_codes.length; ++i)
            	codes.push (selected_codes[i].split('.')[1]);
          mask = codes.join(',');
          break;
      }
      var props = [];
      props.push ('totals:false');
      
      if (mask != null && mask != '') {
        props.push (mask_type + ':' + mask);
      }
      return question_id + '{' + props.join(';') + '}';
    }
    return null;
  }
      
  // Summary:
  // Selected is used to return the selected object in parameter based on the code
  // that is currently selected in the parameter.
  //
  // Parameter inputs:
  //   * report - The Reportal scripting report object
  //   * state - The Reportal scripting state object.
  //   * dataSourceNodeId - The id of the data source node the parameters are based on.
  //   * parameterName - The name of the parameter`
  // Returns:
  //   * The object matching the currently selected code from the parameter.
  //
  static function Selected(report, state, dataSourceNodeId, parameterName, log)
  {
    var paramValues = GetParameterList(report, dataSourceNodeId, parameterName, state, log);
    var currentCode = GetParamCode(state, parameterName);
    for(var i = 0; i < paramValues.length; i++)
    {
      if(paramValues[i].Code == currentCode)
        return paramValues[i];    
    }
  }

  static function Selected(report, state, parameterName, log)
  {
    var paramValues = ParamLists.Get(parameterName, state, report, null, log); //ParameterList(report, dataSourceNodeId, parameterName, state);
    var currentCode = GetParamCode(state, parameterName);
    for(var i = 0; i < paramValues.length; i++)
    {
      if(paramValues[i].Code == currentCode)
        return paramValues[i];    
    }
  }
  
  static function Contains (state, parameter_name, code) {
  	var codes =  GetParamCodes (state, parameter_name);
    for (var i=0; i<codes.length; ++i)
      	if (codes[i].toUpperCase() == code.toUpperCase())
          	return true;

    return false;
  }
  
  static function HideOptions(state, param_name) {
      
      	var is_question_selected = (ParamUtil.GetParamCode(state, param_name) != null);
      	var is_show_all_selected = (ParamUtil.GetParamCode(state, param_name + '_options') == '1');
      	var hide = !is_question_selected || is_show_all_selected;
      
        return hide;
    }
        
	static function Save (state, report, param_name, value) {

		var a : ParameterValueResponse = new ParameterValueResponse();	
		a.StringKeyValue = value;

		var lbls : LanguageTextCollection = new LanguageTextCollection(); 
		lbls.Add(new LanguageText(report.CurrentLanguage, value)); 
		a.LocalizedLabel = new Label(lbls);
		a.StringValue = value;

		state.Parameters[param_name] = a;

	}  
  
  
  // Summary:
  // GetParamCode is used to get the current code value of a given string response parameter
  // where the string response parameter has an associated list of selectable items.
  //
  // Parameter inputs:
  //   * state - The Reportal scripting state object.
  //   * parameter_name - The name of the string response parameter to get the value from.
  // Returns:
  //   * The string code value of the given parameter. If the parameter does not have a string
  //     code value null is returned.
  //
  static function GetParamCode (state, parameterName)
  {
    if (state.Parameters.IsNull(parameterName)) 
      return null;
    
    var parameterValueResponse : ParameterValueResponse = state.Parameters[parameterName];
   
    return parameterValueResponse.StringKeyValue;
  }
 

  // Summary:
  // GetParamCodes is used to get the code values of a given multi select parameter.
  //
  // Parameter inputs:
  //   * state - The Reportal scripting state object.
  //   * parameter_name - The name of the string response multi select parameter to get the 
  //     value from.
  // Returns:
  //   * An array of string values with the selected items of the multi select parameter passed
  //     in the the function. If no string values are selected an empty array is returned.
  //
  static function GetParamCodes (state, parameter_name)
  {
    var p : ParameterValueMultiSelect = state.Parameters[parameter_name];
    var o = [];
    if (p != null) 
    {
      for (var enumerator : Enumerator = new Enumerator(p) ; !enumerator.atEnd(); enumerator.moveNext())
      {
        var pvr : ParameterValueResponse = enumerator.item();
        o.push (pvr.StringKeyValue);
      }
    }
  
    return o;
  }
  
  static function GetParameterList(report, dataSourceNodeId, parameterName, state, log)
  {
	var paramValues = [];
    var questions = MetaData.GetQuestions2(report, DS.Main, true, log);
    if (state == null)
    	var functionName = "ParamLists." + parameterName.toUpperCase() + "(questions, log)";
	else      
	    var functionName = "ParamLists." + parameterName.toUpperCase() + "(questions, state, report, log)";
    eval("paramValues = " + functionName);
   	
    return paramValues; 
  }
  
  static function NextParameterValue(report, state, ds, parameterName, log) 
  {
    NavigateParameter(report, state, ds, parameterName, NextPreviousNavigation.Next, log);
  }
	
  static function PreviousParameterValue(report, state, ds, parameterName, log)
  {
    NavigateParameter(report, state, ds, parameterName, NextPreviousNavigation.Previous, log);
  }
  
  private static function NavigateParameter(report, state, ds, parameterName, naviagation, log)
  {
    var parameterState = GetParameterState(report, state, ds, parameterName, log);
    var index = GetNextOrPreviousIndex(parameterState, naviagation);
    var code = parameterState.ParameterValues[index].Code;
    Save (state, report, parameterName, code);
  }
  
  private static function GetParameterState(report, state, ds, parameterName, log)
  {
    var code = GetParamCode(state, parameterName);
    var parameterValues = GetParameterValues(report, state, ds, parameterName, log);
    return {
      ParameterValues: parameterValues,
      CurrentIndex: FindCodesIndex(parameterValues, code)
    }
  }
  
  private static function GetNextOrPreviousIndex(parameterState, naviagation)
  {
    switch(naviagation)
    {
      case NextPreviousNavigation.Next:
        return (parameterState.CurrentIndex == parameterState.ParameterValues.length - 1) ? 0 : (parameterState.CurrentIndex + 1);
      case NextPreviousNavigation.Previous:
        return (parameterState.CurrentIndex == 0) ? (parameterState.ParameterValues.length - 1) : (parameterState.CurrentIndex - 1);
    }
  }
  
  private static function GetParameterValues(report, state, ds, parameterName, log)
  {
    try
    {
      return GetParameterList(report, ds, parameterName, null, log);
    }
    catch (e)
    {
	  return ParamLists.Get(parameterName, state, report);        
    }
  }
	
  private static function FindCodesIndex(parameterValues, code) 
  {
    for (var i = 0; i < parameterValues.length; ++i)
      if (parameterValues[i].Code == code)
        return i;
	}  
}

public enum NextPreviousNavigation
{
  Next,
  Previous
}