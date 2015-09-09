class IndividualQuestionsTable
{
  private var _report;
  private var _table;
  private var _variableId;
  private var _question;
  private var _log;
  
  function IndividualQuestionsTable(report, table, variableId, log)
  {
    _report = report;
    _table = table;
    _variableId = variableId;
    _question = GetQuestion(variableId);
    if(log)
      _log = log;
  }
  
  function GetQuestion(variableId)
  {
    var variableSections = variableId.split('.');
    var questionId = variableSections[0];
    var question = MetaData.GetQuestion2(_report, DS.Main, questionId, true, _log);
    return question;
  }
  
  function CreateTableExpression()
  { 
    var rowExpression = CreateRowExpression();
    var columnExpression = CreateColumnExpression();
    var tableExpression = [rowExpression, columnExpression].join('^');
    return tableExpression;
  }
  
  private function CreateRowExpression()
  {
    var headerQuestionProperties = GetHeaderQuestionProperties(_question);
    var rowExpression = _variableId + '{' + headerQuestionProperties + '}';
    return rowExpression;
  }
      
  private function GetHeaderQuestionProperties(question)
  {
    var headerQuestionProperties = [];
    headerQuestionProperties.push ("totals: true");
    switch (question.QuestionType)
    {
      case QuestionType.Multi:
        headerQuestionProperties.push ("collapsed:true");
        break;
      default:
        headerQuestionProperties.push ("collapsed:false");
        break;
    }
    if(MetaData.HasScores(question))
      headerQuestionProperties.push("statistics:avg,stdev")
    return headerQuestionProperties.join(";");
  }
  
  private function CreateColumnExpression()
  {
    return '[Base]+[SEGMENT]{label:"Pct"}';
  }

  function ApplySorting(rowHeaderPosition, sortPosition)
  {
    TableUtil.ApplySorting(_table, _question, 0, 2);
  }
  
  function AddChartColumn()
  {
    var rowCount = GetRowCount();
    TableUtil.AddFrontChartColumn(_report, _table, rowCount);
  }
  
  private function GetRowCount()
  {
    var answers;
    switch (_question.QuestionType) 
    {
      case QuestionType.Grid:
        answers = _question.Scale;
   	    break; 
      default:
  	    answers = _question.Answers;  
    }
    return (answers.length + 1);
  }
}