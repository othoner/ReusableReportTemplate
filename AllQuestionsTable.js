class AllQuestionsTable
{
  private var _report;
  private var _table;
  private var _questions;
  private var _log;
  
  function AllQuestionsTable(report, table, log)
  {
    _report = report;
    _table = table;
    _questions = MetaData.GetQuestions2(report, DS.Main, true, log);
    if(log)
      _log = log;
  }
  
  function CreateColumnHeaderSegment()
  {
    var headerSegment : HeaderSegment = new HeaderSegment();
    var label : Label = new Label();
    label.Texts.Add(new LanguageText(9, "Total"));
    headerSegment.Label = label;
    headerSegment.DataSourceNodeId = DS.Main;
    return headerSegment;
  }
  
  function CreateRowHeaderExpression()
  {
    var rowHeaders = [];
    var i = 0;
    var numberOfQuestions = GetNumberOfQuestionsInTable(_questions);
    while(i < numberOfQuestions)
    {
      var question = _questions[i];
      if(question.QuestionType != QuestionType.OpenText && 
         question.QuestionType != QuestionType.MultiOpen && 
         question.QuestionType != QuestionType.MultiNumeric && 
         question.QuestionType != QuestionType.Loop && 
         question.QuestionType != QuestionType.Numeric &&
         question.QuestionType != QuestionType.Grid3D)
      {
        var expression = "";
        var varibleId = question.QuestionId;
        rowHeaders.push(CreateVariableExpression(question, varibleId));
      }
      i++;
    }
    return rowHeaders.join("+");
  }
  
  function GetNumberOfQuestionsInTable()
  {
    return _questions.length < Config.MaxNumberOfQuestionsOnAllQuestionsPage ? _questions.length : Config.MaxNumberOfQuestionsOnAllQuestionsPage;
  }
  
  function CreateVariableExpression(question, variableId)
  {
    var expression = "(" + variableId + "{title:true";
    if(MetaData.IsInCategory(question, "sort"))
    {
      expression += ";sort:sortEnabled,desc";
    }
    if (MetaData.HasScores(question, _log))
    {
      expression += ";statistics:avg,stdev";
    }
    expression += "}";
    expression += ")";
    return expression;
  }
  
  function ApplySortingToRows()
  {
    for(var j = 0; j < _table.RowHeaders.Count; j++)
    {
      var rowHeader : Header = _table.RowHeaders[j];
      if(rowHeader.Sorting.Direction == TableSortDirection.Descending)
      {
        var sortInfo = CreateSortInfo(2);
        rowHeader.Sorting = sortInfo;
      }
    }
  }
   
  function CreateSortInfo(sortPosition)
  {
    var sortInfo : SortInfo = new SortInfo();
    sortInfo.Enabled = true;
    sortInfo.Direction = TableSortDirection.Descending;
    sortInfo.SortByType = TableSortByType.Position;
    sortInfo.Position = sortPosition;
    return sortInfo;
  }
}