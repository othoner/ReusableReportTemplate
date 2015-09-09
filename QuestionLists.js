class QuestionLists
{
  static var maxLabelLength = 100;
  
  static function CreateParameterValues(question, log)
  {
    var parameterValues = [];
    switch (question.QuestionType) 
    {
      case QuestionType.Multi:
	  case QuestionType.Single:
	    parameterValues.push(CreateSingleOrMultiParameterValue(question));
	    break;
	  case QuestionType.Grid:
	    parameterValues = parameterValues.concat(CreateGridParameterValues(question));
	    break;
    }
    return parameterValues;    
  }
  
  static function CreateSingleOrMultiParameterValue(question)
  {
    var label = CreateSingleOrMultiLabel(question);
	var parameterValue =  {
        Label: label,
		Code: question.QuestionId
	  };
    return parameterValue;
  }
  
  static function CreateSingleOrMultiLabel(question)
  {
    var label = [HelperUtil.RemoveHtml(question.QuestionId.toUpperCase()) + ' > ', HelperUtil.RemoveHtml(question.Title)].join(' ');
    label = TruncateLabel(label);
    return label;
  }
  
  static function CreateGridParameterValues(question)
  {
    var parameterValues = []
    var answers = question.Answers;
	for (var i = 0; i < answers.length; ++i) 
    {
      var label = CreateGridLabel(question, answers[i]);
	  parameterValues.push({
        Label: label,
	    Code: [question.QuestionId, answers[i].Code].join('.')
	  });
	}
    return parameterValues;
  }
  
  static function CreateGridLabel(question, answer)
  {
    var label = [
        question.QuestionId + '.' + answer.Code + ' > ', 
          HelperUtil.RemoveHtml(answer.Text + ' (' + question.Text  + ')')
        ].join(' ');
    label = TruncateLabel(label);
    return label; 
  }
  
  static function TruncateLabel(label)
  {
    if(label.length > maxLabelLength)
      label = label.substring(0,maxLabelLength-4) + " ...";
    return label;
  }
}