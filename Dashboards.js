class Dashboards
{
  static function CreateDashboardTable(report, datasourceId, table, dashboardChartNumber, log)
  {
    var dashboardQuestions = ReportMetaData.GetDashboardQuestions(report, datasourceId, log);
    if(dashboardQuestions.length > dashboardChartNumber - 1)
    { 
      var question = dashboardQuestions[dashboardChartNumber - 1];
      AddRowHeader(report, table, question);
      if(question.QuestionType == QuestionType.Grid)
      {
        SetGridSpecificProperties(table);
      }
      SortTable(report, table, question, log);
    }
  }
  
  private static function AddRowHeader(report, table, question)
  {
    var rowsExpression = question.QuestionId + "{totals:false}";
    table.AddHeaders(report, DS.Main, rowsExpression);
  }

  private static function SetGridSpecificProperties(table)
  {
    CollapseFirstRowQuestion(table);
    table.Distribution = CreateDistribution();
    AddCategoriesColumnHeader(table);
  }
  
  private static function CollapseFirstRowQuestion(table)
  {
    var rowQuestion : HeaderQuestion = table.RowHeaders[0];
    rowQuestion.IsCollapsed = true;
  }
  
  private static function CreateDistribution()
  {
    var distribution : DistributionFormat = new DistributionFormat();
    distribution.Count = false;
    distribution.HorizontalPercents = true;
    distribution.VerticalPercents = false;
    return distribution;
  }
   
  private static function AddCategoriesColumnHeader(table)
  {
    var categories : HeaderCategories = new HeaderCategories();
    categories.Totals = false;
    table.ColumnHeaders.Add(categories);
  }
  
  private static function SortTable(report, table, question, log)
  {
    TableUtil.ApplySorting(table, question, 0, 1);
  }
  
  static function CreateDashboardChartTitle(report, datasourceId, dashboardChartNumber, log)
  {
    var dashboardQuestions = ReportMetaData.GetDashboardQuestions(report, datasourceId, log);
    if(dashboardQuestions.length > dashboardChartNumber-1)
    {
      return dashboardQuestions[dashboardChartNumber-1].Title;
      var questionId = dashboardQuestions[dashboardChartNumber-1].QuestionId;
      var question = MetaData.GetQuestion2(report, datasourceId, questionId, false, log);
      return question.Title;
    }
    return "";
  }
  
  static function DisplayLegend(report, chart, chartNumber, log)
  {
    if(log)
      log.LogDebug("DisplayLegend1");
    var dashboardQuestions = ReportMetaData.GetDashboardQuestions(report, DS.Main);
    if(log)
      log.LogDebug("DisplayLegend");
    if(dashboardQuestions.length > chartNumber - 1)
    {     
      var question = dashboardQuestions[chartNumber - 1];
      if(question.QuestionType == QuestionType.Grid)
      {
        
        if (question.Answers.length == 1) {
          chart.SeriesInRows = true;
          chart.Legend.Enabled = false; 
        }
        else {
	        chart.Legend.Enabled = true;
        }
      }
    }
  }
}